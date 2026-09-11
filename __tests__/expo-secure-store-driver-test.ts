import * as SecureStore from 'expo-secure-store';

import { expoSecureStoreDriver } from '../src/lib/supabase/expo-secure-store-driver';

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('expoSecureStoreDriver', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses device-only encrypted storage for every operation', async () => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValue('stored-session');

    const options = {
      keychainAccessible:
        SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    };

    await expect(
      expoSecureStoreDriver.getItemAsync('session')
    ).resolves.toBe('stored-session');

    await expoSecureStoreDriver.setItemAsync(
      'session',
      'session-value'
    );

    await expoSecureStoreDriver.deleteItemAsync('session');

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      'session',
      options
    );

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'session',
      'session-value',
      options
    );

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'session',
      options
    );
  });
});