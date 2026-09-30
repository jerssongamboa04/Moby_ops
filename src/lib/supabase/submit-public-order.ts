import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidBicycleId } from '../../features/public-order/lib/bicycle-id';

export type UploadTicket = { action_id: string; before_path: string; after_path: string };
export type PublicOrderPayload = {
  bikeId: string; kickstand: boolean; locked: boolean; repositioned: boolean; notes: string;
  latitude: number; longitude: number; performedAt: string;
  beforeCapturedAt: string; afterCapturedAt: string;
};
type Client = Pick<SupabaseClient, 'rpc' | 'storage'>;
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

export async function preparePublicOrder(client: Client): Promise<UploadTicket> {
  const { data, error } = await client.rpc('prepare_public_order');
  if (error) throw error;
  if (!data || !new RegExp(`^${uuid}$`).test(data.action_id) ||
    !new RegExp(`^${uuid}/${data.action_id}/before/${uuid}\\.webp$`).test(data.before_path) ||
    !new RegExp(`^${uuid}/${data.action_id}/after/${uuid}\\.webp$`).test(data.after_path)) throw new Error('Invalid upload ticket');
  return data;
}

export async function submitPublicOrder(client: Client, ticket: UploadTicket, payload: PublicOrderPayload, readPhoto: (phase: 'before' | 'after') => Promise<ArrayBuffer>): Promise<string> {
  if (!isValidBicycleId(payload.bikeId) || !(payload.kickstand || payload.locked || payload.repositioned) ||
    !Number.isFinite(payload.latitude) || Math.abs(payload.latitude) > 90 ||
    !Number.isFinite(payload.longitude) || Math.abs(payload.longitude) > 180) throw new Error('Invalid action');

  // Check a lost response before uploading again. The server verifies ownership.
  const receipt = await client.rpc('public_order_receipt', { p_action_id: ticket.action_id });
  if (receipt.error) throw receipt.error;
  if (receipt.data === ticket.action_id) return ticket.action_id;

  const bucket = client.storage.from('public-order-evidence');
  for (const phase of ['before', 'after'] as const) {
    const path = phase === 'before' ? ticket.before_path : ticket.after_path;
    const body = await readPhoto(phase);
    if (!body.byteLength || body.byteLength > 5242880) throw new Error('Photo size invalid');
    const upload = await bucket.upload(path, body, { contentType: 'image/webp', upsert: false });
    if (upload.error) {
      // May have succeeded remotely despite a lost response. Never overwrite.
      const info = await bucket.info(path);
      if (info.error || info.data?.size !== body.byteLength || info.data?.contentType !== 'image/webp') throw upload.error;
    }
  }
  const { data, error } = await client.rpc('submit_public_order', {
    p_action_id: ticket.action_id, p_bike_id: payload.bikeId,
    p_kickstand: payload.kickstand, p_locked: payload.locked, p_repositioned: payload.repositioned,
    p_notes: payload.notes, p_latitude: payload.latitude, p_longitude: payload.longitude,
    p_performed_at: payload.performedAt, p_before_path: ticket.before_path, p_after_path: ticket.after_path,
    p_before_at: payload.beforeCapturedAt, p_after_at: payload.afterCapturedAt,
  });
  if (error) throw error;
  if (data !== ticket.action_id) throw new Error('Invalid receipt');
  return data;
}
