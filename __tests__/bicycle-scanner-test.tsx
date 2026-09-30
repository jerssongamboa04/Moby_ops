jest.mock('../src/lib/supabase/client', () => ({ supabase: {} }));
import * as Haptics from 'expo-haptics';
import { act, fireEvent, render, screen, userEvent, within } from '@testing-library/react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AppState, Linking } from 'react-native';

import { BicycleScanner } from '../src/features/public-order/components/bicycle-scanner';
import { PublicOrderScreen } from '../src/features/public-order/screens/public-order-screen';
import { i18n } from '../src/i18n';

jest.mock('expo-haptics', () => ({
  performAndroidHapticsAsync: jest.fn(),
  notificationAsync: jest.fn(),
  AndroidHaptics: { Confirm: 'confirm' },
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-camera', () => ({
  CameraView: jest.fn((props) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { ...props, testID: 'camera-preview' });
  }),
  useCameraPermissions: jest.fn(),
}));

const mockPermissions = jest.mocked(useCameraPermissions);
const request = jest.fn();
const refresh = jest.fn();
const granted = { status: 'granted', granted: true, canAskAgain: true, expires: 'never' } as NonNullable<ReturnType<typeof useCameraPermissions>[0]>;

beforeEach(async () => {
  jest.clearAllMocks();
  jest.mocked(Haptics.performAndroidHapticsAsync).mockResolvedValue(undefined);
  jest.mocked(Haptics.notificationAsync).mockResolvedValue(undefined);
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: jest.fn() });
  await i18n.changeLanguage('en');
  request.mockResolvedValue(granted);
  refresh.mockResolvedValue(granted);
  mockPermissions.mockReturnValue([granted, request, refresh]);
});

test('scans into the bicycle field and preserves leading zeros', async () => {
  const user = userEvent.setup();
  await render(<PublicOrderScreen />);
  await user.press(screen.getByRole('button', { name: 'Scan bicycle code' }));
  await fireEvent(screen.getByTestId('camera-preview'), 'barcodeScanned', { type: 'code128', data: 'IE12H02911' });
  expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('IE12H02911');
  expect(screen.queryByTestId('camera-preview')).not.toBeOnTheScreen();
});

test('ignores QR links and blank codes, and accepts only one result', async () => {
  const onScanned = jest.fn();
  await render(<BicycleScanner onScanned={onScanned} onClose={jest.fn()} />);
  const preview = screen.getByTestId('camera-preview');
  await fireEvent(preview, 'barcodeScanned', { type: 'qr', data: 'https://example.com' });
  await fireEvent(preview, 'barcodeScanned', { type: 'code128', data: '  ' });
  expect(onScanned).not.toHaveBeenCalled();
  expect(Haptics.performAndroidHapticsAsync).not.toHaveBeenCalled();
  expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  await fireEvent(preview, 'barcodeScanned', { type: 'code128', data: '34E1200012' });
  await fireEvent(preview, 'barcodeScanned', { type: 'code128', data: '39E1200806' });
  expect(onScanned).toHaveBeenCalledTimes(1);
  expect(jest.mocked(Haptics.performAndroidHapticsAsync).mock.calls.length + jest.mocked(Haptics.notificationAsync).mock.calls.length).toBe(1);
  expect(onScanned).toHaveBeenCalledWith('34E1200012');
});

test('requests camera permission only after the user presses allow', async () => {
  mockPermissions.mockReturnValue([{ ...granted, granted: false, status: 'undetermined' as typeof granted.status }, request, refresh]);
  const user = userEvent.setup();
  await render(<BicycleScanner onScanned={jest.fn()} onClose={jest.fn()} />);
  expect(screen.queryByTestId('camera-preview')).not.toBeOnTheScreen();
  expect(request).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Allow camera' }));
  expect(request).toHaveBeenCalledTimes(1);
});

test('opens settings when the permission cannot be requested again', async () => {
  mockPermissions.mockReturnValue([{ ...granted, granted: false, canAskAgain: false }, request, refresh]);
  const settings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
  const user = userEvent.setup();
  await render(<BicycleScanner onScanned={jest.fn()} onClose={jest.fn()} />);
  await user.press(screen.getByRole('button', { name: 'Open settings' }));
  expect(settings).toHaveBeenCalledTimes(1);
  expect(request).not.toHaveBeenCalled();
  settings.mockRestore();
});

test('manual fallback preserves the existing bicycle ID', async () => {
  const user = userEvent.setup();
  await render(<PublicOrderScreen />);
  await user.type(screen.getByLabelText('Bicycle ID'), '34E1200012');
  await user.press(screen.getByRole('button', { name: 'Scan bicycle code' }));
  await user.press(screen.getByRole('button', { name: 'Enter ID manually' }));
  expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('34E1200012');
});

test('offers a manual exit after a camera error', async () => {
  const close = jest.fn();
  const user = userEvent.setup();
  await render(<BicycleScanner onScanned={jest.fn()} onClose={close} />);
  await fireEvent(screen.getByTestId('camera-preview'), 'mountError', { message: 'Unavailable' });
  expect(screen.getByRole('alert')).toBeOnTheScreen();
  expect(screen.queryByTestId('camera-preview')).not.toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Enter ID manually' }));
  expect(close).toHaveBeenCalledTimes(1);
});

test('releases the camera in the background and refreshes permission on return', async () => {
  let onChange: (state: 'active' | 'background') => void = () => {};
  const remove = jest.fn();
  const listener = jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
    onChange = callback;
    return { remove };
  });
  const { unmount } = await render(<BicycleScanner onScanned={jest.fn()} onClose={jest.fn()} />);
  expect(screen.getByTestId('camera-preview')).toBeOnTheScreen();
  await act(() => onChange('background'));
  expect(screen.queryByTestId('camera-preview')).not.toBeOnTheScreen();
  await act(() => onChange('active'));
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('camera-preview')).toBeOnTheScreen();
  await unmount();
  expect(remove).toHaveBeenCalled();
  listener.mockRestore();
});

test('toggles the camera light', async () => {
  const user = userEvent.setup();
  await render(<BicycleScanner onScanned={jest.fn()} onClose={jest.fn()} />);
  await user.press(screen.getByRole('button', { name: 'Turn on light' }));
  expect(jest.mocked(CameraView).mock.lastCall?.[0].enableTorch).toBe(true);
  await user.press(screen.getByRole('button', { name: 'Turn off light' }));
  expect(jest.mocked(CameraView).mock.lastCall?.[0].enableTorch).toBe(false);
});


test('fills Bicycle ID from a MOBY QR after rejecting a product barcode', async () => {
  const user = userEvent.setup();
  await render(<PublicOrderScreen />);
  await user.press(screen.getByRole('button', { name: 'Scan bicycle code' }));
  await fireEvent(screen.getByTestId('camera-preview'), 'barcodeScanned', { type: 'ean13', data: '1234567890123' });
  expect(screen.getByRole('alert')).toHaveTextContent(/Code not recognised/);
  await fireEvent(screen.getByTestId('camera-preview'), 'barcodeScanned', {
    type: 'qr', data: 'https://mobymove.page.link/scan?bn=IE12H02911&vehicleId=2024120074&source=ridemovi.com',
  });
  expect(screen.getByLabelText('Bicycle ID')).toHaveDisplayValue('IE12H02911');
  expect(screen.queryByTestId('camera-preview')).not.toBeOnTheScreen();
});

test('normalises manual IDs on blur and reports invalid input', async () => {
  await render(<PublicOrderScreen />);
  const field = screen.getByLabelText('Bicycle ID');
  await fireEvent.changeText(field, '  ie12h02911  ');
  await fireEvent(field, 'blur');
  expect(field).toHaveDisplayValue('IE12H02911');
  expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  await fireEvent.changeText(field, '2024120074');
  await fireEvent(field, 'blur');
  expect(screen.getByRole('alert')).toHaveTextContent(/Check the bicycle ID/);
});


test('accepts the ID even if the device rejects haptic feedback', async () => {
  jest.mocked(Haptics.performAndroidHapticsAsync).mockRejectedValue(new Error('Unavailable'));
  jest.mocked(Haptics.notificationAsync).mockRejectedValue(new Error('Unavailable'));
  const onScanned = jest.fn();
  await render(<BicycleScanner onScanned={onScanned} onClose={jest.fn()} />);
  await fireEvent(screen.getByTestId('camera-preview'), 'barcodeScanned', { type: 'code128', data: 'IE12H02911' });
  expect(onScanned).toHaveBeenCalledWith('IE12H02911');
});


test('places the ID warning inside its field section, never in the heading', async () => {
  await render(<PublicOrderScreen />);
  const field = screen.getByLabelText('Bicycle ID');
  await fireEvent.changeText(field, 'invalid');
  await fireEvent(field, 'blur');
  expect(within(screen.getByTestId('bicycle-id-section')).getByRole('alert'))
    .toHaveTextContent('Check the bicycle ID or scan its code.');
  expect(within(screen.getByTestId('public-order-heading')).queryByRole('alert'))
    .not.toBeOnTheScreen();
  await fireEvent(field, 'focus');
  expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
});
