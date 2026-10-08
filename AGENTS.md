# AGENTS.md — Instructions for coding agents

You are contributing to **MSkill Compass**, an independently built, open-source learning navigator. Its experience is retro-modern XP-inspired × Copilot-like, but its credibility depends on accuracy and accessibility.

## Mandatory reading
Before implementing anything, read:
- `docs/PRODUCT_BLUEPRINT.md`
- `docs/GRAPH_ONTOLOGY.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/CODEX_BUILD_PLAN.md`

## Hard requirements
- Work in a single approved slice; do not implement roadmap features without explicit instruction.
- Use TypeScript strict mode and Python typing/Pydantic; small explicit functions and clear boundaries.
- Ship real, working controls with meaningful states (loading, empty, error, success); never decorative/inert UI buttons.
- Make source provenance and editorial status visible: seed-review != verified. Never invent official Microsoft assertions, upcoming event dates, credentials, or source URLs.
- No copying Windows XP artwork or Microsoft product logo without permission; create our own pixel assets.
- Do not scrape, bulk republish, or silently mirror Microsoft Learn. Link to official sources, use original explanations, respect licenses and API terms.
- No auth, AI-chat, vector database, Neo4j, cloud sync, runtime catalog sync or telemetry in MVP.
- Use curated JSON for MVP. Keep `REQUIRES` edges acyclic and semantic edge direction documented.
- Mobile users must have an accessible searchable list alternative to graph navigation.
- The UI has three informational lenses, not three exclusive difficulty locks.
- Use anonymous device-local progress (localStorage) and explicitly label it; provide reset.
- Use only synthetic/demo data in missions and screenshots; no ING/employer data.
- Strict type checks, backend/frontend unit tests, smoke test, CI and a reproducible Docker setup.

## Definition of done response
In each implementation summary include (1) what changed, (2) where, (3) tests/commands and PASS/FAIL, (4) how the user can view it, (5) limitations, (6) suggested next slice. Never claim tests passed unless run.
