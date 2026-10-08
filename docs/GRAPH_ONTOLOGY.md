# Knowledge Graph Ontology and Integrity Rules

## Why this exists
The graph is product infrastructure, not a decorative mind map. Each node and edge must have a stable meaning, clear direction, and traceable editorial status.

## Node fields
```ts
type NodeKind = 'product'|'concept'|'skill'|'resource'|'credential'|'mission'|'event';
type Level = 'explorer'|'builder'|'architect';
type Topic = 'ai'|'automation'|'data'|'identity'|'architecture'|'collaboration';
interface GraphSource {
  url: string; // HTTPS
  publisher: string;
  source_status: 'seed-review'|'verified';
  last_verified_at?: string|null; // ISO UTC
}
interface GraphNode {
  id: string; // permanent slug, never title-derived at runtime
  kind: NodeKind;
  title: string;
  topic: Topic;
  summary: string; // independent authored explanation
  difficulty: 1|2|3;
  official_url?: string|null;
  tags: string[];
  explanations?: Partial<Record<Level,string>>;
  source_status: 'seed-review'|'verified';
  last_verified_at?: string|null; // ISO UTC
  sources?: GraphSource[];
}
```

### UX rules
- Difficulty != credential or Microsoft-endorsed proficiency. It is an MSkill editorial heuristic.
- Author all three explanations where possible; fallback to summary if missing.
- Product node != skill node. E.g., Copilot Studio (`product`) vs design agent workflows (`skill`).
- One stable ID per canonical thing; duplicates prohibited.

## Edge contract
```ts
type Relation = 'REQUIRES'|'PART_OF'|'ENABLES'|'INTEGRATES_WITH'|'USES'|'GOVERNED_BY'|'RELATED_TO';
interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: Relation;
  rationale: string;
  confidence: 'editorial'|'officially-documented';
  source_url?: string|null;
  last_verified_at?: string|null; // ISO UTC
  sources?: GraphSource[];
  source_status: 'seed-review'|'verified';
}
```

Semantics:
| Edge | Directed meaning | Example |
|---|---|---|
| `REQUIRES` | A requires prerequisite B | Agent actions require connectors knowledge (for this authored path) |
| `PART_OF` | A is a subcapability/category inside B | Cloud flows are part of Power Automate |
| `ENABLES` | A enables use case/capability B | Connectors enable cloud flows |
| `INTEGRATES_WITH` | A connects with B | Copilot Studio integrates with Power Automate |
| `USES` | A uses B | Copilot Studio uses knowledge sources |
| `GOVERNED_BY` | A is subject to topic B | Copilot Studio governed by policy and ALM |
| `RELATED_TO` | Non-prerequisite editorial connection | Dataverse related to SharePoint in common business data workflows |

### Edge integrity requirements
- Endpoints must exist. No self-edges. No duplicate `(from,to,type)` triples.
- Prerequisite (`REQUIRES`) subgraph must be acyclic. Direction is **dependent → prerequisite**.
- `INTEGRATES_WITH` is symmetric conceptually; store a single canonical pair, display both ways.
- `PART_OF` is hierarchical, never automatically imply prerequisite.
- A `RELATED_TO` edge must never be displayed as a required learning step.
- Do not upgrade an editorial assertion to Microsoft's product requirement.
- Every edge rationale appears in inspector; if not sourced, label as MSkill guidance.
- Graph filters are view projections; never mutate the underlying truth.

## Learning resources, credentials, missions, and events
The first 30-node seed is intentionally product/concept/skill-heavy. Follow-up content JSONs reference nodes, not fake graph entries.

Later resource nodes should also carry `publisher`, `source_uid`, `url`, `language`, `last_checked_at`, `status`. Credentials need status/retirement review. Events need authoritative `starts_at_utc`, `ends_at_utc`, original registration URL and last checked date. Missions need objective, prerequisites, steps, test cases, evidence checklist.

## Data integrity and presentation
- API rejects malformed data at startup; CI tests ensure no dangling references.
- Verify source URLs manually before switching `source_status` to `verified`.
- Version seed changes; review PR changes to `graph.seed.json` like source-code changes.
- Unknown/empty content shows honest fallback; never automatically fabricate citations or credentials.
- Use canonical JSON and Pydantic schema as shared truth; generate TS types or manually keep them in sync with contract tests.

## Slice 2 implementation contract

The Python Pydantic models and `/openapi.json` define the runtime schema; the
TypeScript excerpts above are ontology sketches, not a generated frontend client.
`GraphSource` contains `url` (HTTPS), `publisher`, `source_status`, and optional
UTC `last_verified_at`. Sources are additive and optional for seed compatibility.
Responses emit absent URLs/timestamps as `null`, sources as `[]`, and explanations
as `{}`. Unknown fields are rejected rather than discarded.

Verified nodes/edges require evidence and a UTC review timestamp. Verified nested
sources also require their own review timestamp. `officially-documented` edges
require verified status and evidence hosted on `microsoft.com` or its subdomains.
This is a provenance consistency check, not an automated factual review. Human
review must establish that the linked documentation supports the claim. Editorial
confidence remains editorial even after verification. No seed record was promoted.

`INTEGRATES_WITH` reverse duplicates are rejected; API connections expose those
edges in `symmetric` at either endpoint while retaining their authored `from`/`to`.
Other relationships, including `RELATED_TO`, retain authored direction. Rich
resource/credential/mission/event metadata described above remains future work;
all seven node kinds work with the common node schema now. See
[GRAPH_ENGINE.md](GRAPH_ENGINE.md) for detailed contracts and limitations.
