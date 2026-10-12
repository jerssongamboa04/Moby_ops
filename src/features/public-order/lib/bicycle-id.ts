// Keep this rule aligned with public_order_bike_id_format in PostgreSQL.
const bicycleIdPattern = /^(?:IE12H[0-9]{5}|(?:34|39)E[0-9]{7})$/;

export function normalizeBicycleId(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidBicycleId(value: string): boolean {
  return value.length === 10 && bicycleIdPattern.test(value);
}

// Parses scanner text locally. Never opens or fetches the scanned URL.
export function parseBicycleScan(data: string, type: string): string | null {
  if (type !== 'qr') return isValidBicycleId(data) ? data : null;
  if (data.length > 2048 || /[\s\\]/.test(data)) return null;
  if (!data.startsWith('https://mobymove.page.link/scan?')) return null;

  try {
    const url = new URL(data);
    if (url.origin !== 'https://mobymove.page.link' || url.pathname !== '/scan' || url.hash) return null;
    const ids = url.searchParams.getAll('bn');
    if (ids.length !== 1 || !isValidBicycleId(ids[0])) return null;
    return ids[0];
  } catch {
    return null;
  }
}
