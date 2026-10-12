import {
    registerAuthLinking,
    type AuthLinkingDriver,
} from '../src/lib/supabase/auth-linking';
import {
    createSessionFromAuthUrl,
    type AuthSessionClient,
} from '../src/lib/supabase/auth-session-from-url';


jest.mock(
  '../src/lib/supabase/auth-session-from-url',
  () => ({
    createSessionFromAuthUrl: jest.fn(),
  })
);

describe('registerAuthLinking', () => {
  test('handles the initial URL and URLs received while open', async () => {
    let urlListener:
      | ((event: { url: string }) => void)
      | undefined;

    const subscription = {
      remove: jest.fn(),
    };

    const linking: AuthLinkingDriver = {
      getInitialURL: jest
        .fn()
        .mockResolvedValue(
          'mobyops://auth/callback#type=invite'
        ),
      addEventListener: jest.fn(
        (_event, listener) => {
          urlListener = listener;

          return subscription;
        }
      ),
    };

    const client: AuthSessionClient = {
      auth: {
        setSession: jest.fn(),
      },
    };

    jest
      .mocked(createSessionFromAuthUrl)
      .mockResolvedValue({
        handled: true,
        type: 'invite',
      });

    const unregister = registerAuthLinking(
      client,
      linking
    );

    await Promise.resolve();
    await Promise.resolve();

    expect(createSessionFromAuthUrl).toHaveBeenCalledWith(
      client,
      'mobyops://auth/callback#type=invite'
    );

    urlListener?.({
      url: 'mobyops://auth/callback#type=invite&source=email',
    });

    await Promise.resolve();

    expect(createSessionFromAuthUrl).toHaveBeenCalledWith(
      client,
      'mobyops://auth/callback#type=invite&source=email'
    );

    unregister();

    expect(subscription.remove).toHaveBeenCalledTimes(1);
  });
  test('reports errors produced while processing a URL', async () => {
    const authError = new Error('Invitation expired');
    const onError = jest.fn();

    const subscription = {
      remove: jest.fn(),
    };

    const linking: AuthLinkingDriver = {
      getInitialURL: jest
        .fn()
        .mockResolvedValue(
          'mobyops://auth/callback#error=access_denied'
        ),
      addEventListener: jest.fn(() => subscription),
    };

    const client: AuthSessionClient = {
      auth: {
        setSession: jest.fn(),
      },
    };

    jest
      .mocked(createSessionFromAuthUrl)
      .mockRejectedValueOnce(authError);

    const unregister = registerAuthLinking(
      client,
      linking,
      onError
    );

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledWith(authError);

    unregister();
  });
  describe('registerAuthLinking session notification', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('notifies when an invitation session is ready', async () => {
      const subscription = {
        remove: jest.fn(),
      };

      const linking: AuthLinkingDriver = {
        getInitialURL: jest.fn().mockResolvedValue(
          'mobyops://auth/callback#type=invite'
        ),
        addEventListener: jest.fn(() => subscription),
      };

      const client: AuthSessionClient = {
        auth: {
          setSession: jest.fn(),
        },
      };

      const onError = jest.fn();
      const onSessionReady = jest.fn();

      jest
        .mocked(createSessionFromAuthUrl)
        .mockResolvedValueOnce({
          handled: true,
          type: 'invite',
        });

      const unregister = registerAuthLinking(
        client,
        linking,
        onError,
        onSessionReady
      );

      try {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(onSessionReady).toHaveBeenCalledTimes(1);
        expect(onSessionReady).toHaveBeenCalledWith({
          handled: true,
          type: 'invite',
        });

        expect(onError).not.toHaveBeenCalled();
      } finally {
        unregister();
      }
    });

    test('does not notify for an unrelated URL', async () => {
      const subscription = {
        remove: jest.fn(),
      };

      const linking: AuthLinkingDriver = {
        getInitialURL: jest.fn().mockResolvedValue(
          'mobyops://somewhere-else'
        ),
        addEventListener: jest.fn(() => subscription),
      };

      const client: AuthSessionClient = {
        auth: {
          setSession: jest.fn(),
        },
      };

      const onError = jest.fn();
      const onSessionReady = jest.fn();

      jest
        .mocked(createSessionFromAuthUrl)
        .mockResolvedValueOnce({
          handled: false,
        });

      const unregister = registerAuthLinking(
        client,
        linking,
        onError,
        onSessionReady
      );

      try {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(createSessionFromAuthUrl).toHaveBeenCalledWith(
          client,
          'mobyops://somewhere-else'
        );

        expect(onSessionReady).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
      } finally {
        unregister();
      }
    });
  });

  describe('registerAuthLinking processing notification', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('notifies before processing an authentication callback', async () => {
      const linking: AuthLinkingDriver = {
        getInitialURL: jest.fn().mockResolvedValue(
          'mobyops://auth/callback#type=invite'
        ),
        addEventListener: jest.fn(() => ({
          remove: jest.fn(),
        })),
      };

      const client: AuthSessionClient = {
        auth: {
          setSession: jest.fn(),
        },
      };

      const onProcessingStarted = jest.fn();
      let wasNotifiedBeforeProcessing = false;

      jest
        .mocked(createSessionFromAuthUrl)
        .mockImplementationOnce(async () => {
          wasNotifiedBeforeProcessing =
            onProcessingStarted.mock.calls.length === 1;

          return {
            handled: true,
            type: 'invite',
          };
        });

      const unregister = registerAuthLinking(
        client,
        linking,
        jest.fn(),
        jest.fn(),
        onProcessingStarted
      );

      try {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(onProcessingStarted).toHaveBeenCalledTimes(1);
        expect(wasNotifiedBeforeProcessing).toBe(true);
      } finally {
        unregister();
      }
    });

    test('does not announce processing for an unrelated URL', async () => {
      const linking: AuthLinkingDriver = {
        getInitialURL: jest.fn().mockResolvedValue(
          'mobyops://somewhere-else'
        ),
        addEventListener: jest.fn(() => ({
          remove: jest.fn(),
        })),
      };

      const client: AuthSessionClient = {
        auth: {
          setSession: jest.fn(),
        },
      };

      const onProcessingStarted = jest.fn();

      jest
        .mocked(createSessionFromAuthUrl)
        .mockResolvedValueOnce({
          handled: false,
        });

      const unregister = registerAuthLinking(
        client,
        linking,
        jest.fn(),
        jest.fn(),
        onProcessingStarted
      );

      try {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(linking.getInitialURL).toHaveBeenCalledTimes(1);
        expect(onProcessingStarted).not.toHaveBeenCalled();
      } finally {
        unregister();
      }
    });
  });
});