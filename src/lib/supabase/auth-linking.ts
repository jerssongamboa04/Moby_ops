import { isAuthCallbackUrl } from './auth-callback-url';
import {
    createSessionFromAuthUrl,
    type AuthSessionClient,
    type AuthSessionFromUrlResult,
} from './auth-session-from-url';

export type AuthLinkingSubscription = {
  remove: () => void;
};

export type AuthLinkingDriver = {
  getInitialURL: () => Promise<string | null>;
  addEventListener: (
    event: 'url',
    listener: (event: { url: string }) => void
  ) => AuthLinkingSubscription;
};

export type AuthLinkingErrorHandler = (
  error: unknown
) => void;

export type AuthSessionReadyHandler = (
  result: Extract<
    AuthSessionFromUrlResult,
    { handled: true }
  >
) => void;

export type AuthProcessingStartedHandler = () => void;

export function registerAuthLinking(
  client: AuthSessionClient,
  linking: AuthLinkingDriver,
  onError?: AuthLinkingErrorHandler,
  onSessionReady?: AuthSessionReadyHandler,
  onProcessingStarted?: AuthProcessingStartedHandler
): () => void {
  let isRegistered = true;

  const reportError = (error: unknown) => {
    if (isRegistered) {
      onError?.(error);
    }
  };

  const handleUrl = (url: string) => {
    if (isAuthCallbackUrl(url)) {
      onProcessingStarted?.();
    }

    void createSessionFromAuthUrl(client, url)
      .then((result) => {
        if (!isRegistered || !result.handled) {
          return;
        }

        onSessionReady?.(result);
      })
      .catch(reportError);
  };

  const subscription = linking.addEventListener(
    'url',
    ({ url }) => {
      if (isRegistered) {
        handleUrl(url);
      }
    }
  );

  void linking
    .getInitialURL()
    .then((initialUrl) => {
      if (isRegistered && initialUrl) {
        handleUrl(initialUrl);
      }
    })
    .catch(reportError);

  return () => {
    isRegistered = false;
    subscription.remove();
  };
}