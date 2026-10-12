import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidBicycleId } from '../../features/public-order/lib/bicycle-id';

export type TaskDay = { day: string; total: number; counted: number; repeated: number };
export type TaskReceipt = {
  id: string; bike_external_id: string; created_at: string; day: string; counted: boolean;
  kickstand_positioned: boolean; bike_locked: boolean; bike_repositioned: boolean;
};
export type OwnTasks = {
  today: string; current_month: string; period: string; refresh_after_ms: number;
  total: number; counted: number; repeated: number; has_more: boolean;
  days: TaskDay[]; items: TaskReceipt[];
};
// The existing RPC date argument p_month also accepts an exact date for view=day.
export type TasksQuery = { view: 'today' | 'month' | 'day'; month: string | null; offset: number };
type Client = Pick<SupabaseClient, 'rpc'>;

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const date = (value: unknown): value is string => typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const count = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
const totals = (value: Record<string, unknown>) => count(value.total) && count(value.counted) &&
  count(value.repeated) && value.total === value.counted + value.repeated;

export async function readOwnTasks(client: Client, query: TasksQuery, signal?: AbortSignal): Promise<OwnTasks> {
  const request = client.rpc('read_own_tasks', {
    p_view: query.view, p_month: query.month, p_offset: query.offset,
  });
  const { data, error } = await (signal ? request.abortSignal(signal) : request);
  if (error) throw error;
  if (!record(data) || !date(data.today) || !date(data.current_month) || !date(data.period) ||
    !totals(data) || typeof data.has_more !== 'boolean' || !count(data.refresh_after_ms) ||
    data.refresh_after_ms < 1 || data.refresh_after_ms > 90000000 ||
    !Array.isArray(data.days) || data.days.length > 31 ||
    !data.days.every((day: unknown) => record(day) && date(day.day) && totals(day)) ||
    !Array.isArray(data.items) || data.items.length > 50 ||
    !data.items.every((item: unknown) => record(item) && typeof item.id === 'string' &&
      /^[0-9a-f-]{36}$/i.test(item.id) && typeof item.bike_external_id === 'string' &&
      isValidBicycleId(item.bike_external_id) && date(item.day) &&
      typeof item.created_at === 'string' && Number.isFinite(Date.parse(item.created_at)) &&
      ['counted', 'kickstand_positioned', 'bike_locked', 'bike_repositioned'].every((key) => typeof item[key] === 'boolean'))) {
    throw new Error('Invalid tasks response');
  }
  return data as unknown as OwnTasks;
}
