import {
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

    await render(<PublicOrderScreen onBack={jest.fn()} />);

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

    await render(<PublicOrderScreen onBack={jest.fn()} />);

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

  test('returns immediately when the form is empty', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();

    await render(<PublicOrderScreen onBack={onBack} />);

    await user.press(
      screen.getByRole('button', { name: 'Back' })
    );

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('requires confirmation before discarding changes', async () => {
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => {});
    const onBack = jest.fn();
    const user = userEvent.setup();

    await render(<PublicOrderScreen onBack={onBack} />);

    await user.type(
      screen.getByLabelText('Bicycle ID'),
      'BIKE-123'
    );
    await user.press(
      screen.getByRole('button', { name: 'Back' })
    );

    expect(onBack).not.toHaveBeenCalled();
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
    discard?.onPress?.();

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  test('renders the form in Spanish', async () => {
    await i18n.changeLanguage('es');

    await render(<PublicOrderScreen onBack={jest.fn()} />);

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