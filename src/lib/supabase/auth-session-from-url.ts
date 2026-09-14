import 'react-native-url-polyfill/auto';
import { isAuthCallbackUrl } from './auth-callback-url';

export type AuthSessionClient = {
  auth: {
    setSession: (tokens: {
      access_token: string;
      refresh_token: string;
    }) => Promise<{
      error: {
        message: string;
      } | null;
    }>;
  };
};

export type AuthSessionFromUrlResult =
  | {
    handled: false;
  }
  | {
    handled: true;
    type: string | null;
  };

function getCallbackParameter(
  url: URL,
  parameter: string
): string | null {
  const queryParameters = new URLSearchParams(url.search);
  const fragmentParameters = new URLSearchParams(
    url.hash.replace(/^#/, '')
  );

  return (
    fragmentParameters.get(parameter) ??
    queryParameters.get(parameter)
  );
}

export async function createSessionFromAuthUrl(
  client: AuthSessionClient,
  url: string
): Promise<AuthSessionFromUrlResult> {

  if (!isAuthCallbackUrl(url)) {
    return {
      handled: false,
    };
  }

  const callbackUrl = new URL(url);

  const errorDescription = getCallbackParameter(
    callbackUrl,
    'error_description'
  );

  const errorCode =
    getCallbackParameter(callbackUrl, 'error_code') ??
    getCallbackParameter(callbackUrl, 'error');

  if (errorCode) {
    throw new Error(
      errorDescription ?? 'Authentication callback failed'
    );
  }
  const callbackType = getCallbackParameter(
    callbackUrl,
    'type'
  );

  if (callbackType !== 'invite') {
    throw new Error(
      'Unsupported authentication callback type'
    );
  }
  const accessToken = getCallbackParameter(
    callbackUrl,
    'access_token'
  );

  const refreshToken = getCallbackParameter(
    callbackUrl,
    'refresh_token'
  );

  if (!accessToken || !refreshToken) {
    throw new Error(
      'Authentication callback is missing session tokens'
    );
  }

  const { error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw error;
  }

  return {
    handled: true,
    type: callbackType,
  };
}