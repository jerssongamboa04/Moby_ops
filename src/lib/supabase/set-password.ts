export type SetPasswordClient = {
  auth: {
    updateUser: (attributes: {
      password: string;
    }) => Promise<{
      error: {
        message: string;
      } | null;
    }>;
  };
};

export async function setPassword(
  client: SetPasswordClient,
  password: string
): Promise<void> {
  const { error } = await client.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }
}