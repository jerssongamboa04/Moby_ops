import {
    createSecureStoreAdapter,
    type SecureStoreDriver,
} from '../src/lib/supabase/secure-store-adapter';

type MemorySecureStore = SecureStoreDriver & {
    values: Map<string, string>;
};

function createMemorySecureStore(
    maxValueLength = Number.POSITIVE_INFINITY
): MemorySecureStore {
    const values = new Map<string, string>();

    return {
        values,

        getItemAsync: jest.fn(async (key: string) => {
            return values.get(key) ?? null;
        }),

        setItemAsync: jest.fn(
            async (key: string, value: string) => {
                if (value.length > maxValueLength) {
                    throw new Error('SecureStore value is too large.');
                }

                values.set(key, value);
            }
        ),

        deleteItemAsync: jest.fn(async (key: string) => {
            values.delete(key);
        }),
    };
}

describe('createSecureStoreAdapter', () => {
    test('stores, reads and removes a session value', async () => {
        const secureStore = createMemorySecureStore();
        const adapter = createSecureStoreAdapter(secureStore);

        await adapter.setItem('session', 'session-value');

        await expect(adapter.getItem('session')).resolves.toBe(
            'session-value'
        );

        await adapter.removeItem('session');

        await expect(adapter.getItem('session')).resolves.toBeNull();
    });
    test('splits and restores a session that exceeds the storage limit', async () => {
        const secureStore = createMemorySecureStore(100);

        const adapter = createSecureStoreAdapter(secureStore, {
            chunkSize: 80,
            createGeneration: () => 'generation-1',
        });

        const longSession = 'session-data-'.repeat(20);

        await adapter.setItem('session', longSession);

        await expect(adapter.getItem('session')).resolves.toBe(
            longSession
        );
    });
});