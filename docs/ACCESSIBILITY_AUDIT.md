# Accessibility audit — Slice 7

Reviewed 2026-10-09. Target: WCAG 2.2 AA-relevant behavior; **no claim of full
conformance**. Scope is the existing first journey, not arbitrary third-party sites.

## Automated checks

Added axe-core 4.14.0 as a development-only dependency, run by Vitest/jsdom with
WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. Five tests cover six rendered states: homepage,
open launcher, Explorer list/inspector, Learning Compass, mission initial forms and
Radar filters/events. Zero reported violations in these states. Existing interaction
and malformed-data tests remain enabled.

Limitations: jsdom does not paint. Color contrast is explicitly disabled, graph
canvas is replaced by a test stub, and document title/language are supplied by the
harness. This is a semantic regression check, not a full browser axe crawl. Expanded
mission forms, error/reset/preview states are covered by interaction tests and manual
review, not all individually scanned by axe. The real browser was reviewed separately.

## Manual checks and findings

| Area / WCAG examples | Evidence / result | Remaining work |
|---|---|---|
| Keyboard 2.1.1 / focus 2.4.7 | Tab exposes skip link with 3px blue outline; Enter selects a mobile list result; launcher Escape restores trigger focus. Mission reset Escape cancels. | Full keyboard-only task completion and screen-reader pairing still required. |
| Navigation / names 1.3.1, 2.4.1, 4.1.2 | Real browser exposes header/main/footer, labelled navigation, list, inspector, filters and controls. One clear primary heading per inspected route. | Dedicated VoiceOver/NVDA reading-order review pending. |
| Form errors 3.3.1/3.3.2 | Unsafe GitHub URL shows explanatory error and is not saved; notes and evidence controls have labels and limits. | Check spoken error announcements with assistive technology. |
| Reflow 1.4.10 | Production checks at 390px and 375px: no horizontal document overflow in inspected home, evidence, Radar and Explorer states. Mobile list/inspector works without canvas. | 320px, 200%/400% zoom and OS text scaling not yet accepted. |
| Focus not obscured 2.4.11 | Repository field visibly focused on mobile; status bar does not cover it. Reset cancellation and launcher restore focus. | Full long-page focus sweep, particularly graph controls, pending. |
| Non-text contrast 1.4.11 | Identified pale input border `#a8b8d4` against white = 2.01:1. Changed editable-field boundaries to `#7d8ca3` (3.41:1 against white). No layout redesign. | Full palette, gradients and all interaction states need a browser contrast audit. |
| Text contrast 1.4.3 | Sampled CSS foreground/white pairs: body #202b49 13.97:1; muted #536179 6.26:1; action #205bc2 6.29:1; violet #6744b5 6.84:1. | These samples do not establish all page text contrast. |
| Focus contrast | #0044cd against white = 7.75:1; visible outlines observed. | Colored-background focus variants not exhaustively measured. |
| Motion 2.3 / 2.2 | CSS reduced-motion media query disables transitions/animations and smooth scrolling. | OS/browser preference emulation unavailable in this run; actual preference behavior pending. |
| Target size 2.5.8 | Mobile primary controls and text inputs remain usable in screenshots and pointer/keyboard checks. | Full 24px spacing/exception audit pending; screenshots alone are insufficient. |

Ratios calculated from sRGB relative luminance; all quoted ratios use white as the
background. No assumptions about antialiasing or composite gradients are hidden in
the numbers. The title bars and graph use additional colors not exhaustively sampled.

## Release impact

A1 (medium, fixed): pale form boundaries; patch retains approved visual identity.
A2 (medium, open): assistive-technology and full contrast/reflow/target-size acceptance.
Owner: accessibility reviewer / project maintainer. Complete the manual matrix before
broad public beta; invited feedback can proceed with disclosed limitations.

Screenshots in `docs/screenshots/slice-7-*` document the inspected viewport states,
not whole-page compliance. See [beta test plan](BETA_TEST_PLAN.md) for exact scenarios.
