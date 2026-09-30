jest.mock('../src/lib/supabase/client', () => ({ supabase: {} }));
import {
    act,
    render,
    screen,
    userEvent,
} from '@testing-library/react-native';
import { Alert } from 'react-native';

import { PublicOrderScreen } from '../src/features/public-order/screens/public-order-screen';
import { i18n } from '../src/i18n';

describe('<PublicOrderScreen />', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('allows entering the bicycle ID and notes', async () => {
    const user = userEvent.setup();

    await render(<PublicOrderScreen />);

    await user.type(
      screen.getByLabelText('Bicycle ID'),
      'BIKE-123'
    );
    await user.type(
      screen.getByLabelText('Notes (optional)'),
      'Moved away from the entrance'
    );

    expect(screen.getByLabelText('Bicycle ID')).toHaveProp(
      'value',
      'BIKE-123'
    );
    expect(
      screen.getByLabelText('Notes (optional)')
    ).toHaveProp('value', 'Moved away from the entrance');
  });

  test('allows selecting and clearing actions independently', async () => {
    const user = userEvent.setup();

    await render(<PublicOrderScreen />);

    const kickstand = screen.getByRole('checkbox', {
      name: 'Kickstand positioned',
    });
    const locked = screen.getByRole('checkbox', {
      name: 'Bicycle locked',
    });

    expect(kickstand).not.toBeChecked();
    expect(locked).not.toBeChecked();

    await user.press(kickstand);
    await user.press(locked);

    expect(kickstand).toBeChecked();
    expect(locked).toBeChecked();

    await user.press(kickstand);

    expect(kickstand).not.toBeChecked();
    expect(locked).toBeChecked();
  });

  test('does not offer discard for an empty form', async () => {
    await render(<PublicOrderScreen />);
    expect(screen.queryByRole('button', { name: 'Discard draft' })).not.toBeOnTheScreen();
  });

  test('requires confirmation before discarding changes', async () => {
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => {});
    const user = userEvent.setup();

    await render(<PublicOrderScreen />);

    await user.type(
      screen.getByLabelText('Bicycle ID'),
      'BIKE-123'
    );
    await user.press(
      screen.getByRole('button', { name: 'Discard draft' })
    );

    expect(screen.getByLabelText('Bicycle ID')).toHaveProp('value', 'BIKE-123');
    expect(alert).toHaveBeenCalledWith(
      'Discard this draft?',
      'The information you entered has not been saved.',
      expect.any(Array),
      { cancelable: true }
    );

    const buttons = alert.mock.calls[0][2];
    const discard = buttons?.find(
      (button) => button.text === 'Discard'
    );

    expect(discard?.onPress).toEqual(expect.any(Function));
    await act(async () => { discard?.onPress?.(); });
    expect(screen.getByLabelText('Bicycle ID')).toHaveProp('value', '');
    expect(screen.queryByRole('button', { name: 'Discard draft' })).not.toBeOnTheScreen();
  });

  test('renders the form in Spanish', async () => {
    await i18n.changeLanguage('es');

    await render(<PublicOrderScreen />);

    expect(
      screen.getByLabelText('ID de la bicicleta')
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('checkbox', {
        name: 'Bicicleta asegurada',
      })
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Observaciones (opcional)')
    ).toBeOnTheScreen();
  });
});