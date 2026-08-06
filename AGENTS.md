# AGENTS.md

Frontend for Elanova ECM (salon management SaaS) — React 19 + Vite + TypeScript + Tailwind CSS v4. This is a git repo whose root is only this `frontend/` dir (siblings `backend/`, `apis/`, `DOCS/` exist one level up but are separate).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — runs `tsc -b && vite build`; type errors fail the build
- `npm run lint` — ESLint (flat config)
- No test suite exists.

## Environment & API

- `.env` is gitignored; keep `VITE_API_URL` (currently `http://127.0.0.1:5000`). Read via `import.meta.env.VITE_API_URL` in `src/utils/constants.ts` (never hardcode the URL).
- Axios base URL is `VITE_API_URL + /api/v1` (`src/api/endpoint.ts`, `src/api/axios.ts`).
- The axios response interceptor injects `statusCode` into success responses and rejects with a normalized `ApiError` (`{success, statusCode, message, data}` from `src/utils/response.ts`) — handle errors in that shape, not raw `AxiosError`.

## Architecture — mock data vs. API (most important)

There are TWO data systems; most admin features do NOT touch the API:

- **`src/api/services/`** — real backend calls. Only auth and user endpoints are wired up (`login`, `register`, `current-user`).
- **`src/data/`** — static mock seeds (services, stylists, customers, appointments, inventory, …).
- **`src/store/SalonDataContext.tsx`** is the working "backend" for all admin features: it seeds from `src/data/` and persists to localStorage under `salon:*` keys. Mutations (bookings, invoices, stock, campaigns, loyalty) go through its helpers. To add a new admin feature, extend this context — do not invent new API calls unless you're also adding backend support.
- Auth state lives in `src/store/AuthContext.tsx`: `token` + `user` in localStorage, session re-validated against `/current-user` on load.

## Routing & pages

- `react-router-dom` v7 `BrowserRouter`, all routes in `src/App.tsx`.
- Public pages use `SiteLayout`; admin pages use `AdminLayout` under `/admin/*`, gated by `ProtectedRoute` (`src/routes/ProtectedRoute.tsx`) — auth required; it shows a loading screen while the session check runs.
- `/book` is the customer-facing booking flow (no auth). `/login`, `/register`, `/onboard` are full-page auth routes.
- Do NOT point any route at `src/pages/Blanky.tsx` — it's a leftover dev page with an infinite re-render loop. Use `BlankPage.tsx` instead.

## Styling

- Tailwind v4 via `@tailwindcss/vite` — no `tailwind.config.js`. Brand palette and fonts are defined in the `@theme` block at the top of `src/App.css` (`ink`, `forest`, `sand`, `gold`, `blush`; Fraunces/Inter/IBM Plex Mono). Add new brand colors there.

## TypeScript / lint conventions

- `verbatimModuleSyntax` is on: use `import type` for type-only imports or the build fails.
- `noUnusedLocals` / `noUnusedParameters` are on — dead code fails `npm run build`.
- `erasableSyntaxOnly`: no enums, namespaces, or class parameter properties.
- ESLint enforces `react-refresh/only-export-components`; context files export their context object alongside a component, so keep the existing `// eslint-disable-next-line react-refresh/only-export-components` comment pattern.

## Deploy (from README)

`npm run build` then copy `dist/*` to `/var/www/html` on the nginx host; nginx needs `try_files $uri /index.html;` (SPA fallback) and `sudo systemctl restart nginx`.

## Misc

- `src.zip` at the repo root is an untracked backup artifact — don't commit or modify it.
- No CI, no pre-commit hooks. Do not commit unless asked.
