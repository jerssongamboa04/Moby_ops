import { readOwnTasks } from '../src/lib/supabase/read-own-tasks';

const empty = {
  today: '2026-09-26', current_month: '2026-09-01', period: '2026-09-26', refresh_after_ms: 10000,
  total: 0, counted: 0, repeated: 0, has_more: false, days: [], items: [],
};
test('requests only authenticated own data, with period and pagination', async () => {
  const rpc = jest.fn().mockResolvedValue({ data: empty, error: null });
  await expect(readOwnTasks({ rpc } as never, { view: 'today', month: null, offset: 50 })).resolves.toEqual(empty);
  expect(rpc).toHaveBeenCalledWith('read_own_tasks', { p_view: 'today', p_month: null, p_offset: 50 });
});
test('does not turn a permission or network error into zero tasks', async () => {
  const error = new Error('denied');
  const rpc = jest.fn().mockResolvedValue({ data: null, error });
  await expect(readOwnTasks({ rpc } as never, { view: 'month', month: null, offset: 0 })).rejects.toBe(error);
});
test.each([null, { ...empty, counted: 2 }, { ...empty, today: '2026-02-30' }, { ...empty, items: [{}] }])(
  'rejects malformed server summaries', async (data) => {
    const rpc = jest.fn().mockResolvedValue({ data, error: null });
    await expect(readOwnTasks({ rpc } as never, { view: 'today', month: null, offset: 0 })).rejects.toThrow('Invalid tasks response');
  }
);
