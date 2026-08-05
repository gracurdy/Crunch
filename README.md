# Project Atlas

Travel log: **https://gracurdy.github.io/Crunch/**

## New experience (`web/`)

A Next.js rebuild with cinematic trip photo scrolling (GSAP + Lenis), Motion micro-animations, a Three.js globe, and optional Mapbox.

```bash
cd web
npm install
npm run dev
```

Open a trip to see the scroll showcase. Details in [`web/README.md`](web/README.md).

## Classic SPA (repo root)

The current GitHub Pages site still uses the vanilla app for login/admin and the Cesium globe.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Sign in on the classic site

The website login is **password only**.

## One-time owner setup (required)

Saving trips needs a one-time Terminal setup. Do **not** paste the command or token into `config.js`.

### 1. Create a fine-grained token
GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token

- Repository access: only **Crunch**
- Permissions → **Contents: Read and write**
- Copy the token once

### 2. Run this in Terminal (from the repo folder)

```bash
PASSWORD='clarity' TOKEN='paste_your_new_token_here' node scripts/seal-secret.mjs
```

Use your real password and a **new** token. This rewrites `authSalt`, `authIv`, and `sealedSecret` in `config.js`.

### 3. Commit and push `config.js`

After GitHub Pages updates, sign in on the site with that same password only.

### If login still fails
- Make sure `sealedSecret` in `config.js` is a long value, not `''`
- Create a brand-new token and run the Terminal command again
- If a token was ever pasted into `config.js` or a chat, revoke it on GitHub and make a new one
