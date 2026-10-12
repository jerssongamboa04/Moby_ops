import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export type EvidencePhoto = { uri: string; capturedAt: string; size: number };
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function removeLocalPhoto(uri: string) {
  try { const file = new File(uri); if (file.exists) file.delete(); } catch { /* Cache eviction may already have removed it. */ }
}

export async function prepareEvidencePhoto(photo: { uri: string; width: number; height: number }): Promise<EvidencePhoto> {
  const capturedAt = new Date().toISOString();
  const context = ImageManipulator.manipulate(photo.uri);
  let output: string | undefined;
  try {
    if (Math.max(photo.width, photo.height) > 1600) {
      context.resize(photo.width >= photo.height ? { width: 1600 } : { height: 1600 });
    }
    const rendered = await context.renderAsync();
    try {
      const result = await rendered.saveAsync({ format: SaveFormat.WEBP, compress: 0.8 });
      output = result.uri;
      const size = new File(result.uri).size;
      if (!size || size > MAX_PHOTO_BYTES) throw new Error('Photo size invalid');
      return { uri: result.uri, capturedAt, size };
    } finally { rendered.release(); }
  } catch (error) {
    if (output) removeLocalPhoto(output);
    throw error;
  } finally {
    context.release();
    removeLocalPhoto(photo.uri);
  }
}
