import type { Session } from '@supabase/supabase-js';
import {
    render,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native';
import { router } from 'expo-router';

import SetPasswordRoute from '../app/auth/set-password';
import { i18n } from '../src/i18n';
import { supabase } from '../src/lib/supabase/client';

jest.mock('expo-router', () => ({
    router: {
        replace: jest.fn(),
    },
}));

jest.mock('../src/lib/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            updateUser: jest.fn(),
            signOut: jest.fn(),
        },
    },
}));

const session: Session = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
        id: 'employee-1',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2026-09-13T10:00:00.000Z',
    },
};

describe('<SetPasswordRoute />', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await i18n.changeLanguage('en');
    });

    test('returns to sign in when there is no session', async () => {
        jest.mocked(supabase.auth.getSession).mockResolvedValue({
            data: {
                session: null,
            },
            error: null,
        });

        await render(<SetPasswordRoute />);

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/');
        });

        expect(
            screen.queryByLabelText('New password')
        ).not.toBeOnTheScreen();
    });

    test('shows password setup when a session is available', async () => {
        jest.mocked(supabase.auth.getSession).mockResolvedValue({
            data: {
                session,
            },
            error: null,
        });

        await render(<SetPasswordRoute />);

        expect(
            await screen.findByLabelText('New password')
        ).toBeOnTheScreen();

        expect(
            screen.getByLabelText('Confirm password')
        ).toBeOnTheScreen();

        expect(router.replace).not.toHaveBeenCalled();
    });

    test('shows confirmation after saving the password', async () => {
        const user = userEvent.setup();

        jest.mocked(supabase.auth.getSession).mockResolvedValue({
            data: {
                session,
            },
            error: null,
        });

        jest.mocked(supabase.auth.updateUser).mockResolvedValue({
            data: {
                user: session.user,
            },
            error: null,
        });

        await render(<SetPasswordRoute />);

        const passwordInput = await screen.findByLabelText(
            'New password'
        );

        await user.type(passwordInput, 'StrongPass1!');

        await user.type(
            screen.getByLabelText('Confirm password'),
            'StrongPass1!'
        );

        expect(supabase.auth.updateUser).not.toHaveBeenCalled();

        await user.press(
            screen.getByRole('button', {
                name: 'Create password',
            })
        );

        expect(
            await screen.findByText('Your password has been saved.')
        ).toBeOnTheScreen();

        expect(supabase.auth.updateUser).toHaveBeenCalledTimes(1);
        expect(supabase.auth.updateUser).toHaveBeenCalledWith({
            password: 'StrongPass1!',
        });

        expect(
            screen.queryByLabelText('New password')
        ).not.toBeOnTheScreen();

        expect(
            screen.queryByLabelText('Confirm password')
        ).not.toBeOnTheScreen();

        expect(
            screen.queryByRole('button', {
                name: 'Create password',
            })
        ).not.toBeOnTheScreen();
    });
    describe('<SetPasswordRoute /> returning to sign in', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            await i18n.changeLanguage('en');
        });

        test('signs out locally before returning to sign in', async () => {
            const user = userEvent.setup();

            jest.mocked(supabase.auth.getSession).mockResolvedValue({
                data: {
                    session,
                },
                error: null,
            });

            jest.mocked(supabase.auth.updateUser).mockResolvedValue({
                data: {
                    user: session.user,
                },
                error: null,
            });

            jest.mocked(supabase.auth.signOut).mockResolvedValue({
                error: null,
            });

            await render(<SetPasswordRoute />);

            await user.type(
                await screen.findByLabelText('New password'),
                'StrongPass1!'
            );

            await user.type(
                screen.getByLabelText('Confirm password'),
                'StrongPass1!'
            );

            await user.press(
                screen.getByRole('button', {
                    name: 'Create password',
                })
            );

            expect(
                await screen.findByText('Your password has been saved.')
            ).toBeOnTheScreen();

            expect(supabase.auth.signOut).not.toHaveBeenCalled();
            expect(router.replace).not.toHaveBeenCalled();

            await user.press(
                screen.getByRole('button', {
                    name: 'Back to sign in',
                })
            );

            await waitFor(() => {
                expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
                expect(supabase.auth.signOut).toHaveBeenCalledWith({
                    scope: 'local',
                });

                expect(router.replace).toHaveBeenCalledWith('/');
            });
        });
    });

});
describe('<SetPasswordRoute /> sign-out errors', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await i18n.changeLanguage('en');
    });

    test('stays on confirmation after a failure and allows retrying', async () => {
        const user = userEvent.setup();

        jest.mocked(supabase.auth.getSession).mockResolvedValue({
            data: {
                session,
            },
            error: null,
        });

        jest.mocked(supabase.auth.updateUser).mockResolvedValue({
            data: {
                user: session.user,
            },
            error: null,
        });

        jest
            .mocked(supabase.auth.signOut)
            .mockRejectedValueOnce(new Error('Network unavailable'))
            .mockResolvedValueOnce({ error: null });

        await render(<SetPasswordRoute />);

        await user.type(
            await screen.findByLabelText('New password'),
            'StrongPass1!'
        );

        await user.type(
            screen.getByLabelText('Confirm password'),
            'StrongPass1!'
        );

        await user.press(
            screen.getByRole('button', {
                name: 'Create password',
            })
        );

        await user.press(
            await screen.findByRole('button', {
                name: 'Back to sign in',
            })
        );

        expect(
            await screen.findByText(
                'Your password is saved, but we could not sign you out. Please try again.'
            )
        ).toBeOnTheScreen();

        expect(router.replace).not.toHaveBeenCalled();

        expect(
            screen.getByText('Your password has been saved.')
        ).toBeOnTheScreen();

        expect(
            screen.queryByLabelText('New password')
        ).not.toBeOnTheScreen();

        const retryButton = screen.getByRole('button', {
            name: 'Back to sign in',
        });

        expect(retryButton).toBeEnabled();

        await user.press(retryButton);

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/');
        });

        expect(supabase.auth.signOut).toHaveBeenCalledTimes(2);
        expect(supabase.auth.signOut).toHaveBeenNthCalledWith(
            2,
            { scope: 'local' }
        );

        expect(supabase.auth.updateUser).toHaveBeenCalledTimes(1);
    });
});