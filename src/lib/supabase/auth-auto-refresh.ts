export type AppLifecycleState =
  | 'active'
  | 'background'
  | 'inactive'
  | 'unknown'
  | 'extension';

export type AppStateSubscription = {
  remove: () => void;
};

export type AppStateDriver = {
  currentState: AppLifecycleState;
  addEventListener: (
    event: 'change',
    listener: (state: AppLifecycleState) => void
  ) => AppStateSubscription;
};

export type AuthAutoRefreshClient = {
  auth: {
    startAutoRefresh: () => void;
    stopAutoRefresh: () => void;
  };
};

export function registerAuthAutoRefresh(
  client: AuthAutoRefreshClient,
  appState: AppStateDriver
): () => void {
  const synchronizeAutoRefresh = (
    state: AppLifecycleState
  ) => {
    if (state === 'active') {
      client.auth.startAutoRefresh();
      return;
    }

    client.auth.stopAutoRefresh();
  };

  const subscription = appState.addEventListener(
    'change',
    synchronizeAutoRefresh
  );

  synchronizeAutoRefresh(appState.currentState);

  return () => {
    subscription.remove();
    client.auth.stopAutoRefresh();
  };
}