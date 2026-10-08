# Summary monthly chart

Date: 2026-10-08. Status: implemented and automatically checked; real-data and visual browser review pending.

## Product checkpoint

Jersson reviewed the hero and filters and requested progression down the approved Summary design. This block adds the **Actuaciones por mes** panel above the existing cards, preserving the approved controls. It displays the selected month and the preceding three months, with actual valid activity and invalid submissions kept separate. At the January 1900 lower bound, only supported months are included.

Appearance follows the reference: white rounded container, dark green closed-month bars, neon MOBY current-month bar with an En curso label, monthly values, range description, and a separate selected-month valid/invalid total. A historical selection is not labeled in progress. The current-month note states that it is accumulated up to today, avoiding a misleading comparison with closed months. This checkpoint does not change the kickstand icon; its correction remains pending with the metric-card review.

## Data and architecture decision

No migration or dependency is necessary. The existing authorized `read_team_summary_metrics_filtered` RPC already returns any supported monthly aggregate. `readSummaryMonthlySeries` composes up to three previous-month calls concurrently using the same request-scoped server client. The selected month's existing response is reused for the chart, selected-month totals and cards. This avoids duplicated counting logic and another selected-month read.

Every response is validated by the existing metrics service: month, selected person, real Dublin date, counts, errors and authorization. There is no client-side aggregation of individual bicycle records, direct team table access, administrative key or shared user cache. The selected collaborator applies to all months. Repeated records and Dublin timezone/DST rules remain exclusively in the previously validated SQL engine.

The composition returns only month/day and aggregate valid/invalid series. Earlier-month errors do not invent missing bars or zeros: the chart displays its own error and the existing valid selected-month cards remain available. A 42501 from any read redirects to access denied. Results spanning different Dublin dates are rejected rather than combined during a midnight boundary; Refresh rereads the selected route.

The implementation makes at most three additional aggregate RPC reads per successful Summary request, each using the existing ten-second abort signal. This is bounded and keeps the existing data contract. If measured query times become a problem as data grows, assess a combined SQL query with the same counting engine before changing architecture.

## UI and accessibility

- ES/EN uses the existing locale provider, including month names and formatted numbers.
- The SVG is presentational; a visually hidden semantic table exposes all months and valid/invalid values to assistive technology.
- Totals remain separately labeled outside the SVG.
- Real zero months render zero and an explicit empty-period message when all valid counts are zero; invalid totals still remain visible.
- The same filters, URL history and Refresh action update the complete Summary view. No timestamp is reintroduced.
- The panel stacks its totals at narrow widths. Final placement, dimensions and typography must be reviewed in the local browser against the approved reference.

## Validation

Automated coverage includes four ordered months, cross-year ranges, January 1900, collaborator preservation, exact reuse of the selected response, unavailable/invalid/denied responses, mixed-date rejection, real zero activity, separate invalid totals, partial and historical labels, ES/EN, accessible tabular data and server authorization revoked during previous-month reads. Existing filter, auth, session and card tests also run.

Run from `web/`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Local acceptance before committing:

1. Open Summary with All collaborators. Check the last bar and right-hand valid total equal the attended card. Invalid submissions must not be added to that number.
2. Select a collaborator and a historical month. Check all four bars follow the selection and the chosen month has no En curso label.
3. Check months without activity show real zeros. With only recent data, older bars should be zero; no fixture values are inserted.
4. Refresh and verify filters remain selected. Test ES/EN, reload and Back/Forward.
5. Compare the panel with the approved mockup at desktop and narrow widths. A browser screenshot can identify any spacing correction before the next block.

This patch modifies only the web chart, server composition, translations, tests and this document. It performs no remote publication or database writes.
