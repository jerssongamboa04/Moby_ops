import { useSyncExternalStore } from 'react';
import {
    act,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native';

import { ExpoRoot } from 'expo-router';
import { getMockContext, renderRouter } from 'expo-router/testing-library';
import OperationsLayout from '../app/(operations)/_layout';
import Home from '../app/(operations)/index';
import Tasks from '../app/(operations)/tasks';
import Profile from '../app/(operations)/profile';

import ForgotPasswordRoute from '../app/auth/forgot-password';

const routes = {
  'auth/forgot-password': ForgotPasswordRoute,
  '(operations)/_layout': OperationsLayout,
  '(operations)/index': Home,
  '(operations)/tasks': Tasks,
  '(operations)/profile': Profile,
};

async function renderIndex(initialUrl = '/') {
  return await renderRouter(routes, { initialUrl });
}

import {
    useAuthStatus,
} from '../src/features/auth/hooks/use-auth-status';
import {
    useAuthCallbackStore,
} from '../src/features/auth/store/auth-callback-store';
import { i18n } from '../src/i18n';
import { supabase } from '../src/lib/supabase/client';
import { readOwnTasks } from '../src/lib/supabase/read-own-tasks';
import {
    getOwnProfile,
} from '../src/lib/supabase/get-own-profile';

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('../src/features/auth/hooks/use-auth-status', () => ({
  useAuthStatus: jest.fn(),
}));

jest.mock('../src/lib/supabase/get-own-profile', () => ({
  getOwnProfile: jest.fn(),
}));

jest.mock('../src/lib/supabase/read-own-tasks', () => ({
  readOwnTasks: jest.fn(async () => ({
    today: '2026-09-26', current_month: '2026-09-01', period: '2026-09-26', refresh_after_ms: 3600000,
    total: 0, counted: 0, repeated: 0, has_more: false, days: [], items: [],
  })),
}));

const mockSignInWithPassword = jest.mocked(
  supabase.auth.signInWithPassword
);
const mockSignOut = jest.mocked(supabase.auth.signOut);
const mockUseAuthStatus = jest.mocked(useAuthStatus);
const mockGetOwnProfile = jest.mocked(getOwnProfile);

describe('Operational routes', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');

    mockSignInWithPassword.mockReset();
    mockSignOut.mockReset();

    mockUseAuthStatus.mockReset();
    mockUseAuthStatus.mockReturnValue('unauthenticated');

    mockGetOwnProfile.mockReset();
    mockGetOwnProfile.mockResolvedValue({
      id: 'employee-1',
      role: 'employee',
      is_active: true,
    });

    useAuthCallbackStore.getState().reset();
  });

  test('opens recovery from login, requests a link and returns', async () => {
    jest.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    await renderIndex();
    await user.press(screen.getByText('Forgot password?'));
    await user.type(screen.getByLabelText('Email'), 'worker@example.com');
    await user.press(screen.getByRole('button', { name: 'Send link' }));
    expect(await screen.findByText(/If an account is associated/)).toBeOnTheScreen();
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('worker@example.com', { redirectTo: 'mobyops://auth/callback' });
    await user.press(screen.getByText('Back to sign in'));
    expect(await screen.findByLabelText('Keep Dublin moving.')).toBeOnTheScreen();
  });

  test('renders the sign-in screen in English', async () => {
    await renderIndex();

    expect(
      screen.getByLabelText('Keep Dublin moving.')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('YOUR CITY. YOUR IMPACT.')
    ).not.toBeOnTheScreen();

    expect(
      screen.queryByText('Internal operations prototype')
    ).not.toBeOnTheScreen();

    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText('Email')).toBeOnTheScreen();
    expect(screen.getByText('Sign in and get your day moving.')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();

    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('changes the sign-in screen to Spanish', async () => {
    const user = userEvent.setup();

    await renderIndex();

    expect(
      screen.getByRole('button', { name: 'EN' })
    ).toBeSelected();

    expect(
      screen.getByRole('button', { name: 'ES' })
    ).not.toBeSelected();

    await user.press(
      screen.getByRole('button', { name: 'ES' })
    );

    expect(
      await screen.findByLabelText('Mantén Dublín en movimiento.')
    ).toBeOnTheScreen();
    expect(screen.getByText('Entra y pon tu jornada en marcha.')).toBeOnTheScreen();

    expect(
      screen.queryByText('TU CIUDAD. TU IMPACTO.')
    ).not.toBeOnTheScreen();

    expect(
      screen.getByLabelText('Correo electrónico')
    ).toBeOnTheScreen();

    expect(
      screen.getByLabelText('Contraseña')
    ).toBeOnTheScreen();

    expect(
      screen.getByRole('button', { name: 'EN' })
    ).not.toBeSelected();

    expect(
      screen.getByRole('button', { name: 'ES' })
    ).toBeSelected();
  });

  test('enables sign in when both fields are completed', async () => {
    const user = userEvent.setup();

    await renderIndex();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', {
      name: 'Sign in',
    });

    expect(signInButton).toBeDisabled();

    await user.type(emailInput, 'employee@moby.ie');

    expect(signInButton).toBeDisabled();

    await user.type(passwordInput, 'secure-password');

    expect(signInButton).toBeEnabled();
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();

    await renderIndex();

    const passwordInput = screen.getByLabelText('Password');

    expect(passwordInput).toHaveProp(
      'secureTextEntry',
      true
    );

    await user.press(
      screen.getByRole('button', { name: 'Show password' })
    );

    expect(passwordInput).toHaveProp(
      'secureTextEntry',
      false
    );

    expect(
      screen.getByRole('button', { name: 'Hide password' })
    ).toBeOnTheScreen();
  });

  test('submits credentials and allows retry after an error', async () => {
    mockSignInWithPassword.mockRejectedValue(
      new Error('Request failed')
    );

    const user = userEvent.setup();

    await renderIndex();

    await user.type(
      screen.getByLabelText('Email'),
      'employee@moby.ie'
    );

    await user.type(
      screen.getByLabelText('Password'),
      'StrongPass1!'
    );

    await user.press(
      screen.getByRole('button', { name: 'Sign in' })
    );

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'employee@moby.ie',
      password: 'StrongPass1!',
    });

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'We could not sign you in. Check your email, password and connection, then try again.'
    );

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeEnabled();

    await user.press(
      screen.getByRole('button', { name: 'Sign in' })
    );

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledTimes(2);
    });
  });

  test('disables submission while the request is pending', async () => {
    mockSignInWithPassword.mockImplementation(
      () => new Promise(() => {})
    );

    const user = userEvent.setup();

    await renderIndex();

    await user.type(
      screen.getByLabelText('Email'),
      'employee@moby.ie'
    );

    await user.type(
      screen.getByLabelText('Password'),
      'StrongPass1!'
    );

    await user.press(
      screen.getByRole('button', { name: 'Sign in' })
    );

    const pendingButton = await screen.findByRole('button', {
      name: 'Signing in...',
    });

    expect(pendingButton).toBeDisabled();

    expect(screen.getByLabelText('Email')).toHaveProp(
      'editable',
      false
    );

    expect(screen.getByLabelText('Password')).toHaveProp(
      'editable',
      false
    );

    await user.press(pendingButton);

    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
  });

  test('shows loading before the session is known', async () => {
    mockUseAuthStatus.mockReturnValue('loading');

    await renderIndex();

    expect(
      screen.getByText('Loading your session...')
    ).toBeOnTheScreen();

    expect(
      screen.queryByRole('button', { name: 'Sign in' })
    ).not.toBeOnTheScreen();

    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('shows the workspace with an authenticated session and active profile', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    await renderIndex();

    expect(
      await screen.findByText('Public Order')
    ).toBeOnTheScreen();

    expect(
      screen.queryByLabelText('Password')
    ).not.toBeOnTheScreen();

    expect(mockGetOwnProfile).toHaveBeenCalledWith(supabase);
  });

  test('keeps the workspace hidden during an invitation callback', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    useAuthCallbackStore.getState().startProcessing();

    await renderIndex();

    expect(
      screen.queryByText('Public Order')
    ).not.toBeOnTheScreen();

    expect(
      screen.getByText('Loading your session...')
    ).toBeOnTheScreen();

    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('returns to sign in when the session ends', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    const { rerender } = await renderIndex();

    await screen.findByText('Public Order');

    mockUseAuthStatus.mockReturnValue('unauthenticated');
    await rerender(<ExpoRoot context={getMockContext(routes)} />);

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Public Order')
    ).not.toBeOnTheScreen();
  });

  test('requests local sign out from Profile', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockSignOut.mockResolvedValue({ error: null });

    const user = userEvent.setup();

    await renderIndex();

    await screen.findByText('Public Order');
    await user.press(screen.getByTestId('tab-profile'));

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    expect(mockSignOut).toHaveBeenCalledWith({
      scope: 'local',
    });
  });

  test('allows retry when Profile sign out fails', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    mockSignOut.mockRejectedValue(
      new Error('Network unavailable')
    );

    const user = userEvent.setup();

    await renderIndex();

    await screen.findByText('Public Order');
    await user.press(screen.getByTestId('tab-profile'));

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent(
      'We could not sign you out. Please try again.'
    );

    expect(
      screen.getByRole('button', { name: 'Sign out' })
    ).toBeEnabled();

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(2);
    });
  });

  test('blocks operations for an inactive profile', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    mockGetOwnProfile.mockResolvedValue({
      id: 'employee-1',
      role: 'employee',
      is_active: false,
    });

    await renderIndex();

    expect(
      await screen.findByText('Access not enabled')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Public Order')
    ).not.toBeOnTheScreen();

    expect(
      screen.getByRole('button', { name: 'Sign out' })
    ).toBeEnabled();
  });

  test('blocks operations when the profile is missing', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockGetOwnProfile.mockResolvedValue(null);

    await renderIndex();

    expect(
      await screen.findByText('Account setup pending')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Public Order')
    ).not.toBeOnTheScreen();
  });

  test('allows retry after a profile query error', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    mockGetOwnProfile
      .mockRejectedValueOnce(new Error('Network unavailable'))
      .mockResolvedValueOnce({
        id: 'employee-1',
        role: 'employee',
        is_active: true,
      });

    const user = userEvent.setup();

    await renderIndex();

    expect(
      await screen.findByText('We could not check your access')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Public Order')
    ).not.toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', { name: 'Check again' })
    );

    expect(
      await screen.findByText('Public Order')
    ).toBeOnTheScreen();

    expect(mockGetOwnProfile).toHaveBeenCalledTimes(2);
  });

  test('allows an inactive user to sign out', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    mockGetOwnProfile.mockResolvedValue({
      id: 'employee-1',
      role: 'employee',
      is_active: false,
    });

    mockSignOut.mockResolvedValue({ error: null });

    const user = userEvent.setup();

    await renderIndex();

    await screen.findByText('Access not enabled');

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    expect(mockSignOut).toHaveBeenCalledWith({
      scope: 'local',
    });
  });

  test('preserves the draft across Tasks and Profile and does not expose logout on Home', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    const user = userEvent.setup();
    await renderIndex();
    await screen.findByLabelText('Bicycle ID');
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeOnTheScreen();
    await user.type(screen.getByLabelText('Bicycle ID'), 'BIKE-42');
    await user.type(screen.getByLabelText('Notes (optional)'), 'Keep this note');
    await user.press(screen.getByRole('checkbox', { name: 'Bicycle locked' }));
    await user.press(screen.getByTestId('tab-tasks'));
    expect(await screen.findByText('No activity recorded for this period.')).toBeOnTheScreen();
    await user.press(screen.getByTestId('tab-profile'));
    expect(await screen.findByRole('button', { name: 'Sign out' })).toBeOnTheScreen();
    await user.press(screen.getByTestId('tab-home'));
    expect(screen.getByLabelText('Bicycle ID')).toHaveProp('value', 'BIKE-42');
    expect(screen.getByLabelText('Notes (optional)')).toHaveProp('value', 'Keep this note');
    expect(screen.getByRole('checkbox', { name: 'Bicycle locked' })).toBeChecked();
    const readsBeforeReturn = jest.mocked(readOwnTasks).mock.calls.length;
    await user.press(screen.getByTestId('tab-tasks'));
    await screen.findByText('No activity recorded for this period.');
    expect(jest.mocked(readOwnTasks).mock.calls.length).toBeGreaterThan(readsBeforeReturn);
  });

  test.each(['/tasks', '/profile'])('protects direct access to %s for an inactive employee', async (initialUrl) => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockGetOwnProfile.mockResolvedValue({ id: 'employee-1', role: 'employee', is_active: false });
    await renderIndex(initialUrl);
    expect(await screen.findByText('Access not enabled')).toBeOnTheScreen();
    expect(screen.queryByTestId('tab-home')).not.toBeOnTheScreen();
  });

  test('translates the navigation into Spanish', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    await i18n.changeLanguage('es');
    await renderIndex();
    expect(await screen.findByLabelText('Inicio')).toBeOnTheScreen();
    expect(screen.getByLabelText('Actuaciones')).toBeOnTheScreen();
    expect(screen.getByLabelText('Perfil')).toBeOnTheScreen();
  });

  test.each(['/tasks', '/profile'])('requires a session for direct access to %s', async (initialUrl) => {
    await renderIndex(initialUrl);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByTestId('tab-home')).not.toBeOnTheScreen();
    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('keeps Profile open when Supabase returns a logout error', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockSignOut.mockResolvedValue({ error: new Error('Logout rejected') } as Awaited<ReturnType<typeof supabase.auth.signOut>>);
    const user = userEvent.setup();
    await renderIndex('/profile');
    await user.press(await screen.findByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not sign you out. Please try again.');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
  });

  test('clears the draft on logout and starts the next session on Home', async () => {
    let status: 'authenticated' | 'unauthenticated' = 'authenticated';
    const listeners = new Set<() => void>();
    mockUseAuthStatus.mockImplementation(function useTestAuthStatus() {
      return useSyncExternalStore(
        (listener) => {
          listeners.add(listener);
          return () => { listeners.delete(listener); };
        },
        () => status
      );
    });
    mockSignOut.mockImplementation(async () => {
      status = 'unauthenticated';
      listeners.forEach((listener) => listener());
      return { error: null };
    });
    const user = userEvent.setup();
    await renderIndex();
    await user.type(await screen.findByLabelText('Bicycle ID'), 'PRIVATE-DRAFT');
    await user.press(screen.getByTestId('tab-profile'));
    await user.press(await screen.findByRole('button', { name: 'Sign out' }));
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeOnTheScreen();
    expect(screen.queryByTestId('tab-home')).not.toBeOnTheScreen();
    await act(async () => {
      status = 'authenticated';
      listeners.forEach((listener) => listener());
    });
    expect(await screen.findByLabelText('Bicycle ID')).toHaveProp('value', '');
  });

  test('changes language from Profile without losing the Home draft', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    const user = userEvent.setup();
    await renderIndex();
    await user.type(await screen.findByLabelText('Bicycle ID'), 'BIKE-ES');
    await user.press(screen.getByTestId('tab-profile'));
    await user.press(await screen.findByRole('button', { name: 'Español' }));
    expect(screen.getByRole('button', { name: 'Español' })).toBeSelected();
    expect(screen.getByRole('button', { name: 'English' })).not.toBeSelected();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeOnTheScreen();
    await user.press(screen.getByTestId('tab-home'));
    expect(screen.getByLabelText('ID de la bicicleta')).toHaveProp('value', 'BIKE-ES');
  });
});
