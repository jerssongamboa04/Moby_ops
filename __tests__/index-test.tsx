import {
    render,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native';

import Index from '../app/index';
import { i18n } from '../src/i18n';
import { supabase } from '../src/lib/supabase/client';

jest.mock('../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));

const mockSignInWithPassword = jest.mocked(
  supabase.auth.signInWithPassword
);

describe('<Index />', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    mockSignInWithPassword.mockReset();
  });

  test('renders the sign-in screen in English', async () => {
    await render(<Index />);

    expect(screen.getByText('Keep Dublin moving.')).toBeOnTheScreen();
    expect(
      screen.getByText('Sign in to access your operations workspace.')
    ).toBeOnTheScreen();
    expect(
      screen.queryByText('Internal operations prototype')
    ).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password')).toBeOnTheScreen();
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

    await user.press(screen.getByRole('button', { name: 'ES' }));

    expect(
      await screen.findByText('Mantén Dublín en movimiento.')
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Inicia sesión para acceder a tu espacio de operaciones.'
      )
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('Correo electrónico')).toBeOnTheScreen();
    expect(screen.getByLabelText('Contraseña')).toBeOnTheScreen();
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

    expect(passwordInput).toHaveProp('secureTextEntry', true);

    await user.press(
      screen.getByRole('button', { name: 'Show password' })
    );

    expect(passwordInput).toHaveProp('secureTextEntry', false);
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
      () => new Promise(() => { })
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

});