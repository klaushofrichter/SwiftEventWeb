# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SwiftEventWeb is a Vue 3 single-page application for viewing and managing SwiftSensors IoT accounts. It integrates with the SwiftSensors public API and is deployed to GitHub Pages with a Cloudflare Worker CORS proxy.

**Stack:** Vue 3 (Composition API, `<script setup>`) · Vite · Pinia · Axios · Tailwind CSS · Playwright

## Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run test         # Run Playwright e2e tests (chromium only)
npm run setup-hooks  # Install git hooks from .hooks/
```

Run a single Playwright test:
```bash
npx playwright test tests/login.spec.js
```

Tests require environment variables: `VITE_SWIFT_SENSORS_USER`, `VITE_SWIFT_SENSORS_PASSWORD`, `VITE_SWIFT_SENSORS_API_KEY`.

## Architecture

### Routing & Auth Flow
- Two routes: `/login` and `/dashboard` (default redirect `/` → `/dashboard`)
- Global navigation guard in `src/router/index.js` checks auth state on every navigation
- Auth store (`src/stores/auth.js`) manages login, token refresh (1 hour before expiry), and local storage persistence

### API Layer (`src/services/api.js`)
- Two Axios instances: `loginApi` (unauthenticated) and `api` (with auth interceptors)
- Request interceptor injects `Authorization: Bearer` and `X-API-Key` headers
- Response interceptor handles 401/403 by refreshing token and retrying the original request
- Services: `authService`, `accountService`, `sensorService`, `notificationService`, `deviceService`, `eagleEyeService`

### CORS Proxy
- **Dev:** Vite proxy rewrites `/proxy/*` → `https://api.swiftsensors.net/*`
- **Prod:** Cloudflare Worker at `cors-proxy/` serves as the proxy. Deploy with `wrangler deploy` from that directory.

### State Management (`src/stores/`)
- `auth.js` — authentication lifecycle, tokens, user info
- `data.js` — sensors, devices, notifications, account info, Eagle Eye cameras

### Views
- `Login.vue` — email/password/API-key login form
- `Dashboard.vue` — main view with sections for account info, devices, sensors, notifications, and Eagle Eye camera integration

### Sensor Data Format
The API returns sensors as arrays (tuples), not objects: `[id, name, type, unitId, lastUpdate, interval, value, activityStatus, unknown, alertFlag]`.

## Build & Deploy

- GitHub Pages base path: `/SwiftEventWeb/`
- `prod` branch push triggers deploy via `.github/workflows/deploy.yml`
- Pre-commit hook on `develop` branch auto-increments patch version in `package.json`
- CI runs Playwright tests on PRs to `prod` via `test-develop.yml`

## Environment Variables

```
VITE_SWIFT_SENSORS_API_KEY          # Required
VITE_SWIFT_SENSORS_API_HOST         # e.g. https://api.swiftsensors.net
VITE_SWIFT_SENSORS_PROXY_API_URL    # /proxy (local dev)
VITE_SWIFT_SENSORS_PROD_PROXY_API_URL  # Production proxy URL
VITE_SWIFT_SENSORS_PROD_APP_DOMAIN  # e.g. klaushofrichter.github.io
```

## Branch Strategy

- `develop` — active development (default branch, PR target)
- `prod` — triggers deployment to GitHub Pages
