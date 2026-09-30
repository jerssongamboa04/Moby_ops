import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { SignInScreen } from '../src/features/auth/screens/sign-in-screen';
import { PublicOrderScreen } from '../src/features/public-order/screens/public-order-screen';

jest.mock('../src/lib/supabase/client', () => ({ supabase: {} }));
jest.mock('react-native', () => {
  const native = jest.requireActual('react-native');
  return Object.defineProperty(Object.create(native), 'KeyboardAvoidingView', {
    value: ({ behavior, children }: { behavior?: string; children: React.ReactNode }) =>
      require('react').createElement(native.View, { testID: 'keyboard-layout', accessibilityHint: behavior }, children),
  });
});

afterEach(() => jest.restoreAllMocks());

// Native configuration contract, not a claim of on-device keyboard visibility.
// Jest cannot lay out a physical Android keyboard: that needs the manual check.
describe.each([
  ['Android', 'android', 'height'],
  ['iOS', 'ios', 'padding'],
] as const)('%s keyboard layout', (_name, platform, behavior) => {
  test.each([
    ['sign in', SignInScreen],
    ['public order', PublicOrderScreen],
  ] as const)('%s explicitly adapts its available space', async (_screen, Component) => {
    jest.replaceProperty(Platform, 'OS', platform);
    await render(<Component onSubmit={async () => {}} />);
    expect(screen.getByTestId('keyboard-layout')).toHaveProp('accessibilityHint', behavior);
  });
});
