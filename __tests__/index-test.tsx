import {
    render,
    screen,
    userEvent,
} from '@testing-library/react-native';

import Index from '../app/index';
import { i18n } from '../src/i18n';

describe('<Index />', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
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

});