<div align="center">

# ⚡ KOTLIN STUDIO ⚡

### *An immersive, interactive technical experience — from source to signed APK* 📱✨

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=threedotjs&logoColor=white&style=flat-square)
![R3F](https://img.shields.io/badge/React%20Three%20Fiber-ready-e87d0d?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)
![Tests](https://img.shields.io/badge/tests-35%2F35-brightgreen?style=flat-square)
![Console](https://img.shields.io/badge/console-0%20errors-2ea44f?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

<br/>

> 🌟 A **3D phone that listens to the content around it** — code you write, Gradle tasks you run,
> terminal commands you type — and mirrors every step of the Android build pipeline, live on screen.

<br/>

[🚀 Quick Start](#-quick-start) · [✨ Experience](#-the-experience) · [🎨 Design](#-design-language) · [🏗️ Architecture](#-architecture) · [🏆 Quality](#-quality-gates)

<br/>

</div>

---

## 📑 Table of Contents

- [🌟 Overview](#-overview)
- [✨ The Experience](#-the-experience)
- [🎨 Design Language](#-design-language)
- [⚙️ Tech Stack](#-tech-stack)
- [🗂️ Architecture](#-architecture)
- [🚀 Quick Start](#-quick-start)
- [📜 Scripts](#-scripts)
- [🏆 Quality Gates](#-quality-gates)
- [🧠 Engineering Highlights](#-engineering-highlights)

---

## 🌟 Overview

**Kotlin Studio** is a single-page technical editorial site built around a real-time **Three.js phone** that reacts to the content around it. Scroll, code, run builds, type shell commands — the device follows along, turning the Kotlin-for-Android story into a living demonstration instead of a wall of text.

```
💡 concept  →  ✍️ source  →  ⚙️ compile  →  📦 package  →  📲 install  →  🚀 launch
```

---

## ✨ The Experience

| # | Section | What happens there |
|:-:| --- | --- |
| 1️⃣ | 🦸 **Hero** | The phone parks beside the editorial column and sets the tone |
| 2️⃣ | 🧠 **Concepts** | Six properties of Kotlin — each proven by live code beside it |
| 3️⃣ | 🏃 **Code Playground** | Write Kotlin, press **RUN**, and watch a real Gradle task graph drive the device |
| 4️⃣ | 🔧 **Build Pipeline** | `source → compile → package → APK → install → launch`, mirrored live on the phone |
| 5️⃣ | 📟 **Terminal** | Drive Gradle and `adb` **by hand** — the device reacts to what you type |
| 6️⃣ | 🧪 **Compose Lab** | Change state, watch the preview **recompose** in real time |
| 7️⃣ | 📚 **Features · Comparison · Path** | Accordion deep-dives, side-by-side comparisons, step-by-step learning path |

<div align="center">

> 🎬 **Every section is a scene.** The phone moves, the screen changes, the build progresses —
> all driven by one central state machine.

</div>

---

## 🎨 Design Language

A deliberate **graphite + neutral** visual identity — quiet until it needs to speak:

| Token | Value | Role |
| --- | --- | --- |
| 🖤 Background | `#090909` graphite | Deep, matte, distraction-free |
| 🤍 Foreground | `#ecebe8` warm off-white | Comfortable long-form reading |
| 💜 Accent | `#7f52ff` Kotlin purple | **Purposeful only** — active, selected, interactive, status |
| 🩶 Neutrals | `#9b9b9d → #4a4a4d` | Hierarchy without noise |

**Rules of the system**

- ✅ Purple appears **only** where something is active, selected, or interactive
- ✅ Surfaces are near-solid and physical — no rainbow blobs, neon glow, or glass soup
- ✅ 3D scene lit with **neutral studio lighting** — the device looks like hardware, not a toy
- ✅ Motion is layered: **quiet → technical → interactive → wow → quiet**
- ♿ Everything works under `prefers-reduced-motion`

---

## ⚙️ Tech Stack

| Layer | Choice |
| --- | --- |
| ⚛️ Framework | React 19 |
| 🟦 Language | TypeScript (strict, `tsc --noEmit` gate) |
| 🧊 3D | Three.js + React Three Fiber + drei |
| 🎞️ Animation | Framer Motion + Anime.js |
| ⚡ Bundler | Vite 8 (HMR, production build ~340 ms) |
| 🗄️ State | Dependency-free store via `useSyncExternalStore` |

---

## 🏗️ Architecture

```
src/
├── 🧩 components/
│   ├── sections/          # 11 interactive sections + co-located CSS
│   ├── overlays/          # ApkFlight — the APK-to-device moment
│   ├── Nav · CodeBlock · Reveal · Magnetic · Cursor · SectionHeader
│   │
├── 📱 phone/              # the 3D device
│   ├── PhoneScene.tsx     #   lights · materials · particles · halo
│   ├── geometry.ts        #   procedural studio environment map
│   ├── screen.ts          #   canvas-drawn Android UI (build · dashboard · launcher)
│   └── stages.ts          #   stage choreography per section
│
├── 🗄️ store.ts            # central state machine (stage · build · screen · compose)
├── 🔗 hooks/              # useInView · useMediaQuery · usePhoneStage
├── 🧰 lib/                # highlighter · math · pointer · sequence
├── 📚 data/               # content: concepts · features · pipeline · code
└── 🎨 styles/             # design tokens (base.css) + system (ui.css)
```

**Data flow in one line:** *section scroll → stage change → store update → phone + screen react.*

---

## 🚀 Quick Start

```bash
# 1️⃣  Clone and install
git clone https://github.com/ToTheBlankWorld/Kotlin-Studio.git
cd Kotlin-Studio
npm install

# 2️⃣  Launch in dev mode
npm run dev          # ➜  http://localhost:5173
```

```bash
# 3️⃣  Ship it
npm run build        # type-check + production bundle
npm run preview      # serve the optimized build
```

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| 🟢 `npm run dev` | Start the Vite dev server with instant HMR |
| 📦 `npm run build` | Type-check (`tsc --noEmit`) **+** production build |
| 👀 `npm run preview` | Serve the production bundle locally |
| 🟦 `npm run typecheck` | TypeScript strict check only |

---

## 🏆 Quality Gates

<div align="center">

| ✅ Check | Status |
| --- | --- |
| 🧪 Interaction tests | **35 / 35 passing** |
| 🖥️ Console errors | **0** |
| 📱 Responsive audit | **0 problems · 7 viewports** |
| 🎬 `prefers-reduced-motion` | **Fully supported · 0 errors** |
| 🟦 TypeScript strict | **Clean** |
| 📦 Production build | **Green** |

</div>

**Breakpoints verified:** `1440 · 1280 · 1024 · 900 · 768 · 390 · 360`

- ✔️ No horizontal overflow on any viewport
- ✔️ 3D phone visible and correctly framed at every size
- ✔️ All interactive flows work end-to-end (build → install → launch, terminal, compose, filters)
- ✔️ Accessibility: skip link, single `h1`, labelled sections, visible keyboard focus, alt-text coverage

---

## 🧠 Engineering Highlights

- 🎭 **One state machine, many reactions** — a single `stage` drives scroll position, phone pose, screen content, and section highlights in lockstep
- 📺 **Screens are drawn, not mocked** — the phone's Android UI is rendered on a canvas texture (build progress, charts, launcher) and updates live
- 🏭 **Procedural studio lighting** — environment map, neutral three-point rig, and softbox reflections generated in code; no textures to download
- ⚡ **Performance-minded** — DPR clamped, geometry shared, animation gated by media queries and `IntersectionObserver`
- 🧩 **Dependency-light** — state, highlighting, and sequencing are hand-rolled; the phone is the heaviest thing in the room

---

<div align="center">

<br/>

**⭐ If this made you smile, drop a star — it costs nothing and means everything.** ⭐

Made with 💜 for the Kotlin & Android community

[![GitHub](https://img.shields.io/badge/GitHub-ToTheBlankWorld%2FKotlin--Studio-181717?logo=github&logoColor=white&style=flat-square)](https://github.com/ToTheBlankWorld/Kotlin-Studio)

<sub>⚡ Kotlin Studio — from source to signed APK ⚡</sub>

</div>
