import '@/src/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
    registerAuthAutoRefresh,
} from '@/src/lib/supabase/auth-auto-refresh';
import { supabase } from '@/src/lib/supabase/client';

export default function RootLayout() {
  useEffect(() => {
    return registerAuthAutoRefresh(
      supabase,
      AppState
    );
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}