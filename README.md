# Kotlin Studio

An immersive, interactive technical experience that tells the story of Kotlin for Android — from source to signed APK.

**Live stack:** React 19 · TypeScript (strict) · Three.js / React Three Fiber · Vite

## What it is

Kotlin Studio is a single-page technical editorial site built around a 3D phone that reacts to the content around it:

- **Hero & concepts** — the phone parked beside the editorial column
- **Code playground** — write Kotlin, press RUN, and watch a real Gradle task graph drive the device
- **Build pipeline** — source → compile → package → APK → install → launch, mirrored live on the phone
- **Terminal** — drive Gradle and `adb` by hand; the device reacts to what you type
- **Compose lab** — watch the preview recompose as you change state
- **Features, comparison, learning path** — accordion, side-by-side comparisons, and a step-by-step path

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Type-check (`tsc --noEmit`) + production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | TypeScript strict check only |

## Quality gates

- 35/35 interaction tests passing
- 0 console errors
- Responsive across 1440 / 1280 / 1024 / 900 / 768 / 390 / 360
- `prefers-reduced-motion` fully supported
- TypeScript strict, production build green
