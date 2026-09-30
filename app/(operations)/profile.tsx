import { router } from 'expo-router';

import { ProfileScreen } from '@/src/features/operations/screens/profile-screen';
import { supabase } from '@/src/lib/supabase/client';

export default function ProfileRoute() {
  const handleSignOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
    router.replace('/');
  };

  return <ProfileScreen onSignOut={handleSignOut} />;
}
