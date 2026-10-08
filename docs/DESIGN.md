# Slice 1 — Retro-modern visual identity

## Direction

Approximately 70% modern clarity and 30% retro personality: spacious typography,
quiet surfaces, a single original pixel compass, and small tactile details.
The homepage is a welcome page; `/explore` introduces the learning workspace.
Neither route loads or implements the knowledge graph.

## Reference review and originality

- [winxpsite](https://github.com/firwer/winxpsite), including its linked live site:
  observed its persistent StartBar, grouped StartMenu destinations, labelled
  WinForm title bars, and desktop icon launch points. Adapted the *ideas* of
  orientation and compact navigation. Rejected desktop wallpaper, OS branding,
  system commands, crowded toolbars, double-click activation, and overlapping
  draggable windows. No code, assets, fonts, or CSS were copied.
- [XP.css](https://github.com/botoxparty/XP.css) and its
  [component documentation](https://botoxparty.github.io/XP.css/): evaluated
  semantic HTML controls, inset/raised borders, title bars, and pressed/focus
  states. Its MIT license permits attributed reuse, but no reuse was necessary.
  XP.css is not installed, embedded, or vendored.

All SVG paths and CSS are original project work. No Microsoft artwork, product
logos, external fonts, image generation, or new runtime/test dependencies.

## Tokens and layout

`apps/web/app/globals.css` retains the complete starting token set from
`DESIGN_SYSTEM.md`, including blue `#2776F6`, violet `#835FF1`, mint `#74D9BF`,
yellow `#FFD369`, canvas, surfaces, borders, and shadows. Additional semantic
colors distinguish readable text and actions from decorative accents:

| Use | Color | Measured contrast |
|---|---|---|
| Body text on canvas | `#202B49` | 13.27:1 |
| Secondary text on canvas | `#536179` | 5.95:1 |
| Violet headline on canvas | `#6744B5` | 6.50:1 |
| White text on primary button | `#205BC2` | 6.29:1 |

System sans-serif serves headings and paragraphs. System monospace is reserved
for short coordinates and labels. Main content is 1200px wide inside a 1280px
container. The Explorer has a 72px desktop rail, becoming a horizontal strip on
mobile. At 760px and below the hero stacks and the abstract universe becomes a
simple two-column illustration with the same accessible description.

## Components and behavior

- `MSkillWindow` / `MSkillTitleBar`: labelled content boundary and optional
  collapse/reopen control. Native `hidden` removes collapsed content from focus
  and accessibility navigation. No pretend minimize/maximize/close buttons.
- `MSkillStatusBar`: persistent preview state and current lens, with no fake
  connectivity, progress, clock, or account status.
- `MSkillLauncher`: disclosure navigation with destination icons, outside-pointer
  dismissal, Tab order, focus-out dismissal, and Escape focus restoration.
- `MSkillDesktopIcon`: an ordinary single-activation link with original icon,
  title, and description. Used in the launcher.
- `Button`: reusable native button; navigation CTAs are actual links with shared
  button styles. Disabled native button semantics are supported.
- `LevelSelector`: labelled native radio group; arrow keys switch perspective.
  The label in the UI is *lens*, not an earned level or difficulty lock.
- `CompassArt`, `PixelIcon`, `UniversePreview`: original SVG/CSS visuals.
  The universe is explicitly an illustration, not factual graph edges.

“Explore the Universe” opens `/explore`. “Find My Path” jumps to `#lenses`, which
provides three distinct authored perspectives and a starter question. It does
not imply a generated or saved learning path. Lens state survives client route
changes through the shared layout and resets on reload. No storage is written.
The shell has real Home, Universe preview, and Our approach destinations.

## Accessibility and motion

Semantic headings/landmarks, a skip link, accessible icon-link names, explicit
`aria-current`, disclosure state, native radios, and polite guidance updates.
Focus outlines use `#0044CD`; radio focus is displayed on the visible label.
The fixed status bar has reserved page space so it does not cover the footer.
Decorative art is hidden from assistive technology. The static universe has an
explicit text alternative naming the four themes and disavowing real graph
relationships. Reduced-motion CSS disables compass animation, transitions, and
smooth scrolling. Forced-color styles retain selection/boundary cues.

## Verification on 2026-10-08

| Check | Result |
|---|---|
| `npm --prefix apps/web run lint` | PASS |
| `npm --prefix apps/web run typecheck` | PASS |
| `npm --prefix apps/web test` | PASS — 7 tests |
| `npm --prefix apps/web run build` | PASS — `/` and `/explore` |
| Backend Ruff check and format check | PASS |
| Backend strict mypy | PASS |
| Backend pytest | PASS — 9 tests |
| Docker Compose rebuild / healthy services | PASS |
| HTTP smoke: health response and new homepage | PASS |
| Desktop 1440px / mobile 390px, both routes | PASS — visual review and no horizontal overflow |
| Contract breakpoint 375px, both routes | PASS — no horizontal overflow |
| Browser keyboard radio ArrowRight | PASS — Explorer changes to Builder and retains focus |
| Browser launcher Tab / Escape | PASS — first destination reachable; Escape restores trigger focus |
| Browser CTA and route transition | PASS — `/explore`, lens preserved on client navigation |
| Text contrast calculations | PASS for the semantic pairs listed above |

The old foundation-page test was updated for the intentional new headline and
controls; health/provenance assertions remain. The smoke test now checks the new
hero rather than the Slice 0 heading. New unit cases cover all lenses, preview
collapse/restore, launcher Escape/outside click/navigation, Explorer guidance,
and the reusable button.

Browser screenshot stitching produced an unreliable full-page image, so the
saved artifacts are viewport screenshots. After a development container restart,
the existing browser needed a reload before reliable navigation. Keyboard and
pointer navigation were verified on the reloaded app.

Screenshots in `docs/screenshots/`:
- `slice-1-home-desktop.jpg` — 1440px desktop homepage.
- `slice-1-home-mobile.jpg` — 390px mobile homepage.
- `slice-1-explore-desktop.jpg` — 1440px Explorer shell.
- `slice-1-explore-mobile.jpg` — 390px Explorer shell.

## Changed paths and boundaries

- `apps/web/app/{page.tsx,layout.tsx,globals.css}` and new `app/explore/page.tsx`.
- New `apps/web/components/{icons,ui,shell,lens-guide,universe-preview}.tsx`.
- `apps/web/next.config.ts`: hide development indicator that obscured the launcher.
- `apps/web/tests/page.test.tsx`, `scripts/smoke.mjs`.
- `docker-compose.yml`: mount the new components directory for development reload.
- `README.md`, this document, and screenshots.

The API and all curated JSON remain unchanged. Slice 2 has not started.
No full screen-reader audit, axe scan, or automated visual regression suite is
claimed. Reduced-motion rules were inspected, not tested via OS preference
emulation. Existing Slice 0 development-tool audit findings and upstream
Vite/Starlette warnings remain; dependency versions did not change. GitHub-hosted
CI was not run. The next planned slice is the seeded read-only graph API, only
when explicitly requested.

## Slice 1.1 — Visual refinement

This refinement preserves the headline, type scale, blue/violet palette, original
compass, navigation, lenses, and collapse/restore behavior. It does not start
Slice 2 or add dependencies.

### What changed

- A blue caption bar, narrow double borders, inset address strip, square icon
  tiles, and raised/pressed launcher states make the existing components read as
  one original learning workspace. No source code or artwork was copied.
- The homepage hero is shorter. The secondary audience note and section number
  are hidden, and the mobile compass becomes a compact orientation marker. The
  main headline and both CTAs retain their typography and functionality.
- The static illustration now names Copilot Studio, Power Automate, Dataverse,
  and Connectors, with typed connections and an adjacent example inspector.
  Its descriptions and relationships are taken from the existing seed entries
  `copilot-studio`, `power-automate`, `dataverse`, `connectors`, and edges
  `e028`, `e030`, `e042`. They remain **seed-review**, with no new verification
  claim. The inspector is a static example, not a clickable node experience.
- Mobile stacks the inspector below the network. The status/launcher bar sits
  in normal document flow immediately below the header, rather than covering
  artwork and controls at the viewport bottom. Its disclosure opens downward
  on mobile and remains height-constrained with scrolling on short screens.
  Desktop retains the bottom taskbar.

### Comparison with Slice 1

Previous screenshots are preserved unchanged. Compare:

| View | Slice 1 | Slice 1.1 |
|---|---|---|
| Desktop 1440 × 1000 CSS viewport | Window starts around 810px; only its header and top edge are visible | Window starts at 546px and ends at 949px, above the taskbar at 952px; all four nodes, connections, and inspector are visible |
| Mobile 390 × 844 | Large compass occupies the bottom of the opening screen; preview is below it; fixed bar overlaps art | Window begins at 634px; its header, category key, and first nodes are discoverable in the opening screen; no fixed overlay |
| Mobile 375 × 812 | Not captured in the old screenshot set | Window begins at 660px; heading wraps naturally, no horizontal overflow; full network and inspector are visible after a short scroll |
| Identity | Pale generic frame and abstract topic names | Blue Explorer caption, inset workspace strip, named technologies, typed relationships, sample inspector |

New screenshots:
- `screenshots/slice-1-1-home-desktop.jpg`
- `screenshots/slice-1-1-home-mobile-390.jpg`
- `screenshots/slice-1-1-home-mobile-375.jpg`
- `screenshots/slice-1-1-preview-mobile-375.jpg`

Desktop image exports may be scaled by the browser tool; the tested layout
viewport was 1440 × 1000. Screenshots are evidence of specific views, not an
automated visual regression suite.

### Verification

- PASS: `npm --prefix apps/web run check` — ESLint, strict TypeScript, all 7
  existing interaction tests, and production build for `/` and `/explore`.
- PASS: `apps/api/.venv/bin/pytest apps/api/tests` — all 9 backend tests.
- PASS: `WEB_URL=http://localhost:3001 API_URL=http://localhost:8001 node scripts/smoke.mjs`.
- PASS: browser inspection at 1440, 390, and 375px; document width equals viewport
  width at each size. Mobile status bar uses `position: relative`.
- PASS: mobile launcher opens below the bar; keyboard Tab reaches its first
  destination; Escape dismisses it and restores trigger focus.
- Existing reduced-motion and focus rules remain. No full screen-reader audit,
  automated accessibility scan, or new source-verification claim is made.
- Existing Vite and Starlette development warnings remain non-failing.

Changed implementation files: `apps/web/app/page.tsx`,
`apps/web/app/globals.css`, `apps/web/components/shell.tsx`, and
`apps/web/components/universe-preview.tsx`. Documentation and screenshot files
are the only other changes in this refinement. API, content JSON, dependencies,
and existing test behavior remain unchanged.

View at `http://localhost:3001/`; use the existing README setup commands.
The next planned milestone remains Slice 2, only on explicit request.


## Slice 3 — Interactive Universe Explorer

The records above describe the historical visual foundation. `/explore` now uses
the actual graph API; the homepage retains its original compass, typography,
spacing and illustrative preview. Only stale availability/navigation copy changed.

The Explorer preserves the blue title bar, inset address strip, square pixel
symbols, violet selection, clean surfaces and in-flow mobile status bar. A narrow
search browser sits beside the canvas, with a contextual inspector on the right.
The desktop workspace fits a 1440 × 1000 viewport above the taskbar. On shorter
screens the page scrolls and reserves bottom space for the bar.

React Flow custom nodes use original icons and category labels as well as color.
A stable two-column neighborhood surrounds the selected node; all direct
connections are visible, with directional arrows, two-ended integration arrows,
and dashed editorial associations. Clicking/focusing a relationship reveals its
name, meaning, authored rationale and provenance. Zoom, fit and pan are functional.
Reset opens the full 30-node category overview without the tangle of all 71 edges.
The list remains a complete navigation alternative on desktop.

At 768px and below, the list is the primary view and the canvas is hidden. Selection
opens an in-flow inspector and focuses its heading; Back to list restores search
focus. No modal or fixed overlay is added. Search, category, selection and lens
state remain available across this navigation. Lens changes reorder details and
use authored explanations without moving the camera or changing node positions.

Seed-review is explicitly labelled “not verified.” MSkill editorial guidance is
separate from documented Microsoft relationships. Missing links and lens content
are labelled honestly. No new logos, artwork or generated Microsoft claims.

Screenshots reviewed at requested CSS viewport widths:

- [Desktop, 1440 × 1000](screenshots/slice-3-desktop-1440.png)
- [Desktop relationship inspector](screenshots/slice-3-desktop-relationship.png)
- [Mobile search, 390 × 844](screenshots/slice-3-mobile-390-search.png)
- [Mobile inspector, 390 × 844](screenshots/slice-3-mobile-390-inspector.png)
- [Mobile opening list, 375 × 812](screenshots/slice-3-mobile-375-list.png)

Browser exports may scale image pixels; the dimensions above are the tested CSS
viewports. All three widths had document width equal to viewport width. Screenshots
are reviewed examples, not a pixel-diff regression suite. See
[Slice 3 engineering record](SLICE_3_IMPLEMENTATION.md) for tests and limitations.

## Slice 4 — My Learning Compass (2026-10-08)

The approved homepage and Explorer remain the visual baseline. The new learning
page uses the existing blue title bar, inset numbered milestone markers, violet
checkpoint surface, typography, restrained borders and window frame. No artwork,
font, graph library or dependency was added. Find My Path, the launcher and a
compact My Path navigation item connect the experience.

At 1440px, the window has a 250px roadmap, flexible active step and 280px graph
context. Below 1150px, graph context follows the step; below 700px, the roadmap
becomes six compact vertical rows above the step. Mobile completion labels remain
available to assistive technology even when their visible secondary line is
suppressed. Step selection focuses and scrolls the heading into view; a Back to
milestones action restores roadmap focus. No nested mobile scroll area or sticky
learning control competes with the existing mobile status bar.

Progress uses a native labelled progress element and plain self-reported wording.
Reset is an inline confirmation group with focus on Keep my progress, Escape to
cancel, and focus restored to the trigger. It is not a modal and does not trap
focus. Every milestone remains available in every lens. Existing authored node
explanations supply depth; unsupported detail is not generated. Checked reference
labels are distinct from the editorial step and unverified graph labels.

Preliminary review exercised Explorer node/relationship navigation, all three
lenses, mobile list → details → list, heading/search focus and desktop label
readability. No blocking Explorer redesign was needed. During new-page review,
mobile selection scrolling and completion-label accessibility were corrected.
Final screenshots are recorded in `SLICE_4_IMPLEMENTATION.md`; desktop 1440px and
mobile 390px/375px retain readable controls with no horizontal overflow. Existing
reduced-motion rules continue to apply, and programmatic navigation scrolls
instantly.


## Slice 5 — Builder Lab (2026-10-08)

The workshop reuses the approved window, typography, palette, lenses and checkpoint
surface. Five phase buttons, one active workspace and existing graph explanations
form a 230px / flexible / 265px desktop layout. Context moves below at 1150px;
below 700px all regions follow document flow. Preparation is a native disclosure,
manual assessments are native selects, and final deliverables are labelled checkboxes.
Design-only is the initial mode, with distinct simulated instructions and records.

The focused Slice 4 correction returns focus to the selected milestone button,
not its containing navigation. Lab phase navigation follows the same pattern.
Interactive elements have a two-pixel visible outline; programmatically focused
phase/step headings use an underline instead of a large rectangular outline.
Desktop scroll padding/margins reserve space above the existing 48px fixed status
bar. The mobile status bar remains in normal flow and does not cover completion
controls. Reduced-motion rules remain in effect.

Browser review covered 1440×1000, 390×844 and 375×812 CSS viewports, with no horizontal
overflow. Keyboard return actions visibly outlined the correct buttons; mobile
completion controls and desktop checkpoints were unobstructed. Screenshot evidence
and the bounded download-event limitation are in `SLICE_5_IMPLEMENTATION.md`.
These are reviewed viewport captures, not automated pixel-diff tests.


## Slice 6 — Microsoft Radar

Radar preserves the approved typography, white surfaces, original window header
and blue/violet direction. A chronological list pairs a narrow date/status column
with each event's title, original description, graph tags and official source.
There is no calendar grid or extra dashboard. Native labelled selects control
period, graph topic and format; a native disclosure explains editorial relevance.
Both status text and color distinguish upcoming, past and cancelled records.

Below 700px the date and event content stack into a single reading column. Controls
remain at least 44px high, focus outlines stay visible, and external links announce
a new tab. The existing in-flow mobile taskbar and desktop scroll margins are
preserved. Radar joins main navigation and the launcher; no homepage redesign.

Browser review verified 1440px, 390px and 375px widths with no horizontal overflow.
At 375px, keyboard navigation reached the event registration link and the visible
focus ring remained unobstructed; the mobile status bar was position: relative.
Screenshots in `SLICE_6_IMPLEMENTATION.md` show the default list, past view, mobile
filters, event content and controls. No pixel-diff or full screen-reader audit is claimed.

## Slice 7 accessibility refinement

The approved XP × Copilot composition, typography, illustrations and interactions
are retained. Editable form borders now use #7d8ca3 (3.41:1 against white) instead of
pale boundaries measured at 2.01:1. No feature sections or layout redesign added.
Manual desktop/375/390px review and semantic axe checks are documented separately in
ACCESSIBILITY_AUDIT.md; this is not a blanket WCAG compliance claim.
