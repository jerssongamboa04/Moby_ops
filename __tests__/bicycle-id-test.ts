import { isValidBicycleId, normalizeBicycleId, parseBicycleScan } from '../src/features/public-order/lib/bicycle-id';

const qr = 'https://mobymove.page.link/scan?bn=IE12H02911&vehicleId=2024120074&source=ridemovi.com';

test.each(['IE12H02911', 'IE12H13749', '39E1200806', '34E1200012'])('accepts known family %s from barcode and QR', (id) => {
  expect(isValidBicycleId(id)).toBe(true);
  expect(parseBicycleScan(id, 'code128')).toBe(id);
  expect(parseBicycleScan(`https://mobymove.page.link/scan?bn=${id}`, 'qr')).toBe(id);
});

test.each(['', '2024120074', '1234567890123', 'IE12H0291', 'IE12H029111', '35E1200806', 'IE12HO2911', 'IE12H02911\n', 'IE12H 2911', 'ie12h02911', '３４E1200012'])('rejects invalid scanned ID %j', (id) => {
  expect(isValidBicycleId(id)).toBe(false);
  expect(parseBicycleScan(id, 'code128')).toBeNull();
});

test('extracts bn without confusing it with vehicleId', () => {
  expect(parseBicycleScan(qr, 'qr')).toBe('IE12H02911');
  expect(parseBicycleScan(qr, 'code128')).toBeNull();
});

test('normalises manual input without guessing ambiguous characters', () => {
  expect(normalizeBicycleId('  ie12h02911  ')).toBe('IE12H02911');
  expect(isValidBicycleId(normalizeBicycleId('IE12HO2911'))).toBe(false);
});

test.each([
  qr.replace('https:', 'http:'),
  qr.replace('mobymove.page.link', 'mobymove.page.link.evil.test'),
  qr.replace('mobymove.page.link', 'freenow.com'),
  qr.replace('/scan?', '/other?'),
  qr.replace('/scan?', '/x/../scan?'),
  qr.replace('mobymove.page.link', 'user@mobymove.page.link'),
  qr.replace('bn=IE12H02911', 'vehicle=IE12H02911'),
  qr.replace('bn=IE12H02911', 'bn='),
  qr.replace('bn=IE12H02911', 'bn=2024120074'),
  `${qr}&bn=IE12H13749`,
  `${qr}&%62n=IE12H02911`,
  `${qr}#fragment`,
  `${qr}\n`,
  qr.replace('bn=IE12H02911', 'bn=IE12H02911%0A'),
  'https://mobymove.page.link/scan?bn=%ZZ',
  'IE12H02911',
  `${qr}&x=${'x'.repeat(2048)}`,
])('rejects unrelated, malformed or ambiguous QR %s', (data) => {
  expect(parseBicycleScan(data, 'qr')).toBeNull();
});
