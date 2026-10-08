# Contributing to MSkill Compass

Read [AGENTS.md](AGENTS.md) and the product, ontology, design and architecture
contracts in `docs/` before changing implementation. Keep changes within one agreed
slice. Use strict TypeScript/Python typing, focused tests and small pull requests.

Use the [README](README.md) setup. Run `npm ci && npm run check` in `apps/web`, and
`uv sync --frozen`, Ruff lint/format, mypy and pytest in `apps/api`. Run the HTTP smoke
script against both the development and production Compose configurations.

Content changes must include the exact official source, review time, scope and
an original explanation. Never upgrade seed-review merely because validation passes.
Keep IDs stable, update API fixtures through the backend serializers, and check the
first journey. Use synthetic information only; no employer or personal evidence.

UI changes need keyboard and narrow-screen checks, visible focus and a graph list
alternative. Do not claim WCAG conformance from automated checks alone.

Contributions must be your own or have documented compatible permissions. Preserve
third-party notices and MSkill attribution; our license does not relicense dependencies.
Describe behavior, validation and unresolved limitations in the pull request. Do not
include credentials, local progress, personal screenshots or copied Microsoft artwork.
See [SECURITY.md](SECURITY.md) for security reporting.
