"""Manually curated event content. No external calls or learner data."""

import json
from datetime import datetime
from pathlib import Path
from typing import Annotated, Literal, Self
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from pydantic import AfterValidator, model_validator

from mskill_api.models import (
    GraphDataset,
    GraphValidationIssue,
    HttpsUrl,
    Slug,
    StrictModel,
    Text,
    UtcTimestamp,
)
from mskill_api.repository import reject_duplicate_keys
from mskill_api.validation import GraphValidationError


def official_event_url(value: str) -> str:
    url = urlsplit(value)
    if (
        url.hostname
        not in {
            "reactor.microsoft.com",
            "developer.microsoft.com",
            "events.microsoft.com",
            "www.microsoft.com",
            "myevent.microsoft.com",
        }
        or url.port not in {None, 443}
        or url.fragment
    ):
        raise ValueError(
            "Use a direct official Microsoft event URL without a fragment or custom port"
        )
    return value


OfficialEventUrl = Annotated[HttpsUrl, AfterValidator(official_event_url)]


class EventSource(StrictModel):
    url: OfficialEventUrl
    publisher: Literal["Microsoft"]
    catalog: Literal["microsoft-reactor", "microsoft-events"]
    source_status: Literal["verified"]
    last_checked_at: UtcTimestamp


class RadarEvent(StrictModel):
    id: Slug
    title: Text
    description: Text
    organizer: Text
    event_type: Literal["livestream", "webinar", "workshop", "conference", "meetup"]
    starts_at_utc: UtcTimestamp
    ends_at_utc: UtcTimestamp
    original_timezone: Text
    format: Literal["online", "in-person", "hybrid"]
    location: Text | None
    event_url: OfficialEventUrl
    node_ids: list[Slug]
    status: Literal["scheduled", "cancelled"]
    source: EventSource
    relevance_note: Text

    @model_validator(mode="after")
    def valid_schedule(self) -> Self:
        if self.ends_at_utc <= self.starts_at_utc:
            raise ValueError("ends_at_utc must be later than starts_at_utc")
        try:
            ZoneInfo(self.original_timezone)
        except (ZoneInfoNotFoundError, ValueError) as error:
            raise ValueError("original_timezone must be an IANA timezone or UTC") from error
        if self.format != "online" and not self.location:
            raise ValueError("Physical/hybrid events require a location")
        if not self.node_ids or len(self.node_ids) != len(set(self.node_ids)):
            raise ValueError("node_ids must contain unique graph references")
        if self.source.url != self.event_url:
            raise ValueError("Event URL must be the reviewed source page")
        return self


class RadarCatalog(StrictModel):
    version: Text = "v1"
    updated_at: UtcTimestamp | None
    explanation: Text
    events: list[RadarEvent]

    @model_validator(mode="after")
    def valid_reviews(self) -> Self:
        if len({e.id for e in self.events}) != len(self.events):
            raise ValueError("Event IDs must be unique")
        if self.events and (
            self.updated_at is None
            or any(e.source.last_checked_at > self.updated_at for e in self.events)
        ):
            raise ValueError("updated_at must cover every event review timestamp")
        return self


def event_status(
    event: RadarEvent, now: datetime
) -> Literal["cancelled", "past", "ongoing", "upcoming"]:
    if now.utcoffset() is None:
        raise ValueError("Classification requires an aware timestamp")
    if event.status == "cancelled":
        return "cancelled"
    if now >= event.ends_at_utc:
        return "past"
    return "ongoing" if now >= event.starts_at_utc else "upcoming"


def load_radar(file: Path, graph: GraphDataset) -> RadarCatalog:
    raw = file.read_text(encoding="utf-8")
    json.loads(raw, object_pairs_hook=reject_duplicate_keys)
    catalog = RadarCatalog.model_validate_json(raw)
    known = {n.id for n in graph.nodes}
    issues = [
        GraphValidationIssue(
            code="missing_reference",
            location=f"events[{i}].node_ids",
            message=f"Unknown graph node '{node_id}'",
        )
        for i, event in enumerate(catalog.events)
        for node_id in event.node_ids
        if node_id not in known
    ]
    if issues:
        raise GraphValidationError(issues)
    return catalog.model_copy(
        update={"events": sorted(catalog.events, key=lambda e: (e.starts_at_utc, e.id))}
    )
