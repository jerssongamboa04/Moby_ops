export type SignInClient = {
    auth: {
        signInWithPassword: (credentials: {
            email: string;
            password: string;
        }) => Promise<{
            error: {
                message: string;
            } | null;
        }>;
    };
};

export async function signIn(
    client: SignInClient,
    email: string,
    password: string
): Promise<void> {
    const { error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
    });

    if (error) {
        throw error;
    }
}