---
name: verify
description: Build, launch, and visually verify the Angular portfolio frontend
---

# Verify the portfolio frontend

## Build

```powershell
cd frontend
npx ng build --configuration development
```

## Launch

```powershell
npx ng serve --port 4267   # run in background; ready when http://localhost:4267/ returns 200
```

The backend is usually NOT running. The home page calls `/api/v1/profile`,
`/api/v1/skills`, `/api/v1/experiences`, `/api/v1/projects`, `/api/v1/education`,
`/api/v1/certifications` (see `src/app/core/models.ts` for shapes). Without data the
page shows skeletons — mock these at the network layer to see real content.

## Drive (headless Chrome)

`npm i -D puppeteer-core --no-save` (remove after: `npm rm puppeteer-core --no-save`)
and use the locally installed Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Launch with
`args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']` so WebGL
(three.js background, skill cloud) renders in headless mode. Use
`page.setRequestInterception(true)` to stub the `/api/v1/*` routes above.

Flows worth capturing: hero at top (three.js particle galaxy + fresnel
crystal/torus, lazy chunk — wait ~3s after load), dark mode via the navbar
theme-toggle button, the project lightbox opened via keyboard (focus card,
Enter; Escape must close it), `prefers-reduced-motion: reduce` (page must
still render a static 3D frame), and a 390px-wide viewport (also assert
`document.documentElement.scrollWidth <= clientWidth`).

## Gotchas

- Don't name a script constant `URL` — it shadows the global needed by
  `new URL()` inside request interception handlers.
- Node scripts living outside `frontend/` must require puppeteer-core by
  absolute path (`frontend/node_modules/puppeteer-core`).
- The typing animation in the hero means the role line may be mid-delete
  (blank) in any single screenshot — not a bug.
