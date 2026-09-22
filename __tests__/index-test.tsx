import {
    render,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native';

import Index from '../app/index';
import {
    useAuthStatus,
} from '../src/features/auth/hooks/use-auth-status';
import {
    useAuthCallbackStore,
} from '../src/features/auth/store/auth-callback-store';
import { i18n } from '../src/i18n';
import { supabase } from '../src/lib/supabase/client';
import {
    getOwnProfile,
} from '../src/lib/supabase/get-own-profile';

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
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

const mockSignInWithPassword = jest.mocked(
  supabase.auth.signInWithPassword
);
const mockSignOut = jest.mocked(supabase.auth.signOut);
const mockUseAuthStatus = jest.mocked(useAuthStatus);
const mockGetOwnProfile = jest.mocked(getOwnProfile);

describe('<Index />', () => {
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

  test('renders the sign-in screen in English', async () => {
    await render(<Index />);

    expect(
      screen.getByText('Keep Dublin moving.')
    ).toBeOnTheScreen();

    expect(
      screen.getByText(
        'Sign in to access your operations workspace.'
      )
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Internal operations prototype')
    ).not.toBeOnTheScreen();

    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();

    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('changes the sign-in screen to Spanish', async () => {
    const user = userEvent.setup();

    await render(<Index />);

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
      await screen.findByText('Mantén Dublín en movimiento.')
    ).toBeOnTheScreen();

    expect(
      screen.getByText(
        'Inicia sesión para acceder a tu espacio de operaciones.'
      )
    ).toBeOnTheScreen();

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

    await render(<Index />);

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

    await render(<Index />);

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

    await render(<Index />);

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

    await render(<Index />);

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

    await render(<Index />);

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

    await render(<Index />);

    expect(
      await screen.findByText('Your operations workspace')
    ).toBeOnTheScreen();

    expect(
      screen.queryByLabelText('Password')
    ).not.toBeOnTheScreen();

    expect(mockGetOwnProfile).toHaveBeenCalledWith(supabase);
  });

  test('keeps the workspace hidden during an invitation callback', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    useAuthCallbackStore.getState().startProcessing();

    await render(<Index />);

    expect(
      screen.queryByText('Your operations workspace')
    ).not.toBeOnTheScreen();

    expect(
      screen.getByText('Loading your session...')
    ).toBeOnTheScreen();

    expect(mockGetOwnProfile).not.toHaveBeenCalled();
  });

  test('returns to sign in when the session ends', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    const { rerender } = await render(<Index />);

    await screen.findByText('Your operations workspace');

    mockUseAuthStatus.mockReturnValue('unauthenticated');
    await rerender(<Index />);

    expect(
      screen.getByRole('button', { name: 'Sign in' })
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Your operations workspace')
    ).not.toBeOnTheScreen();
  });

  test('requests local sign out from the workspace', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockSignOut.mockResolvedValue({ error: null });

    const user = userEvent.setup();

    await render(<Index />);

    await screen.findByText('Your operations workspace');

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    expect(mockSignOut).toHaveBeenCalledWith({
      scope: 'local',
    });
  });

  test('allows retry when workspace sign out fails', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');

    mockSignOut.mockRejectedValue(
      new Error('Network unavailable')
    );

    const user = userEvent.setup();

    await render(<Index />);

    await screen.findByText('Your operations workspace');

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

    await render(<Index />);

    expect(
      await screen.findByText('Access not enabled')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Your operations workspace')
    ).not.toBeOnTheScreen();

    expect(
      screen.getByRole('button', { name: 'Sign out' })
    ).toBeEnabled();
  });

  test('blocks operations when the profile is missing', async () => {
    mockUseAuthStatus.mockReturnValue('authenticated');
    mockGetOwnProfile.mockResolvedValue(null);

    await render(<Index />);

    expect(
      await screen.findByText('Account setup pending')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Your operations workspace')
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

    await render(<Index />);

    expect(
      await screen.findByText('We could not check your access')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Your operations workspace')
    ).not.toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', { name: 'Check again' })
    );

    expect(
      await screen.findByText('Your operations workspace')
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

    await render(<Index />);

    await screen.findByText('Access not enabled');

    await user.press(
      screen.getByRole('button', { name: 'Sign out' })
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    expect(mockSignOut).toHaveBeenCalledWith({
      scope: 'local',
    });
  });
});