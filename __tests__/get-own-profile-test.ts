import {
    getOwnProfile,
    type ProfileClient,
} from '../src/lib/supabase/get-own-profile';

describe('getOwnProfile', () => {
  const maybeSingle = jest.fn();
  const select = jest.fn(() => ({ maybeSingle }));
  const from = jest.fn(() => ({ select }));

  const client = {
    from,
  } as unknown as ProfileClient;

  beforeEach(() => {
    maybeSingle.mockReset();
    select.mockClear();
    from.mockClear();
  });

  test.each([true, false])(
    'preserves the profile activation value: %s',
    async (isActive) => {
      const profile = {
        id: 'employee-1',
        role: 'employee',
        is_active: isActive,
      };

      maybeSingle.mockResolvedValue({
        data: profile,
        error: null,
      });

      await expect(getOwnProfile(client)).resolves.toEqual(
        profile
      );

      expect(from).toHaveBeenCalledWith('profiles');
      expect(select).toHaveBeenCalledWith(
        'id, role, is_active'
      );
    }
  );

  test('returns null when no profile is visible', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    await expect(getOwnProfile(client)).resolves.toBeNull();
  });

  test('propagates database errors', async () => {
    const error = new Error('Query failed');

    maybeSingle.mockResolvedValue({
      data: null,
      error,
    });

    await expect(getOwnProfile(client)).rejects.toBe(error);
  });

  test('propagates rejected requests', async () => {
    const error = new Error('Network unavailable');

    maybeSingle.mockRejectedValue(error);

    await expect(getOwnProfile(client)).rejects.toBe(error);
  });

  test('rejects an invalid activation value', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: 'employee-1',
        role: 'employee',
        is_active: 'false',
      },
      error: null,
    });

    await expect(getOwnProfile(client)).rejects.toThrow(
      'Invalid profile response'
    );
  });

  test('rejects an unknown role', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: 'employee-1',
        role: 'admin',
        is_active: true,
      },
      error: null,
    });

    await expect(getOwnProfile(client)).rejects.toThrow(
      'Invalid profile response'
    );
  });
});