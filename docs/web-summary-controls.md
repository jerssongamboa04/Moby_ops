# Summary controls: collaborator, month and refresh

## Scope

This checkpoint connects the controls immediately below the approved hero to real Supabase data. It follows the SQL checkpoint `033709a` and the hero/metrics checkpoint `c42e8e2`. It adds no dependencies or database migrations.

The four existing metric cards consume the same selection. Further chart, card styling and collaborator-table work remain separate checkpoints. The distinct kickstand icon is still pending in the card correction checkpoint.

## Behavior and data

- Default selection: all collaborators and the current month in Europe/Dublin.
- Selection lives in the URL (`month=YYYY-MM` and optional `employee=UUID`). Reloading, sharing the URL and browser history preserve it.
- Both controls retain the other selection. Refresh reloads the current route without changing its filters.
- Both selectors use styled, non-modal panels opened by their entire button, including the chevron. The month panel provides a twelve-month grid and previous/next-year buttons, localized in ES/EN. The server rejects invalid, repeated and future parameters, including dates before January 1900.
- The protected server page authenticates and checks the active supervisor before querying either RPC.
- `read_team_summary_metrics_filtered` supplies the monthly totals and actual today's totals for the chosen person or team. Historical monthly totals do not replace today's figures.
- `read_team_summary_collaborators` supplies only ID, name and active status. Eligible inactive collaborators retain an explicit inactive label. Duplicate names include IDs for disambiguation.
- Both reads use the authenticated request client and a ten-second abort signal. They run concurrently without a shared application cache.
- A revoked SQL authorization redirects to access denied even if the initial profile check succeeded.
- Malformed URL parameters produce a reset link and no metrics/list query. Provider failures display an error rather than fabricated zeros. A list failure disables its selector while independently successful metrics remain visible.
- The update timestamp is not displayed, as requested. The server timestamp remains available for the hero date and response validation. Refresh and pending controls share one bar above the cards.

## Appearance

The control bar uses the existing typography and mobile Ionicons outlines (people, calendar and chevron) under the existing icon license. The approved hero remains unchanged. There is no breadcrumb in the current dashboard source; production servers must be restarted after rebuilding to serve the current result.

## Validation

Automated coverage includes URL validation and Dublin month boundaries, server authorization and RPC parameters, historical-versus-today counts, response validation, minimal roster fields, real zeros, failure states, collaborator/month selection, ES/EN labels and manual refresh. Run from `web/`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Manual acceptance before committing:

1. Select a collaborator and confirm actual monthly and today's values against the database. Return to all collaborators.
2. Select a historical month; confirm its monthly values and that today's values remain today's.
3. Reload and use Back/Forward: URL, controls and cards must agree.
4. Refresh the selected view; confirm that no update time appears. Try ES/EN and keyboard navigation.
5. Open an invalid URL such as `/?month=2099-01`; confirm the reset action and absence of fabricated counts.
6. Review the control bar against the approved mockup at desktop and narrow widths. Panel placement and visual alignment require local browser review. Open by clicking the chevron; close with Escape, the Close button or outside click; verify focus restoration.

Do not commit `.env.local`, archived patches, editor settings or unrelated mobile assets. No additional SQL execution is needed for this checkpoint; the filter migration was already applied and validated.

## Filter appearance correction — 2026-10-08

User feedback: native controls looked inconsistent and the chevron did not open the collaborator selector. Replaced them with white, rounded panels using pale green hover and MOBY neon for the selected month. Native radio inputs preserve collaborator keyboard interaction; the month choices are labeled buttons with future months disabled. Both panels move focus inside on opening, support Escape and a visible Close action, and preserve intentional focus moves outside. No modal claim or focus trap is used because the rest of the dashboard remains interactive.

This correction changes presentation and interaction only: the authorized SQL functions, URL format, real counts and refresh logic retain their responsibilities. Automated tests cover chevron activation, focus, keyboard/outside dismissal, historical-year navigation, minimum/future bounds and removal of the displayed timestamp. Browser appearance remains subject to local review.
