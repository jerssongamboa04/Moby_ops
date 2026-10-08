# Metric subtitle adjustment — 2026-10-08

Jersson validated the monthly chart visually and functionally. The metric section subtitle now reads only `Actuaciones válidas` in Spanish and `Valid actions` in English. Counts and duplicate classification retain the existing SQL rules.

The requested exact mobile kickstand icon remains unresolved. Both the available local mobile source and the published feat/authentication public-order-screen.tsx use Ionicons `bicycle-outline` for kickstandPositioned. The web currently uses the same glyph. Published source SHA inspected: 6d4daf5e4f5854481dc4ab8eab75582f742d00d8. A different local mobile component/asset must be identified before replacing it; this patch does not claim to correct that icon.

The two existing card tests check the shortened Spanish/English subtitle while retaining monthly/today count checks. Run web tests, lint, typecheck and build. Local acceptance checks the new copy in both languages; the icon remains pending source confirmation.
