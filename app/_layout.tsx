import '@/src/i18n';

import * as Linking from 'expo-linking';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
    useAuthCallbackStore,
} from '@/src/features/auth/store/auth-callback-store';
import {
    registerAuthAutoRefresh,
} from '@/src/lib/supabase/auth-auto-refresh';
import {
    registerAuthLinking,
} from '@/src/lib/supabase/auth-linking';
import { supabase } from '@/src/lib/supabase/client';

export default function RootLayout() {
  useEffect(() => {
    const unregisterAutoRefresh =
      registerAuthAutoRefresh(supabase, AppState);

    const unregisterAuthLinking = registerAuthLinking(
      supabase,
      Linking,
      () => {
        useAuthCallbackStore.getState().markAsError();
      },
      (result) => {
        if (result.type !== 'invite') {
          useAuthCallbackStore.getState().markAsError();
          return;
        }

        useAuthCallbackStore.getState().markAsSuccess();
        router.replace('/auth/set-password');
      },
      () => {
        useAuthCallbackStore.getState().startProcessing();
      }
    );

    return () => {
      unregisterAuthLinking();
      unregisterAutoRefresh();
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}