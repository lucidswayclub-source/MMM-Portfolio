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

Work, production, equipment, website previews, growth offerings and the director portrait sequence stay on the homepage. Start a conversation and contact calls to action open `/contact/`, the only inner page. Earlier service page URLs redirect to their homepage sections; old `/#contact` bookmarks open the contact page.

## ASCII hero experiment

The pre-ASCII hero was restored on 8 October 2026: photographic image-wall motion and the iridescent italic company wordmark with shadows. The ASCII experiment remains in Git history and `ascii.js`, but is no longer loaded. All later website-card, portrait and contact-page refinements remain active.

The previous design is saved as `snapshot-before-ascii-hero-fixed-2026-10-07`, including the corrected services initialization. The ASCII trial is a separate commit and can be reverted without removing that fix.

## Website project gallery

The supplied web-development project list is presented in the homepage website panel: PVST, Raizon Space Interiors, Ever Green Artha, Dhruv Consultants, The Lucid Sway and Hasini Infra. Each card links to its supplied live URL. Five new desktop previews were captured from the live sites; Lucid Sway retains its supplied desktop and mobile screenshots and device morph. The gallery is one horizontal row: desktop vertical scrolling pins the panel and moves the cards from right to left. Arrow controls and keyboard focus navigate the reel. Phones and reduced-motion views use a native horizontal swipe row with snapping. The contact page provides the existing local project-brief form.

## Our work film carousel — 26 October 2026

The homepage Work section now uses the four supplied videos from `../megmultimedia/our_work` instead of the concept photograph gallery. Optimized 540px, 24fps H.264 previews and poster frames live in `dist/assets/our-work/`; originals remain untouched. Playback copies omit audio for simultaneous muted playback. Two identical groups make the right-to-left film strip seamless. Films in or approaching the visible carousel area play together; distant copies stay unloaded or paused. Playback pauses offscreen or in a hidden tab, with a local pause/play control. The strip is full bleed, with an independent animation clock moving at 55px/s on desktop and 46px/s on phones. The clock runs continuously while visible and does not depend on scrolling. The footer motion toggle and OS reduced-motion preference pause the films and provide a static horizontally scrollable strip.

## Adaptive performance

`dist/performance.js` loads before the intro and chooses Full, Balanced or Light quality using available device capability hints. It can reduce quality after two sustained periods of poor scroll frame timing. Quality never increases during the visit, avoiding oscillation; no measurements leave the browser.

Balanced mode uses smaller letter reels, fewer portal elements, no per-element motion blur or layered card depth, a 30 FPS floating camera and a capped 1.25 pixel ratio. Light mode retains services, gallery controls, portrait sequence, navigation and equipment interactions, uses a short logo intro, and omits the floating WebGL camera and character reels. Reduced-motion preferences and the existing motion toggle remain supported.

The animation coordinator shares geometry reads across scenes on the same element and skips idle hover effects. Resize work is debounced; CSS animations and animation loops pause in hidden tabs. A 960px transparent logo derivative reduces shared logo transfer size by about 70%; the original asset remains available.

Run regression checks with `node --test tests/performance.test.cjs`. These validate scheduling, quality selection, automatic downgrading and the low-power intro lifecycle; they do not replace profiling on physical devices.

## Phone layout

`dist/phone.css` loads last and owns phone-specific refinements: 20px content gutters, paired desktop-style hero actions, 44–50px controls, readable form inputs, full-width swipe galleries, and horizontally scrollable growth tabs. Services use stable `svh` sizing to avoid address-bar resize jumps; service and director scroll sequences are shorter. Short landscape touch viewports retain native galleries rather than desktop pins. Reduced-motion layouts remain unpinned.

The selection highlight accounts for the tab container's scroll offset, and selecting an offscreen tab brings it into view. Verify the final visual layout on iOS Safari and Android Chrome, including browser-toolbar changes, keyboard entry, landscape rotation and reduced-motion settings.

The deployment bundle also includes 360px H.264 phone previews (about 69% less transfer weight and 56% fewer pixels per frame than the 540px versions). Source selection happens only before a film first loads, avoiding playback resets. The decoder budget is one video in Light, two in Balanced and four in Full mode, prioritizing visible films; poster images remain for the others. The carousel's independent movement continues. Floating-camera WebGL initialization waits until the intro has completed. Website and portrait sequences cache pin heights during resize instead of reading layout during each scroll update. The director portrait uses a full-resolution JPEG derivative; the original PNG remains untouched. Deploy the complete `dist` directory, including the new media files and versioned scripts.
