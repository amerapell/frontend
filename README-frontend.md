# Amerapelle — frontend

Next.js 15 (App Router, TypeScript) storefront + admin. Deploys to Vercel (no `vercel.json` needed — framework auto-detected).

## Run

```bash
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL to the NestJS API
npm install
npm run dev                    # http://localhost:3000
NEXT_PUBLIC_USE_MOCKS=true npm run dev   # full UI on the bundled mock dataset, no API
npm run typecheck && npm run lint && npm run build
```

`next build` succeeds with no API running: every server fetch goes through `safe()` with a fallback, dynamic routes use `generateStaticParams() → []` + ISR, and query-string routes are `force-dynamic`.

## Structure

- `src/lib/types.ts` — mirrors `docs/api-contract.md`. Money is integer kobo; `naira()` formats `₦185,000`.
- `src/lib/api/*` — the only place that talks HTTP: `client.ts` (base URL, Bearer token in memory, `X-Cart-Token`, 401 → `POST /auth/refresh` with the httpOnly `ap_rt` cookie → retry, Nest error shape) and one module per domain (catalog, cart, checkout, auth, account, exchanges, admin).
- `src/lib/mocks/*` — mock dataset + in-browser mock of every endpoint. Used only when `NEXT_PUBLIC_USE_MOCKS=true`, or in development when the API is unreachable. Never in production.
- `src/context/*` — `useSettings`, `useAuth`, `useCart` (drawer, star flight, bump, guest token, merge on login), `useWishlist`, `useToast`, `useUI`.
- `src/components/patterns/Patterns.tsx` — `<AdirePattern/>`, `<AdireRedStars/>`, `<AsookeStripe height/>`, cut-paper collage; SVG defs with `useId`.
- `src/components/motion/*` — drop takeover, shop the reel. Card → PDP view transition + star flight live in `src/lib/motion.ts`.
- `src/styles/*` — plain CSS: tokens, base, motion (all disabled under `prefers-reduced-motion`), chrome, components, pages, admin.
- Fonts: `@fontsource` woff2 files copied to `src/app/fonts`, loaded with `next/font/local` (latin + latin-ext so ₦ renders in brand faces) → `--font-serif`, `--font-sans`, `--font-mono`.

## Notes / assumptions

- API calls from the browser go to same-origin `/api/v1/*`; `next.config.ts` rewrites them to `NEXT_PUBLIC_API_URL` (set it on Vercel, or the rewrite is skipped and the browser calls the API directly). This keeps the httpOnly `ap_rt` refresh cookie first-party so customers stay signed in on Safari and in-app browsers. Server-side fetches call the API URL directly.

- Drop "first run closes in" countdown = `goLiveAt + 48h` (`FIRST_RUN_HOURS` in `src/lib/drop.ts`) — the contract has no end time.
- Admin JWT is kept in `sessionStorage` (survives reload within the tab); the customer access token is memory-only.
- UTM (`utm_source/medium/campaign`, or Instagram/TikTok/WhatsApp referrer) is captured on landing to localStorage + cookie and sent on `POST /cart`.
- Mock mode: any password ≥ 4 chars signs in as "Ada"; admin login accepts any credentials and any 6-digit TOTP code.
