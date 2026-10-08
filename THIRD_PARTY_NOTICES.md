# Third-party notices and original MSkill work

Original MSkill Compass source is licensed under the [MIT License](LICENSE),
Copyright (c) 2026 Pierrick Van Hoecke. MSkill Compass is the project identity;
Pierrick Van Hoecke is the original copyright holder. Third-party
packages, operating-system components and linked content retain their own licenses;
our MIT license does not replace their terms or assert ownership of them.

## Original identity and content

The pixel compass, pixel icons, window styling and homepage illustration in
`apps/web/components/icons.tsx`, `universe-preview.tsx`, `ui.tsx` and project CSS
are original MSkill Compass work, attributed to this project. `docs/DESIGN.md`
records the reference process: winxpsite and XP.css were studied, but no code,
assets or fonts from either were copied. No Microsoft/Windows logos or wallpaper
are bundled. Microsoft names identify the ecosystem; no endorsement is implied.
The source license is not a grant of third-party trademark rights.

Typography uses system Arial/Helvetica/sans-serif and monospace fallbacks. No font
files are bundled or remotely loaded. Screenshots document the original local app
with synthetic content. Microsoft documentation/event URLs remain external links;
our original summaries do not relicense the linked pages, event artwork or trademarks.

## Dependency inventory and obligations

Machine-readable inventories: [npm](docs/audits/npm-licenses.json) (lockfile entries,
including non-host optional variants) and [Python](docs/audits/python-licenses.json)
(installed development environment). Inventories record upstream declarations,
not a claim that every entry ships to the browser. No modified third-party source
is vendored. Preserve upstream license and copyright files when redistributing.

| Component family | License / handling |
|---|---|
| Next.js, React, React DOM, React Flow, FastAPI, Pydantic | MIT; retain their notices. React Flow attribution is also kept visible. |
| Uvicorn / Starlette | BSD-3-Clause; retain notice and disclaimer. |
| sharp | Apache-2.0; retain license/NOTICE and modification statements if ever modified. |
| sharp's prebuilt libvips and bundled libraries | LGPL-3.0-or-later plus component-specific terms. Do not claim these binaries are MIT. See package README and upstream source/build project. |
| axe-core (tests), lightningcss (tooling), certifi/pathspec (Python tooling) | MPL-2.0: separate covered files retain MPL; preserve source availability/notice obligations on distribution. No covered files modified here. |
| caniuse-lite | CC-BY-4.0 data, attributed to caniuse-lite contributors and Can I Use data authors through the package's LICENSE/README. Data is not relicensed as MIT. |
| Other transitive packages | MIT, ISC, BSD-2/3-Clause, Apache-2.0, MIT-0, 0BSD, CC0, BlueOak, Python/PSF terms as listed in inventories. Retain applicable notices. |

Reviewed installed manifests, lock metadata and the libvips package's detailed
licensing table. No license conflict with separately MIT-licensed original source
was identified in that review. **This is not an unconditional redistribution
clearance for a combined binary image.** Before publishing images, the release
maintainer must inspect the final image's native/OS libraries, preserve notices,
and provide the required corresponding source/relinking route for LGPL components.
The source repository uses ordinary package-manager references; it does not include
node_modules or base-image binaries. Keep this distribution distinction explicit.

Primary references reviewed 2026-10-09:
- [MIT text](https://opensource.org/license/mit)
- [MPL FAQ on larger works](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
- [sharp installation and prebuilt libraries](https://sharp.pixelplumbing.com/install/)
- [libvips build/source project](https://github.com/lovell/sharp-libvips)
- [caniuse-lite license](https://github.com/browserslist/caniuse-lite/blob/main/LICENSE)

Owner: release maintainer. Re-run inventories after dependency changes. Image
redistribution review is tracked in RELEASE_READINESS.md; do not silently treat
an npm license string as proof that every bundled subcomponent is covered.
