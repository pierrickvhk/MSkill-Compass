# Sources, provenance and decisions

These sources were checked when producing the October 2026 blueprint. Verify them again before implementation or production integration.

- Learn Platform Catalog API: https://learn.microsoft.com/en-us/training/support/integrations-learn-platform-api-catalog
- Learn Platform API onboarding/auth: https://learn.microsoft.com/en-us/training/support/integrations-learn-platform-api-get-started
- Microsoft Learn MCP developer reference: https://learn.microsoft.com/en-us/training/support/mcp-developer-reference
- Microsoft Learn CLI (may help Codex research official docs): https://learn.microsoft.com/en-us/training/support/mcp-cli
- React Flow docs and accessibility: https://reactflow.dev/learn/advanced-use/accessibility
- Microsoft Learn website terms: https://learn.microsoft.com/en-us/legal/termsofuse
- Microsoft copyright usage: https://www.microsoft.com/en-us/legal/intellectualproperty/copyright/permissions
- Microsoft Reactor: https://reactor.microsoft.com/
- Microsoft Events: https://www.microsoft.com/en-us/events/

## Decisions
**D-001:** versioned, reviewed JSON graph in MVP instead of a graph database. Rationale: testability, content QA, low ops overhead.

**D-002:** no runtime Microsoft Learn catalog integration in MVP. Rationale: new Learn Platform API needs application onboarding and Entra auth, and doesn't include documentation/events.

**D-003:** no runtime MCP assistant in MVP. Rationale: costly untested complexity and provenance/evaluation needs; later adapter through compliant framework.

**D-004:** event list can be empty. Rationale: never fabricate upcoming dates or infer availability of an event API.

**D-005:** graph source metadata remains `seed-review` until individually checked; editorial relationships are not represented as official platform prerequisites.

**D-006:** progress is local-only anonymous state. Rationale: no account/PII processing in first release.

**D-007 (Slice 4):** extend the original six-stage path without replacing stage IDs
or prerequisites. Serve validated JSON through a read-only path endpoint and
keep all learner state in versioned browser storage. Seven reference destinations
and visible titles were manually checked on 2026-10-08; see `LEARNING_COMPASS.md`
for the exact ledger and limited verification scope. Authored learning guidance
and the graph remain seed-review. Optional mission execution remains Slice 5.


## Slice 5 decisions and reference review

**D-008:** keep design-only and actual-build evidence in separate local records.
Completing a workshop checklist cannot attest deployment, test success, competence
or a Microsoft credential. Actual-build phase m3 is explicitly self-reported and
unverified. No service executes or receives learner tests, notes or repository URLs.

The mission reuses the reviewed planning, quickstart, governance and testing
references above without changing their original review timestamps. The quickstart
and test-panel pages were also revisited. The additional reference
[Upload files as a knowledge source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-add-file-upload)
was reviewed at 2026-10-08T18:34:19Z for its title, destination and file-upload
workflow/access prerequisites. It informs the original MSkill instructions on
synthetic files and Dataverse search. No Microsoft account or tenant was used.
Checked references do not upgrade the editorial mission or unchanged graph to
verified. No source text was bulk copied or synchronized.


**D-009 (Slice 6):** publish only manually reviewed event records, preserving UTC
instants and original timezone. Derive temporal state instead of storing an
“upcoming” claim that can expire. Cancelled state takes precedence. Exact graph-ID
matches are editorial topic relevance, never user profiling or recommendations.
Six Microsoft Reactor pages were reviewed on 2026-10-08; the ledger, limited
verification scope, excluded incomplete announcements and manual refresh policy
are in `RADAR.md`. Microsoft Events Catalog remains an official discovery link.
No graph record or relationship gained verified status through these event checks.
