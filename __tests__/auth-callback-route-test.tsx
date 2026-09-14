import {
    act,
    render,
    screen,
    userEvent,
} from '@testing-library/react-native';
import { router } from 'expo-router';

import AuthCallbackRoute from '../app/auth/callback';
import {
    useAuthCallbackStore,
} from '../src/features/auth/store/auth-callback-store';
import { i18n } from '../src/i18n';

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

describe('<AuthCallbackRoute />', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    useAuthCallbackStore.getState().reset();
    await i18n.changeLanguage('en');
  });

  test('updates the screen when processing fails', async () => {
    useAuthCallbackStore.getState().startProcessing();

    await render(<AuthCallbackRoute />);

    expect(
      screen.getByText('Checking your invitation...')
    ).toBeOnTheScreen();

    await act(async () => {
      useAuthCallbackStore.getState().markAsError();
    });

    expect(
      screen.getByText(
        'We could not complete your invitation.'
      )
    ).toBeOnTheScreen();

    expect(
      screen.queryByText('Checking your invitation...')
    ).not.toBeOnTheScreen();

    expect(router.replace).not.toHaveBeenCalled();
  });

  test('clears the error and returns to sign in', async () => {
    const user = userEvent.setup();

    useAuthCallbackStore.getState().startProcessing();
    useAuthCallbackStore.getState().markAsError();

    await render(<AuthCallbackRoute />);

    await user.press(
      screen.getByRole('button', {
        name: 'Back to sign in',
      })
    );

    expect(
      useAuthCallbackStore.getState().status
    ).toBe('idle');

    expect(router.replace).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});