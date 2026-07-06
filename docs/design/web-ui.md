# CCC Web UI design

Status: approved 2026-07-05. Companion to the account service design
(`ccc-account-service/docs/design/account-service.md`), which owns the
platform-wide decisions. Deviations should update this doc in the same
PR.

## 1. Scope

v1 covers exactly what the account service REST API supports:

- Login (username/password), including the forced password change
  after an admin reset.
- Dashboard shell: nav, session indicator, and an intentionally empty
  tile grid. Each future CCC service contributes its own tile, so the
  UI grows service by service the way the platform does.
- Profile: display name, password change, active-session list with
  per-session revoke.
- Users (admin only): list, create, disable, admin password reset
  showing the one-time temp password.

Out of scope for v1: theming beyond the brand pass, PWA/offline,
websockets, i18n.

## 2. Architecture: static SPA, tiny Go server, no BFF

```
browser -- http(s)://<host> --> ingress
                                  |-- /api/account/* --> account-service :8080
                                  `-- /*             --> ccc-web :8080
```

- The Vite build is static files served by a small Go binary
  (embed.FS, SPA fallback, immutable caching for hashed assets, ops
  listener for probes). Node exists only at build time; the runtime
  story matches every other CCC service.
- No BFF. The SPA calls services directly through the ingress. A BFF
  earns its keep aggregating many services or hiding tokens from the
  browser entirely; at household scale it is another deployment for
  nothing.
- Same-origin by construction: UI and API share one hostname, routed
  by path prefix with no rewrites. No CORS anywhere, and the HttpOnly
  refresh cookie just works. The account service serves under
  CCC_HTTP_BASE_PATH (/api/account) to make this possible.

## 3. Auth handling

- Access token lives in module memory only (web/src/api/client.ts).
  Never localStorage or sessionStorage: XSS must not be able to steal
  a persistent credential. The refresh token is an HttpOnly cookie
  the browser manages.
- On load: silent POST /v1/auth/refresh resumes the session or lands
  on /login. On a 401 mid-session: one refresh-and-retry, then back
  to /login.
- Roles come from the authenticated user object and gate navigation
  only. UI gating is UX, not security; enforcement stays server-side.

## 4. Tooling

| concern | choice |
|---|---|
| framework | React 19 + TypeScript (strict), Vite |
| routing | React Router |
| server state | TanStack Query; no Redux/Zustand, one auth context |
| styling | Tailwind v4 + brand tokens from alanchester-brand; vendored shadcn-style components |
| forms | react-hook-form + zod (schemas double as API validation) |
| tests | Vitest + Testing Library + MSW at the network layer |
| lint | oxlint + prettier; tsc in the build |

## 5. Mock-first development

MSW serves the documented account-service API in dev and tests
(web/src/mocks/, sign in as alan/hunter2 or sam/hunter2). UI work
never blocks on backend implementation. As each real endpoint lands,
the matching mock handler is deleted; the mocks are a contract
mirror, not a second backend. VITE_MSW=0 switches dev to the /api
proxy (default target: the ccc-dev stack at http://ccc.localhost).

## 6. Brand

The UI follows amcheste/alanchester-brand: paper canvas, ink chrome,
IBM Plex Sans/Mono (self-hosted, no font CDN, since the homelab must
render without internet egress), sharp corners, AeC monogram as
favicon. Accent discipline is enforced in review: hunter green only
marks data or applied change (user status, change confirmations);
buttons and navigation are ink; destructive actions use rust.

## 7. Resolved decisions

- Ingress controller: Traefik (multi-arch, light on Pi nodes).
- Local hostname: ccc.localhost (browser-spec resolution to
  127.0.0.1, secure context, zero setup). Homelab hostname deferred;
  recommendation on record is a cheap real domain with Let's Encrypt
  DNS-01 wildcards rather than a local CA.
- Node 22 at build time only, pinned in the Dockerfile and CI.
- E2E tests (Playwright) deferred until the real API runs in kind.
