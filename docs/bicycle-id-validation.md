# Bicycle identification — 2026-09-23

User-confirmed operational ID: `bn`, not `vehicleId`. Confirmed families: `IE12H` + five ASCII digits, `34E` or `39E` + seven ASCII digits. This validates format, not fleet membership.

`src/features/public-order/lib/bicycle-id.ts` owns the client rule. Barcodes must contain the exact canonical ID. QR codes must contain an HTTPS URL with the exact host `mobymove.page.link`, path `/scan` and exactly one valid `bn`. Other query parameters are ignored, including `vehicleId` and `source`. No URL is opened or fetched. Advertising QR codes are rejected. No fallback to vehicleId or arbitrary numeric values.

Manual entry is trimmed and uppercased on blur. Internal spaces, ambiguous letters and invalid lengths are not repaired. Invalid input shows an inline message; the current screen remains a draft and has no submission implementation. The future submission boundary must validate again. Scanning invalid content preserves the draft and keeps the camera open with a message.

The additive migration `validate_public_order_bicycle_id.sql` adds a CHECK constraint without changing RLS or granting write permissions. Apply once after `create_public_order_tables.sql`. Existing invalid data makes the migration roll back; inspect those rows before any correction. Do not edit previously applied migrations. The SQL test runs on the actual table, needs an existing profile, and rolls back all test inserts. The existing RLS test fixture was updated to use a syntactically valid ID.

## Validation

Run Jest tests for bicycle-id, bicycle-scanner, public-order-screen and index, plus typecheck and lint. SQL scripts must also be executed against the target Supabase schema. Device verification: scan the MOBY QR and printed barcode of the same bike; both must fill the same ID. Scan advertising/product codes and confirm no field overwrite, then a valid code to recover. No new native dependency or APK build is required for this change; use the recently installed camera-enabled development build.

Launcher icon PNG and in-app SVG branding remain a separate pending task.
