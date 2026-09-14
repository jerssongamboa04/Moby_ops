import { router } from 'expo-router';

import {
    AuthCallbackScreen,
} from '@/src/features/auth/screens/auth-callback-screen';
import {
    useAuthCallbackStore,
} from '@/src/features/auth/store/auth-callback-store';

export default function AuthCallbackRoute() {
  const status = useAuthCallbackStore(
    (state) => state.status
  );

  const reset = useAuthCallbackStore(
    (state) => state.reset
  );

  const handleBackToSignIn = (): void => {
    reset();
    router.replace('/');
  };

  if (status === 'idle' || status === 'success') {
    return null;
  }

  return (
    <AuthCallbackScreen
      status={status}
      onBackToSignIn={handleBackToSignIn}
    />
  );
}