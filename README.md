# Project Atlas

Travel log: **https://gracurdy.github.io/Crunch/**

## Live site

The cinematic Next.js site is published to the **`gh-pages`** branch.

### Pages setting (required)

**Settings → Pages → Build and deployment**

1. Source: **Deploy from a branch**
2. Branch: **`gh-pages`** / **`/` (root)**
3. Save

Do **not** use “GitHub Actions” as the Pages source — that deploy path errored and left the old site up.

After saving, hard-refresh the site. You should see full-bleed trip heroes and scroll photo galleries.

- Main site: https://gracurdy.github.io/Crunch/
- Classic admin (add/edit trips): https://gracurdy.github.io/Crunch/classic/

## Develop locally

```bash
cd web
npm install
npm run dev
```

## How deploy works

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which builds `web/` and force-publishes to `gh-pages`.

## Sign in (classic admin)

Password-only. One-time token seal from the repo root:

```bash
PASSWORD='your-password' TOKEN='your_fine_grained_token' node scripts/seal-secret.mjs
```
