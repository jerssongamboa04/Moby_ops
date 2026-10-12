import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PublicOrderScreen } from '../src/features/public-order/screens/public-order-screen';
import { i18n } from '../src/i18n';
import { preparePublicOrder, submitPublicOrder } from '../src/lib/supabase/submit-public-order';

jest.mock('../src/lib/supabase/client', () => ({ supabase: {} }));
jest.mock('../src/lib/supabase/submit-public-order', () => ({ preparePublicOrder: jest.fn(), submitPublicOrder: jest.fn() }));
jest.mock('expo-location', () => ({ requestForegroundPermissionsAsync: jest.fn(async () => ({ granted: true })), getCurrentPositionAsync: jest.fn(async () => ({ coords: { latitude: 53, longitude: -6 } })), Accuracy: { High: 4 } }));
jest.mock('../src/features/public-order/lib/evidence-photo', () => ({ removeLocalPhoto: jest.fn() }));
jest.mock('../src/features/public-order/components/evidence-camera', () => ({
  EvidenceCamera: ({ phase, onCapture }: { phase: string; onCapture: (photo: unknown) => void }) => {
    const React = require('react'); const { Pressable, Text } = require('react-native');
    return React.createElement(Pressable, { accessibilityRole: 'button', onPress: () => onCapture({ uri: `${phase}.webp`, capturedAt: '2026-09-24T12:00:00Z', size: 100 }) }, React.createElement(Text, null, 'Capture mock'));
  },
}));
beforeEach(async () => { jest.clearAllMocks(); await i18n.changeLanguage('en'); jest.mocked(preparePublicOrder).mockResolvedValue({ action_id: 'id', before_path: 'before', after_path: 'after' }); jest.mocked(submitPublicOrder).mockResolvedValue('id'); });

test('requires two photos and an action, reviews, and clears only after confirmation', async () => {
  const user = userEvent.setup();
  const confirm = jest.spyOn(Alert, 'alert');
  await render(<PublicOrderScreen />);
  expect(screen.getByRole('button', { name: 'Review and send' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Bicycle ID'), 'IE12H02911');
  await user.press(screen.getByRole('checkbox', { name: 'Bicycle locked' }));
  await user.press(screen.getByRole('button', { name: 'Before' }));
  await user.press(screen.getByRole('button', { name: 'Capture mock' }));
  expect(screen.getByRole('button', { name: 'Review and send' })).toBeDisabled();
  await user.press(screen.getByRole('button', { name: 'After' }));
  await user.press(screen.getByRole('button', { name: 'Capture mock' }));
  await user.press(screen.getByRole('button', { name: 'Review and send' }));
  expect(submitPublicOrder).not.toHaveBeenCalled();
  await act(async () => { confirm.mock.lastCall?.[2]?.[1]?.onPress?.(); });
  expect(await screen.findByText('Action recorded. You can start another.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('');
  expect(submitPublicOrder).toHaveBeenCalledTimes(1);
  confirm.mockRestore();
});

test('retains the same attempt and photos after failure for a safe retry', async () => {
  jest.mocked(submitPublicOrder).mockRejectedValueOnce(new Error('offline')).mockResolvedValue('id');
  const confirm = jest.spyOn(Alert, 'alert');
  const user = userEvent.setup();
  await render(<PublicOrderScreen />);
  await fireEvent.changeText(screen.getByLabelText('Bicycle ID'), 'IE12H02911');
  await user.press(screen.getByRole('checkbox', { name: 'Bicycle locked' }));
  for (const name of ['Before', 'After']) {
    await user.press(screen.getByRole('button', { name }));
    await user.press(screen.getByRole('button', { name: 'Capture mock' }));
  }
  await user.press(screen.getByRole('button', { name: 'Review and send' }));
  await act(async () => { confirm.mock.lastCall?.[2]?.[1]?.onPress?.(); });
  expect(await screen.findByRole('alert')).toHaveTextContent(/Could not confirm/);
  expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('IE12H02911');
  expect(screen.getByLabelText('Bicycle ID')).toHaveProp('editable', false);
  await user.press(screen.getByRole('button', { name: 'Retry sending' }));
  expect(await screen.findByText('Action recorded. You can start another.')).toBeOnTheScreen();
  expect(preparePublicOrder).toHaveBeenCalledTimes(1);
  const calls = jest.mocked(submitPublicOrder).mock.calls;
  expect(calls[1][1]).toBe(calls[0][1]);
  expect(calls[1][2]).toBe(calls[0][2]);
  confirm.mockRestore();
});


test('hides success after five seconds without clearing the next draft', async () => {
  jest.useFakeTimers();
  const confirm = jest.spyOn(Alert, 'alert');
  try {
    await render(<PublicOrderScreen />);
    await fireEvent.changeText(screen.getByLabelText('Bicycle ID'), 'IE12H02911');
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Bicycle locked' }));
    for (const name of ['Before', 'After']) {
      await fireEvent.press(screen.getByRole('button', { name }));
      await fireEvent.press(screen.getByRole('button', { name: 'Capture mock' }));
    }
    await fireEvent.press(screen.getByRole('button', { name: 'Review and send' }));
    await act(async () => { confirm.mock.lastCall?.[2]?.[1]?.onPress?.(); });
    expect(screen.getByText('Action recorded. You can start another.')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Bicycle ID'), '39E1200806');
    await act(async () => { jest.advanceTimersByTime(4999); });
    expect(screen.getByText('Action recorded. You can start another.')).toBeOnTheScreen();
    await act(async () => { jest.advanceTimersByTime(1); });
    expect(screen.queryByText('Action recorded. You can start another.')).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('39E1200806');
  } finally { confirm.mockRestore(); jest.useRealTimers(); }
});

test.each([
  ['en', ['1. Identify the bicycle', '2. Before photo', '3. Actions completed', '4. After photo', '5. Review and send']],
  ['es', ['1. Identifica la bicicleta', '2. Foto antes', '3. Acciones realizadas', '4. Foto después', '5. Revisa y envía']],
])('shows the five guided steps in %s', async (language, headings) => {
  await i18n.changeLanguage(language as string);
  await render(<PublicOrderScreen />);
  const steps = screen.getAllByRole('header').slice(1);
  expect(steps.map((step) => step.props.accessibilityLabel)).toEqual(headings);
  expect(screen.getAllByRole('checkbox')).toHaveLength(3);
});
