import {
    registerAuthAutoRefresh,
    type AppLifecycleState,
    type AppStateDriver,
    type AuthAutoRefreshClient,
} from '../src/lib/supabase/auth-auto-refresh';

describe('registerAuthAutoRefresh', () => {
  test('refreshes the session only while the app is active', () => {
    let listener:
      | ((state: AppLifecycleState) => void)
      | undefined;

    const subscription = {
      remove: jest.fn(),
    };

    const appState: AppStateDriver = {
      currentState: 'active',
      addEventListener: jest.fn(
        (
          _event,
          nextListener
        ) => {
          listener = nextListener;

          return subscription;
        }
      ),
    };

    const client: AuthAutoRefreshClient = {
      auth: {
        startAutoRefresh: jest.fn(),
        stopAutoRefresh: jest.fn(),
      },
    };

    const unregister = registerAuthAutoRefresh(
      client,
      appState
    );

    expect(
      client.auth.startAutoRefresh
    ).toHaveBeenCalledTimes(1);

    expect(appState.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    listener?.('background');

    expect(
      client.auth.stopAutoRefresh
    ).toHaveBeenCalledTimes(1);

    listener?.('active');

    expect(
      client.auth.startAutoRefresh
    ).toHaveBeenCalledTimes(2);

    unregister();

    expect(subscription.remove).toHaveBeenCalledTimes(1);

    expect(
      client.auth.stopAutoRefresh
    ).toHaveBeenCalledTimes(2);
  });
});