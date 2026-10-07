# MegMultiMedia portfolio

The active website is the static project pulled from `lucidswayclub-source/MMM-Portfolio`. Serve `dist/`; no installation or build step is required.

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173/.

## Studio redesign — 7 October 2026

One continuous homepage uses a design system with deep green surfaces, mint and blue brand accents, soft typography, precise borders and spacious layouts. The supplied MMM logo remains unchanged.

- The homepage centres the company name over a continuously moving image wall. Alternating columns of imagery and original typographic studies share a CSS perspective plane behind the text. Dark overlays preserve contrast; motion pauses offscreen and has a static reduced-motion fallback.
- Services use the original pulled version’s pinned, orbiting category animation: Creative, Production, Digital and Growth scroll into focus, with their service lists alongside. Clicking categories and keyboard navigation also work.
- The desktop portfolio uses a native-scroll pinned exhibition; mobile and reduced-motion views use a swipe gallery. Keyboard focus brings the selected project into view.
- A growth workspace connects each strategy stage to deliverables and relevant measurement categories. Its chart is explicitly illustrative, with no live performance claims.
- The Lucid Sway website preview morphs between desktop and mobile dimensions. A portrait sequence introduces Rithwik Pemmada on the homepage.
- Scroll reveals, pointer depth and device arrival transitions are coordinated without wheel interception. Offscreen scenes do not run a continuous animation loop. OS reduced motion and a footer motion toggle provide static layouts.

`app.js` renders content and controls. `style.css` defines the design. `motion.js` and `motion.css` implement animation. No paid components or templates were copied.

Design references reviewed: [Three.js](https://threejs.org/), [Animos](https://animos.app/editor), [Anime.js](https://animejs.com/), [Motion](https://motion.dev/), [Kokonut UI](https://kokonutui.pro/), [Bklit UI](https://bklit.com/), and [shadcn/ui](https://ui.shadcn.com/). This static implementation uses native CSS, SVG and Web Animations rather than importing their libraries.

## Content

- `assets/mmm-logo.jpg`: supplied MMM logo.
- `assets/lucidsway-desktop.png` and `assets/lucidsway-mobile.png`: supplied real website screenshots, linking to https://thelucidsway.com/.
- `assets/rithwik-pemmada.png`: supplied Managing Director portrait.
- Photography is labelled as illustrative stock imagery, not MMM client work. Replace it with approved client work when available.
- Email and WhatsApp are unconfigured in `content.js`. The enquiry form creates a local downloadable text brief. It does not send or save personal details.
- Equipment details come from the supplied portfolio document and should be confirmed before public launch.

Stock photo credits, used under the [Unsplash license](https://unsplash.com/license): [JC Media](https://unsplash.com/photos/clear-glass-perfume-bottle-with-pink-light-zvqq7CG8BwY), [Adam Jaime](https://unsplash.com/photos/orange-slice-in-a-wine-glass-full-of-orange-liquid-shhT37a3ScY), and [Cemrecan Yurtman](https://unsplash.com/photos/a-person-operates-a-professional-video-camera-in-a-studio-QMa2FvZRoF0).

## Snapshots

The original imported design is tagged `snapshot-before-reference-refactor-2026-10-07`. The lighter refinement before this redesign is tagged `snapshot-before-studio-redesign-2026-10-07`. An intervening alternate design remains under `snapshot-reference-refactor-2026-10-07` for recovery. The older project and its bundles remain separate in `../snapshots/`; its assets and layout are not used here.

## Verification

JavaScript syntax and diff checks; homepage section navigation and legacy URL redirects; desktop and phone layouts; background image wall placement and movement; scrolling service categories and keyboard selection; exhibition lightbox and keyboard focus; growth stages; device previews; portrait scroll; motion pause/resume; local brief preparation.

All navigation and calls to action use homepage anchors. Work, production, equipment, device previews, growth offerings, the director portrait sequence and the enquiry form are part of the homepage. Previous inner-page URLs redirect to their corresponding section.

## ASCII hero experiment

The first section currently uses a square dot-matrix wordmark and sampled ASCII imagery. `ascii.js` generates the decorative canvases once; the existing image-wall animation moves them. The accessible heading remains text-labelled. Other sections retain their design and motion.

The previous design is saved as `snapshot-before-ascii-hero-fixed-2026-10-07`, including the corrected services initialization. The ASCII trial is a separate commit and can be reverted without removing that fix.
