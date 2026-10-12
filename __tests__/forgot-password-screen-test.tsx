import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ForgotPasswordScreen } from '../src/features/auth/screens/forgot-password-screen';
import { SetPasswordScreen } from '../src/features/auth/screens/set-password-screen';
import { i18n } from '../src/i18n';

beforeEach(async () => { jest.useFakeTimers(); await i18n.changeLanguage('en'); });
afterEach(() => { jest.useRealTimers(); });

test('validates email, prevents double requests, and permits retry after cooldown', async () => {
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  const onSubmit = jest.fn(() => pending);
  await render(<ForgotPasswordScreen onSubmit={onSubmit} onBack={jest.fn()} />);
  expect(screen.getByText('Send link')).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Email'), ' worker@example.com ');
  await fireEvent.press(screen.getByText('Send link'));
  expect(screen.getByText('Sending...')).toBeDisabled();
  await fireEvent.press(screen.getByText('Sending...'));
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith('worker@example.com');
  await act(async () => { finish(); await pending; });
  expect(screen.getByText(/If an account is associated/)).toBeOnTheScreen();
  expect(screen.getByText('Send link')).toBeDisabled();
  await act(async () => { jest.advanceTimersByTime(60000); });
  expect(screen.getByText('Send link')).toBeEnabled();
});

test('shows translated generic errors without raw details and allows going back', async () => {
  await i18n.changeLanguage('es');
  const onBack = jest.fn();
  await render(<ForgotPasswordScreen onSubmit={jest.fn().mockRejectedValue(new Error('secret detail'))} onBack={onBack} />);
  await fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'worker@example.com');
  await fireEvent.press(screen.getByText('Enviar enlace'));
  expect(screen.getByText(/No pudimos procesar/)).toBeOnTheScreen();
  expect(screen.queryByText('secret detail')).toBeNull();
  await fireEvent.press(screen.getByText('Volver al inicio de sesión'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('reuses password validation with recovery-specific copy', async () => {
  await render(<SetPasswordScreen recovery onSubmit={jest.fn()} />);
  expect(screen.getByText('Set a new password.')).toBeOnTheScreen();
  expect(screen.getByText('Save new password')).toBeDisabled();
});
