import { submitPublicOrder, type PublicOrderPayload, type UploadTicket } from '../src/lib/supabase/submit-public-order';

const ticket: UploadTicket = { action_id: 'id', before_path: 'before.webp', after_path: 'after.webp' };
const payload: PublicOrderPayload = { bikeId: 'IE12H02911', kickstand: true, locked: false, repositioned: false, notes: '', latitude: 53, longitude: -6, performedAt: '2026-09-24T12:02:00Z', beforeCapturedAt: '2026-09-24T12:00:00Z', afterCapturedAt: '2026-09-24T12:01:00Z' };
const rpc = jest.fn();
const upload = jest.fn();
const info = jest.fn();
const client = { rpc, storage: { from: () => ({ upload, info }) } } as unknown as Parameters<typeof submitPublicOrder>[0];
const read = jest.fn(async () => new ArrayBuffer(10));
beforeEach(() => { jest.resetAllMocks(); read.mockResolvedValue(new ArrayBuffer(10)); rpc.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValue({ data: 'id', error: null }); upload.mockResolvedValue({ error: null }); });

test('uploads both photos before finalising and uses no client employee ID', async () => {
  await expect(submitPublicOrder(client, ticket, payload, read)).resolves.toBe('id');
  expect(upload).toHaveBeenCalledTimes(2);
  expect(upload).toHaveBeenCalledWith('before.webp', expect.any(ArrayBuffer), { contentType: 'image/webp', upsert: false });
  expect(rpc).toHaveBeenLastCalledWith('submit_public_order', expect.objectContaining({ p_action_id: 'id', p_bike_id: 'IE12H02911' }));
  expect(rpc.mock.lastCall![1]).not.toHaveProperty('employee_id');
});
test('does not finalise if one upload fails', async () => {
  upload.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: new Error('offline') });
  info.mockResolvedValue({ data: null, error: new Error('offline') });
  await expect(submitPublicOrder(client, ticket, payload, read)).rejects.toThrow('offline');
  expect(rpc).toHaveBeenCalledTimes(1);
});
test('recognises a previous successful upload without overwriting it', async () => {
  upload.mockResolvedValue({ error: new Error('duplicate') });
  info.mockResolvedValue({ error: null, data: { size: 10, contentType: 'image/webp' } });
  await expect(submitPublicOrder(client, ticket, payload, read)).resolves.toBe('id');
});
test('recovers a lost final response without uploading or inserting again', async () => {
  rpc.mockReset().mockResolvedValue({ data: 'id', error: null });
  await expect(submitPublicOrder(client, ticket, payload, read)).resolves.toBe('id');
  expect(upload).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
});
test('rejects invalid IDs and oversized images', async () => {
  await expect(submitPublicOrder(client, ticket, { ...payload, bikeId: '123' }, read)).rejects.toThrow('Invalid action');
  expect(rpc).not.toHaveBeenCalled();
  read.mockResolvedValue(new ArrayBuffer(5242881));
  await expect(submitPublicOrder(client, ticket, payload, read)).rejects.toThrow('Photo size invalid');
  expect(upload).not.toHaveBeenCalled();
});
