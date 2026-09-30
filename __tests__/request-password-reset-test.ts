import { requestPasswordReset } from '../src/lib/supabase/request-password-reset';

test('normalizes email and uses the installed app callback', async () => {
  const resetPasswordForEmail = jest.fn().mockResolvedValue({ error: null });
  await requestPasswordReset({ auth: { resetPasswordForEmail } }, ' worker@example.com ');
  expect(resetPasswordForEmail).toHaveBeenCalledWith('worker@example.com', { redirectTo: 'mobyops://auth/callback' });
  await expect(requestPasswordReset({ auth: { resetPasswordForEmail } }, 'invalid')).rejects.toThrow();
  expect(resetPasswordForEmail).toHaveBeenCalledTimes(1);
});
test('propagates service and transport failures', async () => {
  const error = new Error('private server detail');
  const resetPasswordForEmail = jest.fn().mockResolvedValueOnce({ error }).mockRejectedValueOnce(error);
  for (let i = 0; i < 2; i++) {
    await expect(requestPasswordReset({ auth: { resetPasswordForEmail } }, 'worker@example.com')).rejects.toBe(error);
  }
});
