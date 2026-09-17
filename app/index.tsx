import { SignInScreen } from '@/src/features/auth/screens/sign-in-screen';
import { supabase } from '@/src/lib/supabase/client';
import { signIn } from '@/src/lib/supabase/sign-in';

export default function Index() {
  const handleSubmit = async (
    email: string,
    password: string
  ): Promise<void> => {
    await signIn(supabase, email, password);
  };

  return <SignInScreen onSubmit={handleSubmit} />;
}