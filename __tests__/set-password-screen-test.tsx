import {
    act,
    render,
    screen,
    userEvent,
} from '@testing-library/react-native';

import {
    SetPasswordScreen,
} from '../src/features/auth/screens/set-password-screen';
import { i18n } from '../src/i18n';

describe('<SetPasswordScreen />', () => {
    beforeEach(async () => {
        await i18n.changeLanguage('en');
    });

    test('renders the password creation form', async () => {
        const onSubmit = jest.fn();

        await render(
            <SetPasswordScreen onSubmit={onSubmit} />
        );

        expect(
            screen.getByText('Create your password.')
        ).toBeOnTheScreen();

        expect(
            screen.getByLabelText('New password')
        ).toBeOnTheScreen();

        expect(
            screen.getByLabelText('Confirm password')
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Create password',
            })
        ).toBeDisabled();
    });

    test('submits a valid matching password', async () => {
        const user = userEvent.setup();
        const onSubmit = jest
            .fn()
            .mockResolvedValue(undefined);

        await render(
            <SetPasswordScreen onSubmit={onSubmit} />
        );

        const passwordInput =
            screen.getByLabelText('New password');

        const confirmationInput =
            screen.getByLabelText('Confirm password');

        const submitButton = screen.getByRole('button', {
            name: 'Create password',
        });

        await user.type(passwordInput, 'StrongPass1!');

        expect(submitButton).toBeDisabled();

        await user.type(
            confirmationInput,
            'StrongPass1!'
        );

        expect(submitButton).toBeEnabled();

        await user.press(submitButton);

        expect(onSubmit).toHaveBeenCalledWith(
            'StrongPass1!'
        );
    });

    test('rejects weak or different passwords', async () => {
        const user = userEvent.setup();

        await render(
            <SetPasswordScreen onSubmit={jest.fn()} />
        );

        const passwordInput =
            screen.getByLabelText('New password');

        const confirmationInput =
            screen.getByLabelText('Confirm password');

        const submitButton = screen.getByRole('button', {
            name: 'Create password',
        });

        await user.type(passwordInput, 'weak');
        await user.type(confirmationInput, 'weak');

        expect(submitButton).toBeDisabled();

        await user.clear(passwordInput);
        await user.clear(confirmationInput);

        await user.type(passwordInput, 'StrongPass1!');
        await user.type(
            confirmationInput,
            'Different1!'
        );

        expect(submitButton).toBeDisabled();
    });

    test('changes the password creation screen to Spanish', async () => {
        const user = userEvent.setup();

        await render(
            <SetPasswordScreen onSubmit={jest.fn()} />
        );

        expect(
            screen.getByText('Create your password.')
        ).toBeOnTheScreen();

        await user.press(
            screen.getByRole('button', {
                name: 'ES',
            })
        );

        expect(
            await screen.findByText('Crea tu contraseña.')
        ).toBeOnTheScreen();

        expect(
            screen.getByLabelText('Nueva contraseña')
        ).toBeOnTheScreen();

        expect(
            screen.getByLabelText('Confirmar contraseña')
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Crear contraseña',
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'ES',
            })
        ).toBeSelected();

        expect(
            screen.getByRole('button', {
                name: 'EN',
            })
        ).not.toBeSelected();
    });

    describe('<SetPasswordScreen /> submission state', () => {
        beforeEach(async () => {
            await i18n.changeLanguage('en');
        });

        test('blocks repeated submissions while saving', async () => {
            const user = userEvent.setup();

            let finishSaving: () => void = () => undefined;

            const pendingSave = new Promise<void>((resolve) => {
                finishSaving = resolve;
            });

            const onSubmit = jest.fn(() => pendingSave);

            await render(
                <SetPasswordScreen onSubmit={onSubmit} />
            );

            await user.type(
                screen.getByLabelText('New password'),
                'StrongPass1!'
            );

            await user.type(
                screen.getByLabelText('Confirm password'),
                'StrongPass1!'
            );

            try {
                await user.press(
                    screen.getByRole('button', {
                        name: 'Create password',
                    })
                );

                const savingButton = screen.getByRole('button', {
                    name: 'Saving...',
                });

                expect(savingButton).toBeDisabled();
                expect(savingButton).toHaveProp(
                    'accessibilityState',
                    expect.objectContaining({
                        busy: true,
                    })
                );

                await user.press(savingButton);

                expect(onSubmit).toHaveBeenCalledTimes(1);
            } finally {
                await act(async () => {
                    finishSaving();
                    await pendingSave;
                });
            }
        });
    });
    describe('<SetPasswordScreen /> saving errors', () => {
        beforeEach(async () => {
            await i18n.changeLanguage('es');
        });

        test('shows a translated error and allows retrying', async () => {
            const user = userEvent.setup();

            const onSubmit = jest
                .fn()
                .mockRejectedValueOnce(
                    new Error('Internal service error')
                )
                .mockResolvedValueOnce(undefined);

            await render(
                <SetPasswordScreen onSubmit={onSubmit} />
            );

            await user.type(
                screen.getByLabelText('Nueva contraseña'),
                'StrongPass1!'
            );

            await user.type(
                screen.getByLabelText('Confirmar contraseña'),
                'StrongPass1!'
            );

            await user.press(
                screen.getByRole('button', {
                    name: 'Crear contraseña',
                })
            );

            expect(
                await screen.findByText(
                    'No pudimos guardar tu contraseña. Inténtalo de nuevo.'
                )
            ).toBeOnTheScreen();

            expect(
                screen.queryByText('Internal service error')
            ).not.toBeOnTheScreen();

            const retryButton = screen.getByRole('button', {
                name: 'Crear contraseña',
            });

            expect(retryButton).toBeEnabled();

            await user.press(retryButton);

            expect(onSubmit).toHaveBeenCalledTimes(2);
            expect(onSubmit).toHaveBeenNthCalledWith(
                2,
                'StrongPass1!'
            );

            expect(
                screen.queryByText(
                    'No pudimos guardar tu contraseña. Inténtalo de nuevo.'
                )
            ).not.toBeOnTheScreen();
        });
    });
});