# Kickstand card icon — 2026-10-08

Jersson supplied a screenshot of the intended kickstand icon and authorized an equal or similar design. This resolves the source ambiguity recorded in the previous copy-adjustment checkpoint.

`web/public/icons/kickstand.svg` is a vector drawing based on that supplied reference: rounded mounting plate with two transparent bolt holes, inclined support and rounded foot. The card now uses it through the existing 36px CSS mask and circular background. It has no embedded image, script, external URL or runtime dependency. The holes are transparent geometry, so they reveal the card background when rendered as an alpha mask.

The asset is drawn for this project from the user's visual reference; it is not represented as an Ionicons glyph. The existing Ionic license still applies to the other imported icons.

This checkpoint changes only the kickstand asset and its card mapping. The earlier shortened subtitle, real monthly/today values, filters and server authorization remain in place. Existing web tests, lint, typecheck and production build are checked. Local acceptance compares the silhouette with the supplied screenshot and verifies the icon is centered and readable in its card.
