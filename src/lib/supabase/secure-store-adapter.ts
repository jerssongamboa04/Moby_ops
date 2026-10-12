const DEFAULT_CHUNK_SIZE = 512;
const MANIFEST_VERSION = 1;

let generationCounter = 0;

export type SecureStoreDriver = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};

export type SupabaseStorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export type SecureStoreAdapterOptions = {
  chunkSize?: number;
  createGeneration?: () => string;
};

type StorageManifest = {
  version: 1;
  generation: string;
  chunkCount: number;
};

function createDefaultGeneration(): string {
  generationCounter += 1;

  return `${Date.now().toString(36)}-${generationCounter.toString(36)}`;
}

function getManifestKey(key: string): string {
  return `${key}.manifest`;
}

function getChunkKey(
  key: string,
  generation: string,
  index: number
): string {
  return `${key}.chunk.${generation}.${index}`;
}

function splitValue(value: string, chunkSize: number): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < value.length; index += chunkSize) {
    chunks.push(value.slice(index, index + chunkSize));
  }

  return chunks.length > 0 ? chunks : [''];
}

function parseManifest(value: string | null): StorageManifest | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }

    const manifest = parsed as Record<string, unknown>;

    if (
      manifest.version !== MANIFEST_VERSION ||
      typeof manifest.generation !== 'string' ||
      typeof manifest.chunkCount !== 'number' ||
      !Number.isInteger(manifest.chunkCount) ||
      manifest.chunkCount < 1
    ) {
      return null;
    }

    return {
      version: MANIFEST_VERSION,
      generation: manifest.generation,
      chunkCount: manifest.chunkCount,
    };
  } catch {
    return null;
  }
}

async function deleteChunks(
  secureStore: SecureStoreDriver,
  key: string,
  manifest: StorageManifest
): Promise<void> {
  for (let index = 0; index < manifest.chunkCount; index += 1) {
    await secureStore.deleteItemAsync(
      getChunkKey(key, manifest.generation, index)
    );
  }
}

export function createSecureStoreAdapter(
  secureStore: SecureStoreDriver,
  options: SecureStoreAdapterOptions = {}
): SupabaseStorageAdapter {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const createGeneration =
    options.createGeneration ?? createDefaultGeneration;

  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new Error('SecureStore chunk size must be a positive integer.');
  }

  return {
    async getItem(key) {
      const storedManifest = await secureStore.getItemAsync(
        getManifestKey(key)
      );

      if (storedManifest === null) {
        return secureStore.getItemAsync(key);
      }

      const manifest = parseManifest(storedManifest);

      if (!manifest) {
        return null;
      }

      const chunks: string[] = [];

      for (
        let index = 0;
        index < manifest.chunkCount;
        index += 1
      ) {
        const chunk = await secureStore.getItemAsync(
          getChunkKey(key, manifest.generation, index)
        );

        if (chunk === null) {
          return null;
        }

        chunks.push(chunk);
      }

      return chunks.join('');
    },

    async setItem(key, value) {
      const previousManifest = parseManifest(
        await secureStore.getItemAsync(getManifestKey(key))
      );

      const generation = createGeneration();

      if (
        !generation ||
        !/^[A-Za-z0-9._-]+$/.test(generation)
      ) {
        throw new Error(
          'SecureStore generation contains invalid characters.'
        );
      }

      const chunks = splitValue(value, chunkSize);
      const writtenChunkKeys: string[] = [];

      try {
        for (let index = 0; index < chunks.length; index += 1) {
          const chunkKey = getChunkKey(key, generation, index);

          await secureStore.setItemAsync(chunkKey, chunks[index]);
          writtenChunkKeys.push(chunkKey);
        }

        const manifest: StorageManifest = {
          version: MANIFEST_VERSION,
          generation,
          chunkCount: chunks.length,
        };

        await secureStore.setItemAsync(
          getManifestKey(key),
          JSON.stringify(manifest)
        );
      } catch (error) {
        for (const chunkKey of writtenChunkKeys) {
          try {
            await secureStore.deleteItemAsync(chunkKey);
          } catch {
            // Preserve the original storage error.
          }
        }

        throw error;
      }

      // Removes values created by the previous single-item adapter.
      await secureStore.deleteItemAsync(key);

      if (
        previousManifest &&
        previousManifest.generation !== generation
      ) {
        await deleteChunks(secureStore, key, previousManifest);
      }
    },

    async removeItem(key) {
      const manifest = parseManifest(
        await secureStore.getItemAsync(getManifestKey(key))
      );

      if (manifest) {
        await deleteChunks(secureStore, key, manifest);
      }

      await secureStore.deleteItemAsync(getManifestKey(key));

      // Also removes a possible value from the old adapter format.
      await secureStore.deleteItemAsync(key);
    },
  };
}