import * as SecureStore from 'expo-secure-store';

import {
    createSecureStoreAdapter,
    type SecureStoreDriver,
} from './secure-store-adapter';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible:
    SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const expoSecureStoreDriver: SecureStoreDriver = {
  getItemAsync(key) {
    return SecureStore.getItemAsync(key, secureStoreOptions);
  },

  setItemAsync(key, value) {
    return SecureStore.setItemAsync(
      key,
      value,
      secureStoreOptions
    );
  },

  deleteItemAsync(key) {
    return SecureStore.deleteItemAsync(
      key,
      secureStoreOptions
    );
  },
};

export const supabaseSecureStorage =
  createSecureStoreAdapter(expoSecureStoreDriver);