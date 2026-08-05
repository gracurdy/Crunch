# Project Atlas

Travel log: **https://gracurdy.github.io/Crunch/**

## Why there are two apps

| Location | What it is |
|----------|------------|
| `web/` | **New experience** — cinematic scroll galleries, Lenis, GSAP, MapLibre/globe |
| Repo root (`app.js`, …) | **Classic SPA** — login + admin for saving trips/photos |

GitHub Pages used to serve only the classic root SPA, so the new look never appeared on the live site. Deploying `web/` fixes that.

## Live site deploy

Pushing to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which:

1. Builds the Next.js app with `NEXT_PUBLIC_BASE_PATH=/Crunch`
2. Bundles classic admin at `/Crunch/classic/`
3. Publishes to GitHub Pages

### One-time Pages setting

In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**

After that, the live site is the new scroll experience. Trip editing stays at:

`https://gracurdy.github.io/Crunch/classic/#admin`

## Local development

```bash
cd web
npm install
npm run dev
```

Classic admin only:

```bash
python3 -m http.server 8080
```

## Sign in (classic admin)

Password-only login. One-time token seal:

```bash
PASSWORD='your-password' TOKEN='your_fine_grained_token' node scripts/seal-secret.mjs
```

See prior README notes for fine-grained token setup (Contents: Read and write on **Crunch** only).
