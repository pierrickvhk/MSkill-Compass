# MSkill Compass — Product Blueprint v1.0

> **Positioning:** An independent, open-source learning navigator for the Microsoft AI and automation ecosystem.  
> **Promise:** Explore. Learn. Build.  
> **Audience:** curious beginners, hands-on builders, and aspiring solution architects.  
> **Status:** product plan and initial seed; not an implemented product or an officially endorsed Microsoft offering.

## 1. Problem and thesis
Microsoft's documentation, learning paths, product pages, credentials, and events are distributed across different surfaces. Newcomers struggle to see how the pieces connect; experienced builders struggle to find efficient routes between conceptual knowledge and production architecture.

**MSkill Compass is not a Microsoft Learn replacement.** It is an interactive navigation, explanation, and project layer on top of the official ecosystem, using original authored descriptions and attributable links to sources.

### Jobs to be done
- **Beginner:** "I know what I want to create, but not which Microsoft technologies to learn first."
- **Builder:** "I understand some tools; show how they connect to solve a real problem."
- **Architect:** "Reveal identity, permissions, governance, deployment, evaluation, and system boundaries."

### North-star user outcome
Within one session, users can find a relevant technology, understand its most important connections, and save a credible next step (official resource or hands-on project).

### Product principles
1. Discover before learning: show why a tool matters before linking to training.
2. One graph, three lenses: Explorer, Builder, Architect differ by information density, not underlying truth.
3. Build to prove: practice and external code evidence outrank empty gamification.
4. Authored guidance, sourced facts: clearly distinguish project recommendations from Microsoft's requirements.
5. Quiet UI, delightful details: Windows XP-inspired original motifs + modern Copilot-like visual calm.
6. Accessibility and responsive experience are core product features, not polish.
7. Degraded mode by design: a missing upstream Microsoft API must not break the site.

## 2. Audience, levels and adaptive content
| Lens | Default detail | Question | Node details | Primary action |
|---|---|---|---|---|
| Explorer | Low | What is it? | Plain-language definition, where used, 3 key relationships | Learn basics |
| Builder | Medium | How can I build with it? | Integration examples, typical workflow, API/connector concepts, project prompt | Start mission |
| Architect | High | How do I run it safely at scale? | Architecture patterns, security, governance, ALM, evaluation, caveats | Explore architecture |

**Never lock knowledge behind level selection.** Users switch lenses at any moment and retain graph context. Avoid claiming proficiency based on clicks or visited pages.

### Optional profile later
User may self-assess familiarity with skills using `unfamiliar`, `learning`, `comfortable`, `applied`. This is self-reported, not verified competency.

## 3. Sitemap and route map
- `/` — immersive landing, role picker, current discoveries, primary actions.
- `/explore` — interactive Universe Explorer, search, filters, 3 adaptive lenses.
- `/explore/[slug]` — shareable direct node view; deep-link opens Explorer with node panel.
- `/paths/agent-builder` — guided path with prerequisites, recommended resources and milestones.
- `/lab/first-agent` — one complete mission from concept to evidence checklist.
- `/radar` — verified upcoming events or transparent empty state; optional MVP extension.
- `/about` — independent project disclaimer, source policy, governance, contribution notes.

`/passport` is **out of MVP scope**; later public builder proofs and credentials.

## 4. Primary user journeys

### Journey A — curious beginner, first agent
1. Land on MSkill with one question: "What would you like to build?" Pick "Create an AI agent".
2. Select Explorer lens (default). Guided highlight focuses `Copilot Studio`.
3. Open Copilot Studio panel: short definition, 3 most useful relationships, official docs link, mission card.
4. Click "View learning path" → guided stages: AI basics → business workflows → agent fundamentals → knowledge sources → safe action → governance basics.
5. Mark one resource as `saved`; launch the first agent mission.
6. Return later: saved state persists in browser, with explicit "stored on this device" copy.

**Success:** starter can open an official learning source in <=3 meaningful clicks from their selected goal.

### Journey B — existing maker discovers hidden connections
1. Open Universe Explorer using Builder lens.
2. Search "Power Automate"; node highlighted with neighboring connectors, Dataverse, Copilot Studio.
3. Select edge "integrates with" to see **why** and an authored example.
4. Save a node, inspect the recommended next mission.
5. Open the mission and copy its implementation checklist.

**Success:** user understands one relationship that was not obvious from a siloed product page.

### Journey C — aspiring architect assesses solution readiness
1. Switch to Architect lens without leaving the graph.
2. Search Copilot Studio, filter on `governance`.
3. See related nodes for Entra ID, access control, ALM, evaluation, and deployment.
4. Inspect source-backed "considerations" panel (risk, dependencies, decision point).
5. Open an architecture mission specification, with no pretence of auto-grading.

**Success:** architecture concepts remain findable and clearly separate recommendations from official product constraints.

### Journey D — discovery via upcoming event
1. Visit Radar.
2. Filter by topic and timezone (`Europe/Brussels` default but adjustable).
3. Open an event card with organizer, original URL, UTC start, localized time, and verification date.
4. Navigate to related graph topic.

**MVP note:** no fake future events. If there are none verified, display an empty state and links to Microsoft Reactor / Microsoft Events.

## 5. Screens and interactions

### Landing
- Full-width clean hero, sparse orbit illustration around original pixel compass icon.
- Clear H1 and two primary CTAs: "Explore the Universe" and "Find My Path".
- Three lens pills with plain-language explanations.
- 3 starter missions and a one-line community disclaimer below.
- Don't put giant course lists, excessive cards, or full graph above the fold.

### Universe Explorer (signature interaction)
- Desktop: 72px left rail, canvas center, optional 340px right inspector, thin status/task bar at bottom.
- First load shows five product clusters, not 30 tiny overlapping nodes.
- Node click selects, focuses, opens inspector; related nodes can be expanded.
- Edge click shows label, rationale, and provenance; `REQUIRES` uses visually directional arrows.
- Search dims unrelated elements and scrolls/fits selected node into view.
- Filters: topic, lens, relation type. Reset-all always visible.
- Graph pan/zoom/fit controls, reduced-motion support, keyboard navigation.
- Deep links directly select a node on load.
- Preserve filters and camera position while switching lens.
- On <=768px: default to searchable outline/list rather than forcing a pan-heavy diagram. List item opens full-screen details; graph optional toggle.
- Empty search: suggestions + clear filters. Broken source: show "Source needs review" and disable external action.

### Node inspector anatomy
1. Node title + small type badge + difficulty indicator.
2. One-sentence plain definition.
3. Role-based tabs: "Understand", "Build", "Architecture"; lens sets default tab.
4. Why it matters + practical example.
5. Key relationships (typed, directional, clickable).
6. Resources with source badges and last-checked dates.
7. Actions: "Add to path", "Start mission", "Open official docs".
8. If details are missing, show an honest placeholder, never auto-fill invented facts.

### My Compass / guided path
- One first-party path in MVP: "Zero to Copilot Agent Builder".
- Stages are authored and sequential; resource completion is self-attested.
- Show optional vs required stages and why they exist.
- A stage can hold node references, curated official resources, and a linked mission.
- Persist saved/checklist state locally in MVP.
- Do not call it "Microsoft certified" or imply official credentials.

### Builder Lab
- One end-to-end tutorial: "Create a helpful FAQ agent".
- Fields: problem, persona, prerequisites, setup, steps, checkpoints, test scenarios, definition of done, source links, reflection.
- Start with no connection to personal employer or proprietary data.
- Completion checkboxes are self-attested; GitHub repo URL optional and not auto-verified.
- More missions belong to post-MVP roadmap.

### Radar
- Curated event records only. Full fields include title, start time UTC, organizer, original URL, topic references, verification timestamp, and event status.
- Always convert from stored UTC into browser timezone (display timezone explicitly).
- Filter by upcoming, topic, and online/in-person if provided.
- Link to source. Never claim to offer registration unless routed to an organizer registration page.

## 6. Graph ontology
See `docs/GRAPH_ONTOLOGY.md` and `content/graph.seed.json`. Main distinctions:
- `product`: concrete Microsoft services/platforms.
- `concept`: architectural/building idea.
- `skill`: ability a person acquires.
- `resource`: external official learning or documentation resource (as record after link validation).
- `credential`: certification/Applied Skill external credential.
- `mission`: original hands-on exercise.
- `event`: external scheduled event.

Every edge must carry direction, relationship type, short rationale, source classification, verification state, and optional source URL.

## 7. Personalization algorithm — deterministic first
For MVP no generative AI recommendation dependency:
- Input: lens, target path (agent-builder), self-marked stage status.
- Path author explicitly specifies stages and prerequisites.
- "Next step" = first required, incomplete stage with completed required predecessors.
- Node relatedness ranks direct `REQUIRES`, `ENABLES`, `INTEGRATES_WITH`, `GOVERNED_BY` edges ahead of generic `RELATED_TO`; no learned scores.
- In Architect lens, promote `GOVERNED_BY`, `REQUIRES` and operations-related neighbors.
- In Explorer lens, limit default neighbors to top 3 authored/curated relationships; "show all" remains available.
- The frontend may emphasize/hide details but must not alter source truth or misstate prerequisites.

## 8. Explicit MVP scope
### In
- XP×Copilot custom design system, responsive shell, original iconography.
- Universe Explorer with >=30 curated nodes, >=55 valid typed edges.
- Search, semantic type filter, adaptive three lenses, node inspector, shareable deep links.
- Zero-to-Copilot-Agent-Builder path with >=5 stages and persistence on device.
- One complete Builder Mission and completion checklist.
- Radar landing with source links, verified events only, empty state when nothing verifiable.
- Version-controlled content repository, FastAPI read-only endpoints, Pydantic validation, frontend types.
- Unit tests, smoke tests, static accessibility checks, logging, Docker, deployment and docs.

### Out
- Auth, user accounts, sync across devices, payment, community submissions.
- Real-time full Microsoft catalog sync, speculative automatic graph creation.
- AI mentor/chat, MCP tools at runtime, scraping unauthorized web content.
- Verified credential import or personal Microsoft Learn profile integration.
- Gamification/XP based on clicks, proprietary Microsoft graphic assets.
- Full certification directory, global event ingestion, Neo4j, vector search.

## 9. Data source contract and rights
- `SOURCE:CURATED`: independent MSkill-authored description of a concept, with attributed official references.
- `SOURCE:MICROSOFT_LEARN_DOCS`: links to official docs; avoid mirroring full text, icons, or layouts.
- `SOURCE:MICROSOFT_LEARN_CATALOG`: potential future metadata via the newer authenticated/onboarded Platform API; feature-flagged and not a launch blocker.
- `SOURCE:REACTOR` / `SOURCE:MICROSOFT_EVENTS`: curated event discovery + verified URL; not assumed to be a live programmatic feed.
- `SOURCE:COMMUNITY`: post-MVP, require review and flag as community-created.

Microsoft Learn Platform API supports catalog metadata but not documentation or events. It requires application onboarding and Entra authorization. Docs MCP has a public remote endpoint meant for a compliant MCP client, not a stable direct REST endpoint. Do not put privileged API tokens in client code.

Rights: comply with official source API terms; do not copy Microsoft Learn lessons wholesale. Create MSkill-branded pixel artwork and label MSkill as an independent community project. Avoid official endorsement claims and unauthorized Microsoft trademarks/logos.

Sources to consult:
- https://learn.microsoft.com/en-us/training/support/integrations-learn-platform-api-catalog
- https://learn.microsoft.com/en-us/training/support/integrations-learn-platform-api-get-started
- https://learn.microsoft.com/en-us/training/support/mcp-developer-reference
- https://learn.microsoft.com/en-us/legal/termsofuse
- https://www.microsoft.com/en-us/legal/intellectualproperty/copyright/permissions
- https://reactflow.dev/learn/advanced-use/accessibility

## 10. Success metrics and design validation
- **Discoverability:** in usability tests, >=80% of 5+ participants find the asked technology and linked official resource without coaching.
- **Time to action:** <=3 meaningful interactions from target selection to an official resource.
- **Comprehension:** participants can explain at least one genuine connection after using Explorer.
- **Integrity:** zero dangling edges, duplicate IDs, or cyclic dependency chains; zero unverified event claims.
- **Experience:** automated axe checks for critical routes; keyboard navigation works; responsive QA at 375px, 768px, 1440px.
- **Engineering:** lint, static typecheck, backend test suite, frontend unit tests, Playwright smoke flow, build, Docker smoke, CI.
- **Performance budget:** aim for >=90 Lighthouse Performance on key non-graph routes; monitor interactive graph separately on target device; avoid hard promises before measurement.
- **Trust:** every official resource has a clearly visible publisher and destination; timestamps for verified event entries.

## 11. Release milestones and exit gates
- **M0 / Contract:** ontology + validated dataset + screen sketches + docs signed off.
- **M1 / Shell:** homepage + navigation + responsive layout + tokens + minimal accessibility.
- **M2 / Universe:** first graph + inspector + search + filters + lens switch + deep link.
- **M3 / Learn→Build:** guided path + mission + local persistence.
- **M4 / Release:** radar empty state + source QA + tests + deployment + README + demo GIF/video.

**Release only when:** the three user journeys (newcomer, builder, architect) work, source links are audited, and CI is green.

## 12. Longer-term road map
V1.1: authenticated Microsoft Learn Platform catalog metadata ingestion after onboarding; content integrity jobs.  
V1.2: richer path recommendations and goal onboarding; documented user privacy model.  
V2: AI assistant built on MCP using a supported agent framework, provenance and evaluation.  
V3: Passport with opted-in GitHub evidence and credential links; community learning path submissions and maintainer review.  
V4: graph analytics, multilingual content, larger ontologies, regional event integrations.  

## 13. Positioning and community
Project voice: approachable, playful, precise. The XP aesthetic is the hook; reliable technical explanations are the reason people return. Encourage open-source contributions through small first issues: source link validation, descriptions, translations, edge rationales, test cases, accessible UI. A learning path can evolve into a public evidence trail of contributions and shipped projects.
