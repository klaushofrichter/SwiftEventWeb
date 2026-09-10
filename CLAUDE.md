# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwiftEventWeb is a Vue 3 single-page application for viewing and managing SwiftSensors IoT accounts. It integrates with the SwiftSensors public API and is deployed to GitHub Pages with a Cloudflare Worker CORS proxy. It is a technology demonstration, not affiliated with or supported by SwiftSensors.

**Stack:** Vue 3 (Composition API, `<script setup>`) · Vite · Pinia · Axios · Tailwind CSS · Playwright

Tailwind is v4: there is no `tailwind.config.js` — configuration is CSS-first, `src/index.css` is a single `@import "tailwindcss"`, sources are auto-detected, and the PostCSS plugin is `@tailwindcss/postcss` (autoprefixer is not in the chain; v4 prefixes itself).

## Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run test         # Run Playwright e2e tests (chromium only)
npm run deploy       # Build + push dist/ to the gh-pages branch manually
npm run setup-hooks  # Install git hooks from .hooks/
./test_api.sh        # curl smoke test: fetch an access token with the .env credentials
```

There is no linter or unit-test runner configured — Playwright e2e is the only test suite.

Run a single Playwright test:
```bash
npx playwright test tests/login.spec.js
npx playwright test -g "verify login error handling"   # single test by title
```

Playwright's `webServer` starts `npm run dev` automatically (reusing a running server unless `CI` is set), so no separate dev server is needed. Tests read credentials from `.env` via `dotenv` and require `VITE_SWIFT_SENSORS_USER` and `VITE_SWIFT_SENSORS_PASSWORD` (plus a working `VITE_SWIFT_SENSORS_API_KEY`). Set `PLAYWRIGHT_TEST_BASE_URL` to run the same specs against the deployed GitHub Pages site. Browsers may need `npx playwright install chromium` once.

## Architecture

### Routing & Auth Flow
- Hash history (`createWebHashHistory`) — required for GitHub Pages; URLs look like `/SwiftEventWeb/#/dashboard`
- Two routes: `/login` and `/dashboard` (default redirect `/` → `/dashboard`)
- Global navigation guard in `src/router/index.js` calls `authStore.initialize()` on every navigation, which rehydrates tokens from localStorage and refreshes them if expired
- Auth store (`src/stores/auth.js`) manages login, a refresh timer set 1 hour before expiry, and localStorage persistence (`token`, `refreshToken`, `accountId`, `tokenExpiresAt`, `email`, `apiKey`)

### API Layer (`src/services/api.js`)
- Two Axios instances: `loginApi` (sign-in/refresh, sends only `X-API-Key`) and `api` (adds `Authorization: Bearer`)
- Response interceptor on `api` handles 401/403 by refreshing the token once (`_retry` flag) and retrying; on refresh failure it logs out and redirects to `#/login?session=expired`
- The base URL is chosen at module load by comparing `window.location.hostname` against `VITE_SWIFT_SENSORS_PROD_APP_DOMAIN`; any other host uses the dev proxy path. Getting that env var wrong silently sends production traffic to `/proxy`.
- Services: `authService`, `accountService`, `sensorService`, `notificationService`, `deviceService`, `eagleEyeService`
- Endpoints mix API versions: v1 for account/devices/Eagle Eye/notification-test, v2 for sensors and notification lists

### CORS Proxy
- **Dev:** Vite proxy rewrites `/proxy/*` → `https://api.swiftsensors.net/*`
- **Prod:** Cloudflare Worker in `cors-proxy/` (deploy with `wrangler deploy` from that directory). `ALLOWED_ORIGINS` in `cors-proxy/src/index.js` is a hardcoded allowlist — a fork deploying to a different Pages domain must add its origin there.

### State Management (`src/stores/`)
- `auth.js` — authentication lifecycle, tokens, user info
- `data.js` — sensors, devices, notifications, account info, Eagle Eye cameras
- Sensor and notification list endpoints return an object keyed by account id; the stores unwrap it with `Object.keys(response)[0]`.

### Views
- `Login.vue` — email/password/API-key login form (a supplied API key overrides `VITE_SWIFT_SENSORS_API_KEY`)
- `Dashboard.vue` — the whole app UI in one ~750-line component: account info, devices, sensors, notifications, Eagle Eye cameras, and the camera/notification modals. There is no `src/components/` directory despite the README's project-structure list.
- Dashboard load fans out account/sensors/devices/notifications in parallel, then per-sensor detail calls; Eagle Eye is a sequential chain (creds → test creds → cameras). Camera images arrive as arraybuffers and are converted to base64 for `data:image/png;base64,...` rendering.

### Sensor Data Format
The API returns sensors as arrays (tuples), not objects: `[id, name, type, unitId, lastUpdate, interval, value, activityStatus, unknown, alertFlag]`. Templates index them positionally (`sensor[0]`, `sensor[9]`, …). Per-sensor detail responses carry `eeCameraIds`, which links a sensor to its Eagle Eye cameras.

### Versioning
- `vite.config.js` injects `VITE_APP_VERSION` / `VITE_APP_LAST_COMMIT` from `package.json` at build time; `src/utils/gitInfo.js` reads them and the version string is asserted by the Playwright tests.
- The pre-commit hook bumps the patch version and `last-commit` in `package.json` on `develop` only — don't hand-edit the patch version. Minor/major bumps are manual.
- A `closeBundle` hook runs `scripts/prepare-dist-package.js`, writing a trimmed `dist/package.json` so the deployed site's version can be read from the `gh-pages` branch (the README badges depend on this).

## Build & Deploy

- GitHub Pages base path: `/SwiftEventWeb/`
- `prod` branch push triggers deploy via `.github/workflows/deploy.yml`; `package.yml` then cuts a release, `test-gh-pages.yml` re-runs Playwright against the live site, and failures fan out to Slack (`SLACK_WEBHOOK_URL`) and auto-filed issues
- CI runs Playwright tests on PRs to `prod` via `test-develop.yml`; CodeQL runs via `codeql.yml`
- Build-time env vars must exist as GitHub Actions repository secrets, mirroring `.env`

## Environment Variables

```
VITE_SWIFT_SENSORS_API_KEY             # Required
VITE_SWIFT_SENSORS_API_HOST            # e.g. https://api.swiftsensors.net
VITE_SWIFT_SENSORS_PROXY_API_URL       # /proxy (local dev)
VITE_SWIFT_SENSORS_PROD_PROXY_API_URL  # Production proxy URL
VITE_SWIFT_SENSORS_PROD_APP_DOMAIN     # e.g. klaushofrichter.github.io
VITE_SWIFT_SENSORS_USER                # Optional; used by Playwright
VITE_SWIFT_SENSORS_PASSWORD            # Optional; used by Playwright
```

## Branch Strategy

- `develop` — active development (default branch, PR target)
- `prod` — protected; fed by PRs from `develop`, triggers deployment to GitHub Pages
- `gh-pages` — build output, written by the deploy workflow (or `npm run deploy`)
