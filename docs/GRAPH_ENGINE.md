# Slice 2 — Knowledge graph engine

## Boundaries and loading

`content/graph.seed.json` remains the source of truth: 30 nodes, 71 edges, version
`v1`. The API loads and validates the entire file during lifespan startup. An
invalid or missing file prevents startup; no partial graph is served. Set
`CONTENT_PATH` to override the file and restart after content edits.

- `mskill_api/models.py`: strict Pydantic domain and response schemas.
- `mskill_api/validation.py`: cross-record integrity and prerequisite cycles.
- `mskill_api/repository.py`: file loading, ordering, isolated snapshots and adjacency.
- `mskill_api/routes.py`: read-only HTTP routes and unknown-node handling.
- `mskill_api/main.py`: lifespan, dependency composition, CORS and HTTP errors.

Repositories are per application. Returned snapshots are deep copies, so caller
mutations cannot change future reads. No network requests, generated relationships,
database, authentication, or frontend integration are involved.

## Domain models

All models reject unknown fields and type coercion (for example, difficulty `true`
or `"2"`). JSON ISO timestamps are parsed to timezone-aware Python datetimes.

| Model | Required fields | Optional fields / defaults |
|---|---|---|
| `GraphDataset` | `version`, `status`, `nodes`, `edges` | None |
| `GraphNode` | `id`, `kind`, `title`, `topic`, `summary`, `difficulty`, `tags`, `source_status` | `official_url: null`, `explanations: {}`, `last_verified_at: null`, `sources: []` |
| `GraphEdge` | `id`, `from`, `to`, `type`, `rationale`, `confidence`, `source_status` | `source_url: null`, `last_verified_at: null`, `sources: []` |
| `GraphSource` | `url`, `publisher`, `source_status` | `last_verified_at: null` |
| `ConnectionsResponse` | `node_id`, `incoming`, `outgoing`, `symmetric` | None |
| `ErrorResponse` | `code`, `message` | None |

IDs are lowercase alphanumeric slugs with optional hyphens. Node and edge IDs are
unique within their respective collections. `from` is represented internally as
`from_id`, but remains `from` in JSON and OpenAPI. Nonempty text must contain a
non-whitespace character. Difficulty is an integer from 1 to 3.

Node kinds: `product`, `concept`, `skill`, `resource`, `credential`, `mission`,
`event`. Topics: `ai`, `automation`, `data`, `identity`, `architecture`,
`collaboration`. Explanations accept only `explorer`, `builder`, `architect` keys.
The seed's identifiers, URLs and authored text are preserved.

Dataset status is `editorial-seed-review` or `verified`. Node, edge and source
status is `seed-review` or `verified`. Confidence is `editorial` or
`officially-documented`. Missing optional fields are emitted with the defaults
above, making API shapes predictable even for older seed records.

## Relationship semantics

These meanings describe authored graph relationships, not automatic claims about
Microsoft product requirements. Each edge carries its own rationale and provenance.

| Type | Meaning of A → B | Handling |
|---|---|---|
| `REQUIRES` | A depends on prerequisite B | Directed; must form a DAG |
| `PART_OF` | A belongs within B | Directed; does not imply a prerequisite |
| `ENABLES` | A enables B | Directed |
| `INTEGRATES_WITH` | A connects with B | Symmetric; store a single pair |
| `USES` | A uses B | Directed |
| `GOVERNED_BY` | A is subject to governance topic B | Directed |
| `RELATED_TO` | A has an editorial association with B | Authored direction; never a prerequisite |

Connections split directed edges into incoming and outgoing, and put
`INTEGRATES_WITH` edges in `symmetric` at both endpoints. They preserve stored
`from` and `to`; no reverse or transitive edges are synthesized.

## Validation and errors

Pydantic reports schema failures with field paths, error types and explanations
(`ValidationError.errors()`). Cross-record failures raise `GraphValidationError`
with an `issues` tuple; each issue has `code`, `location`, `message`.

| Integrity code | Rejected condition |
|---|---|
| `duplicate_json_key` | Repeated JSON property; no silently overwritten values |
| `duplicate_node_id` | Repeated node ID |
| `duplicate_edge_id` | Repeated edge ID |
| `missing_endpoint` | `from` or `to` references an absent node |
| `self_reference` | Node linked to itself, for any relationship type |
| `duplicate_relationship` | Repeated `(from,to,type)`; reversed integrations also count |
| `prerequisite_cycle` | Cycle in `REQUIRES`, including a concrete cycle path |

All cross-record issues found in a structurally valid dataset are aggregated.
Schema errors must be fixed before cross-record validation. Cycle detection uses
iterative DFS, avoiding Python recursion limits. Other relationship cycles are
allowed. Different relation types may connect the same two nodes.

Example diagnostic: `edges[2] (bad).to: Unknown node 'missing' [missing_endpoint]`.
Startup failures are operator diagnostics, not successful HTTP responses. API HTTP
errors use `{code,message}`; unknown nodes return 404, unsupported methods 405.
FastAPI retains its standard request-validation and internal-error handling.

## Source verification policy

- HTTPS URLs must parse and contain neither embedded credentials nor surrounding
  whitespace. URL spelling is preserved. No requests are made to check availability.
- Verification timestamps must be timezone-aware ISO UTC (`Z` or `+00:00`).
- A verified node requires a review timestamp and `official_url` or a verified
  nested source. A verified edge requires a review timestamp and `source_url` or
  a verified nested source. A verified nested source requires its own timestamp.
- `officially-documented` edges additionally require verified record status and
  evidence hosted on `microsoft.com` or a true subdomain. Lookalike suffixes fail.
  This deliberately narrow allowlist can be extended only after editorial review.
- A `verified` dataset cannot contain seed-review nodes or edges. Unreviewed
  supplemental sources remain individually labelled; they do not grant verification.
- A URL, publisher label, timestamp or nested source never automatically changes
  the parent status or editorial confidence. Verified editorial guidance remains
  MSkill guidance, distinct from a documented Microsoft requirement.

These checks enforce provenance consistency; they cannot establish that a page
supports an assertion or that an editor actually reviewed it. Maintainers must
review primary evidence before marking a claim verified. All existing nodes and
edges remain **seed-review**, all edges remain **editorial**, and this slice makes
no new Microsoft product claims.

## API contracts and examples

Swagger: `/docs`. Machine-readable schemas: `/openapi.json`. Routes are read-only;
there is no pagination, filtering or mutation API in this slice.

```sh
curl http://localhost:8000/api/v1/graph
curl http://localhost:8000/api/v1/nodes/api-basics
curl http://localhost:8000/api/v1/nodes/copilot-studio/connections
curl -i http://localhost:8000/api/v1/nodes/missing
```

Use port 8001 for the repository's documented alternate-port Compose setup.

`GET /api/v1/graph` returns HTTP 200 with `version`, `status`, `nodes` and `edges`.
The complete seed response contains 30 full nodes and 71 full edges. Arrays are
sorted lexicographically by ID, including each connections array. Tags,
explanation keys and source arrays are also deterministically ordered. Source
arrays use their model JSON as the sort key. Optional nulls and empty arrays are
included. `GraphRepository.canonical_json()` additionally sorts every object key
and emits compact UTF-8-compatible JSON for comparisons; repeated HTTP reads also
produce identical bytes for an unchanged dataset.

`GET /api/v1/nodes/api-basics` returns this full HTTP 200 response:

```json
{
  "id": "api-basics",
  "kind": "skill",
  "title": "API fundamentals",
  "topic": "data",
  "summary": "Understanding requests, responses, authentication and error handling.",
  "difficulty": 2,
  "tags": [
    "data"
  ],
  "source_status": "seed-review",
  "official_url": null,
  "explanations": {
    "architect": "Assess security, integration boundaries, operations and lifecycle decisions related to API fundamentals; review primary sources.",
    "builder": "Explore how API fundamentals connects to practical solutions; inspect its relationships and validate the linked documentation.",
    "explorer": "Understanding requests, responses, authentication and error handling."
  },
  "last_verified_at": null,
  "sources": []
}
```

`GET /api/v1/nodes/{node_id}/connections` returns HTTP 200:
`{"node_id":"…","incoming":[GraphEdge],"outgoing":[GraphEdge],"symmetric":[GraphEdge]}`.
Arrays can be empty. For Copilot Studio, `symmetric` includes this full seed edge
(with additive defaults); Power Automate returns the identical edge orientation:

```json
{
  "id": "e028",
  "from": "copilot-studio",
  "to": "power-automate",
  "type": "INTEGRATES_WITH",
  "rationale": "MSkill editorial relationship: copilot studio integrates with power automate. Review against official documentation before publication.",
  "confidence": "editorial",
  "source_status": "seed-review",
  "source_url": null,
  "last_verified_at": null,
  "sources": []
}
```

Both node endpoints return HTTP 404 for `missing`:

```json
{"code":"not_found","message":"Unknown node 'missing'"}
```

## Known limitations and next boundary

The graph is small and in-memory; full snapshots are copied on each request.
Empty datasets and isolated nodes are valid. IDs are case-sensitive. The loader
checks syntax and graph integrity, not factual correctness, URL reachability,
recency of review dates, or whether a node kind is appropriate for a specific
relationship. It does not validate learning path/mission JSON, which remains
outside this graph API. Specialized resource, credential, event and mission
fields are deferred; these kinds currently share the common node schema.

Slice 3 now consumes these contracts with manually maintained TypeScript models,
runtime shape guards and an HTTP smoke assertion that its test fixture matches
the real API. See [SLICE_3_IMPLEMENTATION.md](SLICE_3_IMPLEMENTATION.md). The original
draft path/radar endpoints remain deferred; the backend contracts are unchanged.
