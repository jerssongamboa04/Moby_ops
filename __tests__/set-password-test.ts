import {
    setPassword,
    type SetPasswordClient,
} from '../src/lib/supabase/set-password';

describe('setPassword', () => {
  test('sends the password to the authenticated user update', async () => {
    const updateUser = jest.fn().mockResolvedValue({
      data: {
        user: { id: 'employee-1' },
      },
      error: null,
    });

    const client: SetPasswordClient = {
      auth: {
        updateUser,
      },
    };

    await setPassword(client, 'StrongPass1!');

    expect(updateUser).toHaveBeenCalledTimes(1);
    expect(updateUser).toHaveBeenCalledWith({
      password: 'StrongPass1!',
    });
  });

  test('propagates an error returned by the auth service', async () => {
    const authError = new Error('Password update failed');

    const client: SetPasswordClient = {
      auth: {
        updateUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: authError,
        }),
      },
    };

    await expect(
      setPassword(client, 'StrongPass1!')
    ).rejects.toBe(authError);
  });

  test('propagates a rejected request', async () => {
    const networkError = new Error('Network unavailable');

    const client: SetPasswordClient = {
      auth: {
        updateUser: jest.fn().mockRejectedValue(networkError),
      },
    };

    await expect(
      setPassword(client, 'StrongPass1!')
    ).rejects.toBe(networkError);
  });
});