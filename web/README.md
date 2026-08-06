# Project Atlas (Next.js)

Cinematic family travel log built with:

- **Next.js** + **Tailwind CSS**
- **Motion** (micro-animations)
- **GSAP ScrollTrigger** (trip photo scroll storytelling)
- **Lenis** (smooth scrolling)
- **Three.js / React Three Fiber** (interactive globe)
- **Mapbox GL JS** (trip map — optional token)

## Develop

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Open any trip for the Obys-inspired scroll showcase: pinned scale-up frames, parallax reveals, and a horizontal film-strip scrub.

### Map

The Map page works with no API key — MapLibre + Esri satellite tiles (same imagery style as the classic Cesium map). Optional Mapbox outdoors styling:

```bash
# web/.env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

Toggle **Globe** for the Three.js view with clickable pins.

## Deploy

Pushing to `main` deploys this app to GitHub Pages via GitHub Actions
(`.github/workflows/deploy-pages.yml`) with `NEXT_PUBLIC_BASE_PATH=/Crunch`.

One-time: repo **Settings → Pages → Source → GitHub Actions**.

