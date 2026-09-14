import {
    act,
    render,
} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { AppState } from 'react-native';
import {
    useAuthCallbackStore,
} from '../src/features/auth/store/auth-callback-store';

import RootLayout from '../app/_layout';
import {
    registerAuthAutoRefresh,
} from '../src/lib/supabase/auth-auto-refresh';
import {
    registerAuthLinking,
} from '../src/lib/supabase/auth-linking';
import { supabase } from '../src/lib/supabase/client';

jest.mock('expo-router', () => ({
  Stack: () => null,
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(),
  addEventListener: jest.fn(),
}));

jest.mock(
  '../src/lib/supabase/auth-auto-refresh',
  () => ({
    registerAuthAutoRefresh: jest.fn(),
  })
);

jest.mock(
  '../src/lib/supabase/auth-linking',
  () => ({
    registerAuthLinking: jest.fn(),
  })
);

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    auth: {},
  },
}));

describe('<RootLayout />', () => {
  const unregisterAutoRefresh = jest.fn();
  const unregisterAuthLinking = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest
      .mocked(registerAuthAutoRefresh)
      .mockReturnValue(unregisterAutoRefresh);

    jest
      .mocked(registerAuthLinking)
      .mockReturnValue(unregisterAuthLinking);
  });

  test('registers and removes Supabase auth services', async () => {
    const { unmount } = await render(<RootLayout />);

    expect(registerAuthAutoRefresh).toHaveBeenCalledWith(
      supabase,
      AppState
    );

    const registration = jest
      .mocked(registerAuthLinking)
      .mock.calls[0];

    expect(registration).toBeDefined();
    expect(registration?.[0]).toBe(supabase);
    expect(registration?.[1]).toBe(Linking);

    await unmount();

    expect(unregisterAuthLinking).toHaveBeenCalledTimes(1);
    expect(unregisterAutoRefresh).toHaveBeenCalledTimes(1);
  });

  test('opens password setup after an invitation is processed', async () => {
    await render(<RootLayout />);

    const onSessionReady = jest
      .mocked(registerAuthLinking)
      .mock.calls[0]?.[3];

    expect(onSessionReady).toEqual(expect.any(Function));
    expect(router.replace).not.toHaveBeenCalled();

    await act(async () => {
      onSessionReady?.({
        handled: true,
        type: 'invite',
      });
    });

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith(
      '/auth/set-password'
    );
  });

  test('shows an error for an unsupported callback type', async () => {
    useAuthCallbackStore.getState().reset();
    useAuthCallbackStore.getState().startProcessing();

    await render(<RootLayout />);

    const onSessionReady = jest
      .mocked(registerAuthLinking)
      .mock.calls[0]?.[3];

    expect(onSessionReady).toEqual(expect.any(Function));

    await act(async () => {
      onSessionReady?.({
        handled: true,
        type: 'recovery',
      });
    });

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('error');

    expect(router.replace).not.toHaveBeenCalled();
  });

  describe('<RootLayout /> callback state', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      useAuthCallbackStore.getState().reset();

      jest
        .mocked(registerAuthAutoRefresh)
        .mockReturnValue(jest.fn());

      jest
        .mocked(registerAuthLinking)
        .mockReturnValue(jest.fn());
    });

    test('records an error reported by the listener', async () => {
      useAuthCallbackStore.getState().startProcessing();

      await render(<RootLayout />);

      const onError = jest
        .mocked(registerAuthLinking)
        .mock.calls[0]?.[2];

      expect(onError).toEqual(expect.any(Function));

      await act(async () => {
        onError?.(new Error('Invitation processing failed'));
      });

      expect(
        useAuthCallbackStore.getState().status
      ).toBe('error');

      expect(router.replace).not.toHaveBeenCalled();
    });

    test('records success before navigating to password setup', async () => {
      useAuthCallbackStore.getState().startProcessing();

      let statusAtNavigation: string | undefined;

      jest.mocked(router.replace).mockImplementationOnce(() => {
        statusAtNavigation =
          useAuthCallbackStore.getState().status;
      });

      await render(<RootLayout />);

      const onSessionReady = jest
        .mocked(registerAuthLinking)
        .mock.calls[0]?.[3];

      expect(onSessionReady).toEqual(expect.any(Function));

      await act(async () => {
        onSessionReady?.({
          handled: true,
          type: 'invite',
        });
      });

      expect(
        useAuthCallbackStore.getState().status
      ).toBe('success');

      expect(statusAtNavigation).toBe('success');

      expect(router.replace).toHaveBeenCalledWith(
        '/auth/set-password'
      );
    });
  });

  describe('<RootLayout /> callback processing', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      useAuthCallbackStore.getState().reset();

      jest
        .mocked(registerAuthAutoRefresh)
        .mockReturnValue(jest.fn());

      jest
        .mocked(registerAuthLinking)
        .mockReturnValue(jest.fn());
    });

    test('starts processing a new invitation after a previous error', async () => {
      useAuthCallbackStore.getState().markAsError();

      await render(<RootLayout />);

      expect(
        useAuthCallbackStore.getState().status
      ).toBe('error');

      const onProcessingStarted = jest
        .mocked(registerAuthLinking)
        .mock.calls[0]?.[4];

      expect(onProcessingStarted).toEqual(
        expect.any(Function)
      );

      await act(async () => {
        onProcessingStarted?.();
      });

      expect(
        useAuthCallbackStore.getState().status
      ).toBe('processing');

      expect(router.replace).not.toHaveBeenCalled();
    });
  });
});