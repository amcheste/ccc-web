<div align="center">

# ccc-web

**Web UI for the Command and Control Center: React SPA served by a static Go binary.**

[![Validate](https://github.com/amcheste/ccc-web/actions/workflows/validate.yml/badge.svg)](https://github.com/amcheste/ccc-web/actions/workflows/validate.yml)
[![Version](https://img.shields.io/github/v/tag/amcheste/ccc-web?label=version&sort=semver&color=0B0B0C)](https://github.com/amcheste/ccc-web/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-1F4D3A.svg)](LICENSE)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/amcheste/ccc-web/badge)](https://scorecard.dev/viewer/?uri=github.com/amcheste/ccc-web)

</div>

---

React 19 + TypeScript + Vite, Tailwind v4, TanStack Query, and React
Router. At runtime it is a single static Go binary on distroless
serving the built SPA; Node exists only at build time. The design doc
lives in the account service repo alongside the API it consumes:
[account-service.md §UI](https://github.com/amcheste/ccc-account-service/blob/develop/docs/design/account-service.md).

## v1 pages

Login (username/password), dashboard shell (future services plug tiles
in), profile (password change, session management), and admin user
management. Auth follows the platform design: access token in memory
only, refresh token in an HttpOnly cookie, one silent
refresh-and-retry on 401.

## Development

```sh
make web-dev  # Vite dev server with hot reload + MSW mocks
make test     # vitest + Go tests
make lint     # oxlint + prettier + golangci-lint
make build    # Go server (embeds a placeholder page)
make docker   # full image: Vite build + Go build + distroless
```

MSW serves the documented account-service API in dev (sign in as
`alan`/`hunter2` admin or `sam`/`hunter2` member), so UI work never
blocks on backend implementation. Set `VITE_MSW=0` to hit a real
backend through the `/api` proxy instead; the default proxy target is
the ccc-dev stack at `http://ccc.localhost`.

The real UI is compiled into the container image only. The committed
`internal/webfs/dist/` holds a placeholder so `go build` works without
Node; the working tree never gets a generated dist copied into it.

### Local cluster (kind)

```sh
make kind-up      # create the ccc kind cluster and deploy
make kind-deploy  # rebuild and roll the image
make kind-down    # tear down
```

For the full integrated stack (UI + API + ingress at
http://ccc.localhost), use [ccc-dev](https://github.com/amcheste/ccc-dev)
instead.

## Deployment

`deploy/base/` is the generic kustomize base; the private ccc-deploy
repo overlays namespace, image pins, and ingress. API traffic never
touches this process: the ingress routes `/api/*` directly to the
owning service, which is what makes the auth cookies same-origin.
