# MegMultiMedia portfolio

Static multi-page portfolio. Serve `dist/` with any static HTTP server. Seven routes share `app.js`, `style.css` and `content.js`.

## Content handoff

- `dist/assets/mmm-logo.jpg` is an unchanged copy of IMG_9006.JPG.
- Stock imagery is explicitly illustrative; do not describe these as MMM client projects.
- Set verified email and WhatsApp in `dist/content.js` before enabling contact delivery. The current form only creates a local downloadable enquiry; it sends and stores nothing.
- Add actual client projects, website URLs, approved logos, testimonials, founder portrait and office addresses before public launch. These were not supplied and are not fabricated.
- Current site includes a browser design concept, not an invented client website.
- Equipment and founder name are from the supplied portfolio PDF. Confirm equipment remains accurate at launch.

## Stock photographs

All used under https://unsplash.com/license (free commercial use).
- JC Media — https://unsplash.com/photos/clear-glass-perfume-bottle-with-pink-light-zvqq7CG8BwY
- Adam Jaime — https://unsplash.com/photos/orange-slice-in-a-wine-glass-full-of-orange-liquid-shhT37a3ScY
- Cemrecan Yurtman — https://unsplash.com/photos/a-person-operates-a-professional-video-camera-in-a-studio-QMa2FvZRoF0

## Reference-led refactor — 7 October 2026

The active site uses charcoal and ivory surfaces, the supplied MMM logo, mint/blue accents, large editorial type, interactive production imagery and spatial website previews. All seven routes share the same design system. The Lucid Sway website showcase and Rithwik Pemmada portrait are preserved.

Motion is implemented with native Web Animations, CSS perspective and a shared, event-driven scroll coordinator. There is no arbitrary decorative 3D object, forced intro, custom cursor or scroll interception. Heading reveals and growth-path drawing are finite; pointer tilt is bounded. The header motion control persists in this browser, and system reduced motion takes priority. Content stays visible when animations are disabled.

Visual and interaction references reviewed:

- [Three.js showcase](https://threejs.org/) and [Lusion](https://lusion.co/): immersive studio presentation and image depth.
- [Animos editor](https://animos.app/editor#): composed project surfaces and perspective. Referenced visually; no paid templates or assets copied.
- [Anime.js](https://animejs.com/): staged text reveals and finite path drawing.
- [Motion](https://motion.dev/): scroll-linked transforms and responsive interaction timing.
- [Kokonut UI](https://kokonutui.pro/): consistent, refined interactive surfaces. No paid components copied.
- [Bklit](https://bklit.com/): readable strategy and measurement presentation. Diagram is labelled illustrative, with no invented campaign results.
- [shadcn/ui](https://ui.shadcn.com/): consistent focus states, tabs, form controls and dialog behavior. This static project uses native HTML equivalents.

Verification: JavaScript syntax checks, local asset references, all seven routes at a narrow phone viewport, desktop composition, hero selection, project dialog, keyboard growth tabs, motion pause/resume, responsive website preview and local enquiry preparation.

Before refactoring, the imported source was preserved with tag `snapshot-before-reference-refactor-2026-10-07` and a full Git bundle at `../snapshots/MMM-Portfolio-before-refactor-2026-10-07.bundle`. The earlier Codex website remains in `../megmultimedia` with its separate snapshot.

## Run locally

From this project directory:

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173/. No install or build step is required.
