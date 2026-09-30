import { router } from 'expo-router';
import { ForgotPasswordScreen } from '@/src/features/auth/screens/forgot-password-screen';
import { supabase } from '@/src/lib/supabase/client';
import { requestPasswordReset } from '@/src/lib/supabase/request-password-reset';

export default function ForgotPasswordRoute() {
  return <ForgotPasswordScreen onSubmit={(email) => requestPasswordReset(supabase, email)} onBack={() => router.replace('/')} />;
}
