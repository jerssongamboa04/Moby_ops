import {
    render,
    screen,
    userEvent,
} from '@testing-library/react-native';

import {
    AuthCallbackScreen,
} from '../src/features/auth/screens/auth-callback-screen';
import { i18n } from '../src/i18n';

describe('<AuthCallbackScreen />', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  test('shows a waiting message while processing the invitation', async () => {
    await render(
      <AuthCallbackScreen
        status="processing"
        onBackToSignIn={jest.fn()}
      />
    );

    expect(
      screen.getByText('Checking your invitation...')
    ).toBeOnTheScreen();

    expect(
      screen.queryByRole('button', {
        name: 'Back to sign in',
      })
    ).not.toBeOnTheScreen();
  });

  test('shows an error in Spanish and allows returning to sign in', async () => {
    await i18n.changeLanguage('es');

    const user = userEvent.setup();
    const onBackToSignIn = jest.fn();

    await render(
      <AuthCallbackScreen
        status="error"
        onBackToSignIn={onBackToSignIn}
      />
    );

    expect(
      screen.getByText('No pudimos completar la invitación.')
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Comprobando tu invitación...')
    ).not.toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', {
        name: 'Volver al inicio de sesión',
      })
    );

    expect(onBackToSignIn).toHaveBeenCalledTimes(1);
  });
});