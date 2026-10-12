import {
    signIn,
    type SignInClient,
} from '../src/lib/supabase/sign-in';

describe('signIn', () => {
    test('trims the email and preserves the exact password', async () => {
        const signInWithPassword = jest.fn().mockResolvedValue({
            error: null,
        });

        const client: SignInClient = {
            auth: { signInWithPassword },
        };

        await signIn(client, ' employee@example.com ', ' StrongPass1! ');

        expect(signInWithPassword).toHaveBeenCalledTimes(1);
        expect(signInWithPassword).toHaveBeenCalledWith({
            email: 'employee@example.com',
            password: ' StrongPass1! ',
        });
    });

    test('propagates rejected credentials', async () => {
        const authError = new Error('Invalid login credentials');

        const client: SignInClient = {
            auth: {
                signInWithPassword: jest.fn().mockResolvedValue({
                    error: authError,
                }),
            },
        };

        await expect(
            signIn(client, 'employee@example.com', 'wrong-password')
        ).rejects.toBe(authError);
    });

    test('propagates a failed request', async () => {
        const networkError = new Error('Network unavailable');

        const client: SignInClient = {
            auth: {
                signInWithPassword: jest.fn().mockRejectedValue(networkError),
            },
        };

        await expect(
            signIn(client, 'employee@example.com', 'StrongPass1!')
        ).rejects.toBe(networkError);
    });
});