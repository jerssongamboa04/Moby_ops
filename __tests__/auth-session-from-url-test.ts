import {
    createSessionFromAuthUrl,
    type AuthSessionClient,
} from '../src/lib/supabase/auth-session-from-url';

describe('createSessionFromAuthUrl', () => {
  test('creates a session from an invitation callback', async () => {
    const setSession = jest.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'employee-1',
          },
        },
      },
      error: null,
    });

    const client: AuthSessionClient = {
      auth: {
        setSession,
      },
    };

    const result = await createSessionFromAuthUrl(
      client,
      'mobyops://auth/callback#access_token=access-token&refresh_token=refresh-token&type=invite'
    );

    expect(setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });

    expect(result).toEqual({
      handled: true,
      type: 'invite',
    });
  });

  test('ignores URLs that are not authentication callbacks', async () => {
    const setSession = jest.fn();

    const client: AuthSessionClient = {
      auth: {
        setSession,
      },
    };

    const result = await createSessionFromAuthUrl(
      client,
      'mobyops://somewhere-else'
    );

    expect(setSession).not.toHaveBeenCalled();
    expect(result).toEqual({
      handled: false,
    });
  });

  test('reports an error returned in the callback URL', async () => {
    const client: AuthSessionClient = {
      auth: {
        setSession: jest.fn(),
      },
    };

    await expect(
      createSessionFromAuthUrl(
        client,
        'mobyops://auth/callback#error=access_denied&error_description=Invitation%20expired'
      )
    ).rejects.toThrow('Invitation expired');
  });

  describe('createSessionFromAuthUrl supported callback types', () => {
    test.each([
      ['recovery', '&type=recovery'],
      ['missing', ''],
    ])(
      'does not establish a session for a %s callback type',
      async (_caseName, typeParameter) => {
        const setSession = jest.fn().mockResolvedValue({
          data: {
            session: null,
          },
          error: null,
        });

        const client: AuthSessionClient = {
          auth: {
            setSession,
          },
        };

        const url =
          'mobyops://auth/callback' +
          '#access_token=test-access-token' +
          '&refresh_token=test-refresh-token' +
          typeParameter;

        await expect(
          createSessionFromAuthUrl(client, url)
        ).rejects.toThrow(
          'Unsupported authentication callback type'
        );

        expect(setSession).not.toHaveBeenCalled();
      }
    );
  });
});