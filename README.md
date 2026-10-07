# MegMultiMedia portfolio

Static multi-page portfolio. Serve `dist/` with any static HTTP server. Seven routes share `app.js`, `style.css`, `motion.js`, `refinements.css` and `content.js`.

## Content handoff

- `dist/assets/mmm-logo.jpg` is an unchanged copy of IMG_9006.JPG.
- Stock imagery is explicitly illustrative; do not describe these as MMM client projects.
- Set verified email and WhatsApp in `dist/content.js` before enabling contact delivery. The current form only creates a local downloadable enquiry; it sends and stores nothing.
- The supplied MMM logo, Lucid Sway website screenshots/link and Rithwik Pemmada portrait are included. Photography remains illustrative. Add approved client films, testimonials and contact details before public launch.
- The digital section previews The Lucid Sway with desktop/mobile controls and links to the live site.
- Equipment and founder name are from the supplied portfolio PDF. Confirm equipment remains accurate at launch.

## Stock photographs

All used under https://unsplash.com/license (free commercial use).
- JC Media — https://unsplash.com/photos/clear-glass-perfume-bottle-with-pink-light-zvqq7CG8BwY
- Adam Jaime — https://unsplash.com/photos/orange-slice-in-a-wine-glass-full-of-orange-liquid-shhT37a3ScY
- Cemrecan Yurtman — https://unsplash.com/photos/a-person-operates-a-professional-video-camera-in-a-studio-QMa2FvZRoF0

## Motion upgrade

`dist/motion.js` is a dependency-free ES module with configurable LogoReveal, TextReveal, ImageReveal, VideoReveal, ProjectReveal, SectionReveal, BlurTextScroller, HorizontalGallery, ThreeDUI, Browser3D and PageTransition classes. `dist/motion.css` owns their presentation.

- A single passive-scroll/requestAnimationFrame coordinator updates only scenes near the viewport. No wheel/touch interception, artificial scroll smoothing, or continuous render loop.
- Homepage intro plays on each homepage load and refresh. Skip intro, intentional scrolling, reduced motion, hash-link navigation, and a timeout can bypass it. A native pixel-camera cursor is enabled for fine-pointer desktop devices; form fields retain the text cursor.
- Desktop project exhibition uses sticky positioning and native vertical scrolling; phones use a native swipe gallery.
- Services pass through a sharp focus plane, with capped peripheral blur and category controls. The original service accordions remain available as a fallback when the enhancement is unavailable.
- Reduced motion and the footer motion toggle switch to static layouts. Decorative bar animations pause outside the viewport.
- Photography and footage remain content dependencies. No substitute client claims or invented performance metrics are included.
- The floating MMM mark uses the supplied raster artwork on a CSS perspective plane, retaining its original illustrated extrusion; it is not a newly modeled 3D mesh.

Verification: seven routes; 320/390/430px phone widths; desktop scroll exhibition; services focus; growth tabs; motion pause/resume; reduced-motion navigation; local enquiry download. The static website is ready to serve from `dist/`.

## Run locally

From the project directory:

```sh
python3 -m http.server 5173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:5173/. No install or build step is required.

## Imported design refinements — 7 October 2026

Work continues in this pulled repository. The earlier project remains separate in `../snapshots/`; none of its layouts or assets are used here. The imported Create / Build / Grow hero, supplied mint-box logo, exhibition gallery, service orbit and director portrait sequence are retained. `refinements.css` adjusts spacing, surfaces and readability; the opening is shorter, service copy is filled, and the homepage digital section now shows the supplied real website preview.

Original imported version: `snapshot-before-reference-refactor-2026-10-07`. The intervening alternate design is retained as `snapshot-reference-refactor-2026-10-07` for recovery only.
