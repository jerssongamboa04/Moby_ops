import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { TasksScreen } from '../src/features/operations/screens/tasks-screen';
import { readOwnTasks, type OwnTasks } from '../src/lib/supabase/read-own-tasks';
import { i18n } from '../src/i18n';

jest.mock('../src/lib/supabase/client', () => ({ supabase: {} }));
jest.mock('../src/lib/supabase/read-own-tasks', () => ({ readOwnTasks: jest.fn() }));
jest.mock('expo-router', () => ({ useFocusEffect: (effect: () => void) => require('react').useEffect(effect, [effect]) }));
const summary: OwnTasks = {
  today: '2026-09-26', current_month: '2026-09-01', period: '2026-09-26', refresh_after_ms: 60000,
  total: 2, counted: 1, repeated: 1, has_more: false,
  days: [{ day: '2026-09-26', total: 2, counted: 1, repeated: 1 }],
  items: [{ id: 'id', bike_external_id: 'IE12H02911', created_at: '2026-09-26T14:00:00Z',
    day: '2026-09-26', counted: false, kickstand_positioned: true, bike_locked: false, bike_repositioned: false }],
};
beforeEach(async () => {
  jest.clearAllMocks(); await i18n.changeLanguage('en');
  jest.mocked(readOwnTasks).mockResolvedValue(summary);
});

test('shows own server totals and identifies repetitions without calling them failed submissions', async () => {
  await render(<TasksScreen />);
  expect(await screen.findByText('IE12H02911')).toBeOnTheScreen();
  expect(screen.getByLabelText('Invalid: repeated bicycle on this date')).toBeOnTheScreen();
  expect(screen.getByLabelText('Done: 1')).toBeOnTheScreen();
});
test('loads previous months and shows their daily summary in Spanish', async () => {
  await i18n.changeLanguage('es'); await render(<TasksScreen />);
  await screen.findByText('IE12H02911');
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, period: '2026-09-01', items: [] });
  await fireEvent.press(screen.getByRole('button', { name: 'Mes' }));
  await screen.findByText('Resumen por día');
  expect(screen.getByRole('button', { name: 'Mes siguiente' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
  expect(readOwnTasks).toHaveBeenLastCalledWith(expect.anything(), { view: 'month', month: '2026-08-01', offset: 0 }, expect.anything());
});
test('shows errors rather than a false empty state and lets the user retry', async () => {
  jest.mocked(readOwnTasks).mockRejectedValueOnce(new Error('offline'));
  await render(<TasksScreen />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your activity.');
  expect(screen.queryByText('No activity recorded for this period.')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('IE12H02911')).toBeOnTheScreen();
});
test('ignores a late response from a previously selected view', async () => {
  let resolve!: (value: OwnTasks) => void;
  jest.mocked(readOwnTasks).mockReturnValueOnce(new Promise((r) => { resolve = r; }));
  await render(<TasksScreen />);
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, period: '2026-09-01', items: [] });
  await fireEvent.press(screen.getByRole('button', { name: 'Month' }));
  await screen.findByText('Daily summary');
  await act(async () => { resolve(summary); });
  expect(screen.queryByText('IE12H02911')).not.toBeOnTheScreen();
});

test('shows a real empty state after a successful response', async () => {
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, total: 0, counted: 0, repeated: 0, days: [], items: [] });
  await render(<TasksScreen />);
  expect(await screen.findByText('No activity recorded for this period.')).toBeOnTheScreen();
});

test('requests the next page without counting just the visible items', async () => {
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, total: 51, counted: 1, repeated: 50, has_more: true });
  await render(<TasksScreen />);
  await screen.findByText('IE12H02911');
  await fireEvent.press(screen.getByRole('button', { name: 'Next page' }));
  expect(readOwnTasks).toHaveBeenLastCalledWith(expect.anything(), { view: 'today', month: null, offset: 50 }, expect.anything());
  expect(await screen.findByLabelText('Invalid: 50')).toBeOnTheScreen();
});

test('refreshes at the server-provided midnight deadline and cancels work on unmount', async () => {
  jest.useFakeTimers();
  try {
    jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, refresh_after_ms: 1000 });
    const view = await render(<TasksScreen />);
    await act(async () => {});
    expect(readOwnTasks).toHaveBeenCalledTimes(1);
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(readOwnTasks).toHaveBeenCalledTimes(2);
    const signal = jest.mocked(readOwnTasks).mock.lastCall?.[2];
    await view.unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(readOwnTasks).toHaveBeenCalledTimes(2);
  } finally { jest.useRealTimers(); }
});

 test('shows compact times and only performed actions with accessible status', async () => {
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, items: [{ ...summary.items[0], counted: true, bike_locked: true }] });
  await render(<TasksScreen />);
  expect(await screen.findByText('15:00')).toBeOnTheScreen();
  expect(screen.getByLabelText('Done')).toBeOnTheScreen();
  expect(screen.getByText('Kickstand positioned')).toBeOnTheScreen();
  expect(screen.getByText('Bicycle locked')).toBeOnTheScreen();
  expect(screen.queryByText('Bicycle repositioned')).not.toBeOnTheScreen();
  expect(screen.queryByText(/Received at|One counted task|Counted tasks|saved/)).not.toBeOnTheScreen();
 });


test('opens a monthly day, paginates its receipts and returns to the selected month', async () => {
  await render(<TasksScreen />);
  await screen.findByText('IE12H02911');
  expect(screen.queryByText('26 September 2026')).not.toBeOnTheScreen();
  expect(screen.queryByText('Today’s activity')).not.toBeOnTheScreen();
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, period: '2026-09-01', items: [] });
  await fireEvent.press(screen.getByRole('button', { name: 'Month' }));
  await screen.findByText('Daily summary');
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, has_more: true });
  await fireEvent.press(screen.getByRole('button', { name: 'View tasks for 26 September 2026' }));
  expect(readOwnTasks).toHaveBeenLastCalledWith(expect.anything(), { view: 'day', month: '2026-09-26', offset: 0 }, expect.anything());
  expect(await screen.findByText('IE12H02911')).toBeOnTheScreen();
  expect(screen.getByText('26 September 2026')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Next page' }));
  expect(readOwnTasks).toHaveBeenLastCalledWith(expect.anything(), { view: 'day', month: '2026-09-26', offset: 50 }, expect.anything());
  jest.mocked(readOwnTasks).mockResolvedValue({ ...summary, period: '2026-09-01', items: [] });
  await fireEvent.press(screen.getByRole('button', { name: 'Back to month' }));
  await screen.findByText('Daily summary');
  expect(readOwnTasks).toHaveBeenLastCalledWith(expect.anything(), { view: 'month', month: '2026-09-01', offset: 0 }, expect.anything());
});
