# CLAUDE.md

This file is read by Claude Code at the start of every session in this repo.

---

## About This Repo

Web UI for the Command and Control Center (CCC) homelab platform.
React 19 + TypeScript + Vite + Tailwind v4 SPA under `web/`, served in
production by a static Go binary (`cmd/ccc-web`) that embeds the built
dist. Multi-arch (arm64 + amd64), CGO disabled, distroless runtime.

Rules that matter here:

- Access tokens live in module memory only (`web/src/api/client.ts`).
  Never put tokens in localStorage or sessionStorage; the refresh
  token is an HttpOnly cookie owned by the browser.
- All API calls go through the typed `api()` client with zod schemas.
  Endpoints and shapes must match the account service design doc; MSW
  handlers in `web/src/mocks/` mirror them and get deleted as real
  endpoints land.
- Same-origin is load-bearing: the SPA calls `/api/account/...`
  relative paths routed by the ingress. Never introduce an absolute
  API base URL or CORS config.
- Never edit `internal/webfs/dist/` beyond the committed placeholder;
  the real UI is copied in during the Docker build only.
- UI role gating (hiding admin nav) is UX, not security. Enforcement
  belongs to the services.

---

## Developer Preferences

### Editor
- Primary: Vim
- AI editor: Cursor

### Shell
- zsh, minimal prompt

### Git & GitHub Workflow
- **Branch model:** `main` = latest release. `develop` = integration branch.
- Always branch from `develop`, never commit directly
- PRs always target `develop`
- `main` is only updated via CLI merge (`git merge --no-ff origin/develop`) by `/publish-release` — **never via a GitHub PR**. GitHub's merge button squash-merges by default, dropping ancestry and causing conflicts on the next release.
- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`

### Scripting Standards
- Shell scripts must pass `shellcheck`
- Use `set -euo pipefail`
- Scripts should be idempotent

---

## Brand

This repo descends from [`amcheste/repo-template`](https://github.com/amcheste/repo-template), which is brand-aligned with [`@amcheste/brand`](https://github.com/amcheste/alanchester-brand). Badge colors (Hunter Green `#1F4D3A`, Ink `#0B0B0C`) match the brand by default.

When generating prose, follow the brand voice rules at [`voice.md`](https://github.com/amcheste/alanchester-brand/blob/main/docs/voice.md): no em dashes in prose, calibrated hedges over weak ones, lowercase eyebrows, numerical specificity. Hunter green is reserved for data, pivots, and the δ; don't use it as decoration.

For deeper brand integration (palette adoption, mark embedding, full theming sweep), paste [`docs/theming-prompt.md`](https://github.com/amcheste/alanchester-brand/blob/main/docs/theming-prompt.md) from the brand repo into a Claude Code session in this repo.

---

## Learned Preferences

<!-- Claude Code will suggest additions here as patterns emerge across sessions -->
