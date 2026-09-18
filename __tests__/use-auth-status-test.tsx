import type {
    AuthChangeEvent,
    Session,
    SupabaseClient,
} from '@supabase/supabase-js';
import {
    act,
    renderHook,
} from '@testing-library/react-native';

import {
    useAuthStatus,
} from '../src/features/auth/hooks/use-auth-status';

type AuthListener = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

describe('useAuthStatus', () => {
  let listener: AuthListener;
  let unsubscribe: jest.Mock;
  let client: Pick<SupabaseClient, 'auth'>;

  // Only the presence of a session matters for these tests.
  const session = {
    user: { id: 'employee-1' },
  } as Session;

  beforeEach(() => {
    unsubscribe = jest.fn();

    client = {
      auth: {
        onAuthStateChange: jest.fn(
          (callback: AuthListener) => {
            listener = callback;

            return {
              data: {
                subscription: { unsubscribe },
              },
            };
          }
        ),
      },
    } as unknown as Pick<SupabaseClient, 'auth'>;
  });

  test('waits for the initial session', async () => {
    const { result } = await renderHook(() =>
      useAuthStatus(client)
    );

    expect(result.current).toBe('loading');
  });

  test('restores an existing session', async () => {
    const { result } = await renderHook(() =>
      useAuthStatus(client)
    );

    await act(async () => {
      listener('INITIAL_SESSION', session);
    });

    expect(result.current).toBe('authenticated');
  });

  test('reacts to sign in and sign out', async () => {
    const { result } = await renderHook(() =>
      useAuthStatus(client)
    );

    await act(async () => {
      listener('INITIAL_SESSION', null);
    });

    expect(result.current).toBe('unauthenticated');

    await act(async () => {
      listener('SIGNED_IN', session);
    });

    expect(result.current).toBe('authenticated');

    await act(async () => {
      listener('SIGNED_OUT', null);
    });

    expect(result.current).toBe('unauthenticated');
  });

  test('unsubscribes when the component unmounts', async () => {
    const { unmount } = await renderHook(() =>
      useAuthStatus(client)
    );

    await unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});