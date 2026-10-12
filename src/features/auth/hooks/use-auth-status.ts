import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

type AuthClient = Pick<SupabaseClient, 'auth'>;

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export function useAuthStatus(client: AuthClient): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isActive = true;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      setStatus(
        session ? 'authenticated' : 'unauthenticated'
      );
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [client]);

  return status;
}