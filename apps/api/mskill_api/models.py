"""Versioned JSON domain and public response contracts."""

from datetime import datetime, timedelta
from typing import Annotated, Literal, Self

from pydantic import (
    AfterValidator,
    AwareDatetime,
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    StringConstraints,
    TypeAdapter,
    model_validator,
)

Text = Annotated[str, StringConstraints(min_length=1, pattern=r"\S")]
Slug = Annotated[str, StringConstraints(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")]
NodeKind = Literal["product", "concept", "skill", "resource", "credential", "mission", "event"]
Topic = Literal["ai", "automation", "data", "identity", "architecture", "collaboration"]
Level = Literal["explorer", "builder", "architect"]
Relation = Literal[
    "REQUIRES", "PART_OF", "ENABLES", "INTEGRATES_WITH", "USES", "GOVERNED_BY", "RELATED_TO"
]
SourceStatus = Literal["seed-review", "verified"]
_url_adapter = TypeAdapter(HttpUrl)


def https_url(value: str) -> str:
    parsed = _url_adapter.validate_python(value)
    if parsed.scheme != "https" or parsed.username or parsed.password or value != value.strip():
        raise ValueError("Use an HTTPS URL without credentials or surrounding whitespace")
    return value  # Validate without rewriting authored URLs.


def utc_timestamp(value: datetime) -> datetime:
    if value.utcoffset() != timedelta(0):
        raise ValueError("Verification timestamp must be UTC (Z or +00:00)")
    return value


HttpsUrl = Annotated[str, AfterValidator(https_url)]
UtcTimestamp = Annotated[AwareDatetime, AfterValidator(utc_timestamp)]


def is_microsoft_url(value: str) -> bool:
    host = _url_adapter.validate_python(value).host or ""
    return host == "microsoft.com" or host.endswith(".microsoft.com")


class StrictModel(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid", frozen=True, serialize_by_alias=True)


class GraphSource(StrictModel):
    """Optional attributed evidence; a URL alone never grants verified status."""

    url: HttpsUrl
    publisher: Text
    source_status: SourceStatus
    last_verified_at: UtcTimestamp | None = None

    @model_validator(mode="after")
    def verified_source_has_review_date(self) -> Self:
        if self.source_status == "verified" and self.last_verified_at is None:
            raise ValueError("Verified source requires last_verified_at")
        return self


class GraphNode(StrictModel):
    id: Slug
    kind: NodeKind
    title: Text
    topic: Topic
    summary: Text
    difficulty: Annotated[int, Field(ge=1, le=3)]
    tags: list[Text]
    source_status: SourceStatus
    official_url: HttpsUrl | None = None
    explanations: dict[Level, Text] = Field(default_factory=dict)
    last_verified_at: UtcTimestamp | None = None
    sources: list[GraphSource] = Field(default_factory=list)

    @model_validator(mode="after")
    def verified_node_has_evidence(self) -> Self:
        if self.source_status == "verified":
            if self.last_verified_at is None:
                raise ValueError("Verified node requires last_verified_at")
            if not self.official_url and not any(
                source.source_status == "verified" for source in self.sources
            ):
                raise ValueError("Verified node requires official_url or a verified source")
        return self


class GraphEdge(StrictModel):
    id: Slug
    from_id: Slug = Field(alias="from")
    to: Slug
    type: Relation
    rationale: Text
    confidence: Literal["editorial", "officially-documented"]
    source_status: SourceStatus
    source_url: HttpsUrl | None = None
    last_verified_at: UtcTimestamp | None = None
    sources: list[GraphSource] = Field(default_factory=list)

    @model_validator(mode="after")
    def evidence_matches_claim(self) -> Self:
        evidence = [s.url for s in self.sources if s.source_status == "verified"]
        if self.source_url:
            evidence.append(self.source_url)
        if self.source_status == "verified" and (not evidence or self.last_verified_at is None):
            raise ValueError("Verified edge requires evidence and last_verified_at")
        if self.confidence == "officially-documented" and (
            self.source_status != "verified" or not any(is_microsoft_url(url) for url in evidence)
        ):
            raise ValueError("Officially documented edge requires verified Microsoft evidence")
        return self


class GraphDataset(StrictModel):
    version: Text
    status: Literal["editorial-seed-review", "verified"]
    nodes: list[GraphNode]
    edges: list[GraphEdge]

    @model_validator(mode="after")
    def verified_dataset_has_no_unreviewed_records(self) -> Self:
        if self.status == "verified" and any(
            status != "verified"
            for status in [
                *(node.source_status for node in self.nodes),
                *(edge.source_status for edge in self.edges),
            ]
        ):
            raise ValueError("Verified dataset cannot contain seed-review records")
        return self


class ConnectionsResponse(StrictModel):
    node_id: Slug
    incoming: list[GraphEdge]
    outgoing: list[GraphEdge]
    symmetric: list[GraphEdge]


class HealthResponse(StrictModel):
    status: Literal["ok"] = "ok"
    graph_version: str


class ErrorResponse(StrictModel):
    code: str
    message: str


class GraphValidationIssue(StrictModel):
    code: str
    location: str
    message: str
