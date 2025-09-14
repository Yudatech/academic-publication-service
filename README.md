# Academic Publication Search

Small frontend demo using the OpenAlex API to list and explore scholarly works related to climate change, published in Denmark in 2025.

## Stack

Frontend core

React 19 + React-DOM 19 — modern hooks, concurrent-friendly rendering, great ecosystem.

Vite 7 — ultra-fast dev server and lean production builds; painless TS + JSX + HMR.

TypeScript 5.8 — type safety across API models and components.

Data & state

@tanstack/react-query 5 — cache, pagination, and infinite scroll out of the box; retries, background refetch, and Devtools for quick debugging.

zod 4 — runtime validation of OpenAlex responses (defensive parsing + helpful errors).

Routing

react-router-dom 7 — simple, data-aware routing for pages like Search, Dashboard, and Detail.

UI & styling

Tailwind CSS 4 (+ @tailwindcss/vite) — utility-first styling, tiny CSS output, great DX.

tailwind-merge + class-variance-authority — composable, conflict-free class names and variant patterns.

Radix UI primitives (@radix-ui/react-\*) — accessible Dialog/Label/Slot with keyboard and screen-reader support.

lucide / lucide-react — crisp, tree-shakeable icon set.

Charts

chart.js 4 + react-chartjs-2 5 — quick, reliable bar/line charts for institution counts and trends.

Tooling & quality

ESLint 9 + types — consistent code style; React hooks & refresh plugins.

PostCSS + Autoprefixer — cross-browser CSS.

## Run locally

```bash
npm i
cp .env.example .env # set VITE_OPENALEX_MAILTO
npm run dev
```

## Assumptions

### Dataset scope

- Results are restricted to Denmark via institutions.country_code:DK.
- The app focuses on the 2023 to 2025 window for works (with helper endpoints occasionally using 2023–2025 in examples).
- “Institution” shown on list items comes from authorships[].institutions[].display_name, summarized and de-duplicated.

### Search semantics

- The search param is the OpenAlex full-text search across title/abstract/etc. (OpenAlex’s default behavior).
- A query is committed only when the user clicks Search/Enter; minimum length is 2 characters.

### Filtering

- Filters use institutions.id:; multiple IDs are OR’d (A1|A2).
- The filter panel stores selected objects (name + id) but only IDs are sent to the API.

### Abstracts

- Abstracts are reconstructed from abstract_inverted_index on the detail view only (not on list).

### Schema & parsing

- Zod validates API responses; fields frequently null in OpenAlex are treated as optional.
- Items that fail schema validation are skipped to avoid breaking the UI.

### Visualization

- The “Publications per institution” chart uses OpenAlex’s grouped counts (Top 15), plainly counting works without normalization by institution size.

### Environment

- Uses VITE_OPENALEX_MAILTO for OpenAlex’s “polite pool” header.
- Client-side SPA (no backend). Node 18+ expected for local dev.

## Limitations

### Client-only / SEO

- No SSR/SSG; content is fetched client-side. SEO is therefore limited despite meta tags.

### Rate limiting & availability

- Dependent on OpenAlex uptime and quotas. Basic retry is provided by React Query, but heavy browsing may hit limits.

### Partial filtering

- Implemented filter: institutions. Other potential filters (e.g.,authors, concepts, venue types) are not yet included.

### Result fidelity

- Institution names are summarized from authorships and frequency-sorted; multi-affiliations and name variants aren’t canonicalized.
- Works may still contain duplicates across institutions if affiliations are complex.

### Performance trade-offs

- List view fetches a lean select set; details fetch/reconstruct the abstract, which can be heavy on very large works.
- Virtualization is recommended for very long lists; if disabled, rendering many cards can impact FPS

### Testing

- No unit, end-to-end or visual regression tests included; manual testing on modern Chromium/WebKit/Gecko only.

### Error handling

- Only contains rough error handling to know API errors (403 invalid filters, 429 rate limit).

### Charts

- The bar chart is a simple aggregate; it doesn’t adjust for institution size, discipline mix, or deduplicate multi-affiliation counts.

## I'd like to improve with more time

- Have a deeper data understanding & real user needs
- Add author, concept and venue filters; saved filters in URL (shareable deep links).
- Detail route with direct work fetch by ID and richer metrics (reference list, related works).
- Server-side rendering (e.g., Remix/Next) for improved LCP/SEO.
- More robust deduping/canonicalization of institutions and authors.
- Unit/E2E tests (Vitest + Playwright).
- Localization (i18n) and an a11y pass with axe/ARIA audits.
