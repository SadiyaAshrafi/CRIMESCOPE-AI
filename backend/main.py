from pathlib import Path
import json
import re
from datetime import datetime, timezone

from fastapi import FastAPI
from pydantic import BaseModel

from ai.extractor import (
    extract_entities,
    extract_dates,
    extract_relationships
)

from ai.resolver import resolve_entities
from evidence.evidence import create_evidence


app = FastAPI(
    title="CRIMESCOPE AI",
    description="AI + Evidence Intelligence Engine",
    version="1.0.0"
)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "sample_cases.json"


# =========================================================
# REQUEST MODEL
# =========================================================

class TextInput(BaseModel):
    text: str
    case_id: str = "CASE-DEMO"
    source: str = "demo_document.txt"
    page: int = 1


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def clean_name(value: str) -> str:
    """
    Clean entity names before generating IDs.
    """
    return (
        value
        .strip()
        .rstrip(".,;:")
    )


def make_id(value: str) -> str:
    """
    Convert an entity name into a stable ID.
    """
    value = clean_name(value).lower()

    value = re.sub(
        r"[^a-z0-9]+",
        "_",
        value
    )

    return value.strip("_")


def get_entity_type(entity: dict) -> str:
    """
    Normalize entity labels for graph usage.
    """

    name = clean_name(
        entity.get("text", "")
    )

    if re.fullmatch(
        r"Person\s+[A-Z]",
        name,
        re.IGNORECASE
    ):
        return "PERSON"

    if re.fullmatch(
        r"Organization\s+[A-Z]",
        name,
        re.IGNORECASE
    ):
        return "ORGANIZATION"

    if re.fullmatch(
        r"Location\s+[A-Z]",
        name,
        re.IGNORECASE
    ):
        return "LOCATION"

    label = entity.get(
        "label",
        "UNKNOWN"
    )

    if label == "ORG":
        return "ORGANIZATION"

    if label == "GPE":
        return "LOCATION"

    return label


def normalize_entities(entities: list) -> list:
    """
    Clean and normalize extracted entities.
    """

    result = []
    seen = set()

    for entity in entities:

        name = clean_name(
            entity.get("text", "")
        )

        if not name:
            continue

        entity_type = get_entity_type(entity)

        # Ignore obvious noisy entities
        if name.lower() == "organization x investigators":
            continue

        entity_id = make_id(name)

        key = (
            entity_id,
            entity_type
        )

        if key in seen:
            continue

        seen.add(key)

        result.append({
            "text": name,
            "label": entity_type,
            "start": entity.get("start", 0),
            "end": entity.get("end", 0),
            "source": entity.get(
                "source",
                "CRIMESCOPE_RULE"
            )
        })

    return result


def normalize_relationships(
    relationships: list,
    entity_lookup: dict,
    case_id: str,
    evidence_id: str = None,
    date: str = None
) -> list:
    """
    Convert relationships into stable graph-ready records.
    """

    result = []
    seen = set()

    for index, relationship in enumerate(
        relationships,
        start=1
    ):

        source_name = clean_name(
            relationship.get(
                "source",
                ""
            )
        )

        target_name = clean_name(
            relationship.get(
                "target",
                ""
            )
        )

        if not source_name or not target_name:
            continue

        source_id = make_id(source_name)
        target_id = make_id(target_name)

        # Only create relationships between
        # entities that actually exist.
        if source_id not in entity_lookup:
            continue

        if target_id not in entity_lookup:
            continue

        relationship_type = relationship.get(
            "relationship",
            "RELATED_TO"
        )

        key = (
            source_id,
            target_id,
            relationship_type,
            case_id
        )

        if key in seen:
            continue

        seen.add(key)

        relationship_id = (
            f"REL-{case_id}-{index:03d}"
        )

        result.append({
            "id": relationship_id,
            "source_entity_id": source_id,
            "target_entity_id": target_id,
            "source": source_name,
            "target": target_name,
            "relationship": relationship_type,
            "confidence": relationship.get(
                "confidence",
                0.0
            ),
            "evidence_id": evidence_id,
            "date": date,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat()
        })

    return result


def build_case(case: dict) -> dict:
    """
    Process one investigation case.
    """

    case_id = case.get(
        "case_id",
        "CASE-UNKNOWN"
    )

    text = case.get(
        "description",
        ""
    )

    title = case.get(
        "title",
        ""
    )

    case_date = case.get(
        "date",
        ""
    )

    case_location = case.get(
        "location",
        ""
    )

    # -----------------------------------------------------
    # ENTITY EXTRACTION
    # -----------------------------------------------------

    raw_entities = extract_entities(text)

    entities = normalize_entities(
        raw_entities
    )

    # -----------------------------------------------------
    # ENTITY RESOLUTION
    # -----------------------------------------------------

    resolved_entities = resolve_entities(
        entities
    )

    # -----------------------------------------------------
    # DATES
    # -----------------------------------------------------

    dates = extract_dates(text)

    # Prefer case date when available
    if not dates and case_date:
        dates = [case_date]

    primary_date = (
        dates[0]
        if dates
        else case_date
    )

    # -----------------------------------------------------
    # EVIDENCE
    # -----------------------------------------------------

    evidence = create_evidence(
        case_id=case_id,
        source=f"{case_id}_document.txt",
        page=1,
        text=text,
        confidence=0.91
    )

    evidence_id = evidence.get(
        "evidence_id"
    )

    # -----------------------------------------------------
    # ENTITY LOOKUP
    # -----------------------------------------------------

    entity_lookup = {}

    for entity in resolved_entities:

        canonical_id = entity.get(
            "canonical_id"
        )

        if canonical_id:
            entity_lookup[
                canonical_id
            ] = entity

    # -----------------------------------------------------
    # RELATIONSHIPS
    # -----------------------------------------------------

    raw_relationships = extract_relationships(
        text,
        entities
    )

    relationships = normalize_relationships(
        raw_relationships,
        entity_lookup,
        case_id,
        evidence_id,
        primary_date
    )

    # -----------------------------------------------------
    # CASE ENTITY IDS
    # -----------------------------------------------------

    entity_ids = [
        entity.get("canonical_id")
        for entity in resolved_entities
        if entity.get("canonical_id")
    ]

    # -----------------------------------------------------
    # CASE RELATIONSHIP IDS
    # -----------------------------------------------------

    relationship_ids = [
        relationship["id"]
        for relationship in relationships
    ]

    # -----------------------------------------------------
    # FINAL CASE OBJECT
    # -----------------------------------------------------

    return {
        "case_id": case_id,

        "title": title,

        "description": text,

        "summary": text[:250],

        "date": case_date,

        "dates": dates,

        "location": case_location,

        "entity_ids": entity_ids,

        "relationship_ids": relationship_ids,

        "entities": entities,

        "resolved_entities": resolved_entities,

        "relationships": relationships,

        "evidence": evidence
    }


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "system": "CRIMESCOPE AI",

        "module": "AI + Evidence Intelligence Engine",

        "status": "running",

        "version": "1.0.0"
    }


# =========================================================
# EXTRACT
# =========================================================

@app.post("/extract")
def extract_information(
    data: TextInput
):

    entities = normalize_entities(
        extract_entities(data.text)
    )

    resolved_entities = resolve_entities(
        entities
    )

    dates = extract_dates(
        data.text
    )

    evidence = create_evidence(
        case_id=data.case_id,
        source=data.source,
        page=data.page,
        text=data.text,
        confidence=0.91
    )

    raw_relationships = extract_relationships(
        data.text,
        entities
    )

    entity_lookup = {
        entity["canonical_id"]: entity
        for entity in resolved_entities
        if entity.get("canonical_id")
    }

    relationships = normalize_relationships(
        raw_relationships,
        entity_lookup,
        data.case_id,
        evidence.get("evidence_id"),
        dates[0] if dates else None
    )

    return {
        "status": "success",

        "case_id": data.case_id,

        "entities": entities,

        "resolved_entities": resolved_entities,

        "dates": dates,

        "relationships": relationships,

        "evidence": evidence
    }


# =========================================================
# PROCESS CASES
# =========================================================

@app.post("/process-cases")
def process_cases():

    if not DATA_FILE.exists():

        return {
            "status": "error",

            "message": (
                "sample_cases.json was not found."
            ),

            "file": str(DATA_FILE)
        }

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        cases = json.load(file)

    processed_cases = []

    for case in cases:

        processed_case = build_case(
            case
        )

        processed_cases.append(
            processed_case
        )

    total_entities = sum(
        len(case["entities"])
        for case in processed_cases
    )

    total_relationships = sum(
        len(case["relationships"])
        for case in processed_cases
    )

    return {

        "status": "success",

        "message": (
            "All investigation cases "
            "processed successfully."
        ),

        "summary": {

            "total_cases":
                len(processed_cases),

            "total_entities":
                total_entities,

            "total_relationships":
                total_relationships,

            "total_evidence_records":
                len(processed_cases)
        },

        "cases":
            processed_cases
    }


# =========================================================
# GRAPH DATA
# =========================================================

@app.post("/graph-data")
def graph_data():

    if not DATA_FILE.exists():

        return {
            "status": "error",

            "message": (
                "sample_cases.json was not found."
            )
        }

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        cases = json.load(file)

    nodes = {}
    edges = []

    for case in cases:

        processed_case = build_case(
            case
        )

        case_id = processed_case[
            "case_id"
        ]

        # -------------------------------------------------
        # NODES
        # -------------------------------------------------

        for entity in processed_case[
            "resolved_entities"
        ]:

            canonical_id = entity.get(
                "canonical_id"
            )

            if not canonical_id:
                continue

            if canonical_id not in nodes:

                nodes[canonical_id] = {

                    "id":
                        canonical_id,

                    "name":
                        entity.get(
                            "canonical_name",
                            canonical_id
                        ),

                    "type":
                        entity.get(
                            "entity_type",
                            "UNKNOWN"
                        ),

                    "case_ids":
                        [case_id],

                    "metadata": {
                        "source":
                            "CRIMESCOPE_AI"
                    }
                }

            else:

                if case_id not in nodes[
                    canonical_id
                ]["case_ids"]:

                    nodes[
                        canonical_id
                    ]["case_ids"].append(
                        case_id
                    )

        # -------------------------------------------------
        # EDGES
        # -------------------------------------------------

        for relationship in processed_case[
            "relationships"
        ]:

            edges.append({

                "id":
                    relationship["id"],

                "source_entity_id":
                    relationship[
                        "source_entity_id"
                    ],

                "target_entity_id":
                    relationship[
                        "target_entity_id"
                    ],

                "source":
                    relationship["source"],

                "target":
                    relationship["target"],

                "type":
                    relationship["relationship"],

                "confidence":
                    relationship["confidence"],

                "evidence_id":
                    relationship["evidence_id"],

                "date":
                    relationship["date"],

                "timestamp":
                    relationship["timestamp"],

                "case_id":
                    case_id
            })

    # -----------------------------------------------------
    # REMOVE DUPLICATE EDGES
    # -----------------------------------------------------

    unique_edges = {}

    for edge in edges:

        key = (
            edge["source_entity_id"],
            edge["target_entity_id"],
            edge["type"],
            edge["case_id"]
        )

        unique_edges[key] = edge

    return {

        "status": "success",

        "nodes":
            list(nodes.values()),

        "edges":
            list(unique_edges.values())
    }


# =========================================================
# INTELLIGENCE SUMMARY
# =========================================================

@app.post("/intelligence-summary")
def intelligence_summary():

    if not DATA_FILE.exists():

        return {
            "status": "error",

            "message": (
                "sample_cases.json was not found."
            )
        }

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        cases = json.load(file)

    processed_cases = []

    for case in cases:

        processed_cases.append(
            build_case(case)
        )

    entity_map = {}

    all_relationships = []

    # -----------------------------------------------------
    # COLLECT ENTITIES
    # -----------------------------------------------------

    for case in processed_cases:

        case_id = case["case_id"]

        for entity in case[
            "resolved_entities"
        ]:

            entity_id = entity.get(
                "canonical_id"
            )

            if not entity_id:
                continue

            if entity_id not in entity_map:

                entity_map[entity_id] = {

                    "canonical_id":
                        entity_id,

                    "name":
                        entity.get(
                            "canonical_name",
                            entity_id
                        ),

                    "type":
                        entity.get(
                            "entity_type",
                            "UNKNOWN"
                        ),

                    "case_ids":
                        []
                }

            if case_id not in entity_map[
                entity_id
            ]["case_ids"]:

                entity_map[
                    entity_id
                ]["case_ids"].append(
                    case_id
                )

        all_relationships.extend(
            case["relationships"]
        )

    # -----------------------------------------------------
    # CROSS-CASE ENTITIES
    # -----------------------------------------------------

    cross_case_entities = [

        entity

        for entity in entity_map.values()

        if len(entity["case_ids"]) > 1
    ]

    cross_case_entities.sort(

        key=lambda entity:
            len(entity["case_ids"]),

        reverse=True
    )

    # -----------------------------------------------------
    # CONNECTION COUNTS
    # -----------------------------------------------------

    connection_counts = {}

    for relationship in all_relationships:

        source_id = relationship[
            "source_entity_id"
        ]

        target_id = relationship[
            "target_entity_id"
        ]

        connection_counts[
            source_id
        ] = connection_counts.get(
            source_id,
            0
        ) + 1

        connection_counts[
            target_id
        ] = connection_counts.get(
            target_id,
            0
        ) + 1

    top_connected_entities = []

    for entity_id, count in (
        connection_counts.items()
    ):

        entity = entity_map.get(
            entity_id,
            {}
        )

        top_connected_entities.append({

            "entity_id":
                entity_id,

            "name":
                entity.get(
                    "name",
                    entity_id
                ),

            "type":
                entity.get(
                    "type",
                    "UNKNOWN"
                ),

            "connection_count":
                count
        })

    top_connected_entities.sort(

        key=lambda entity:
            entity["connection_count"],

        reverse=True
    )

    top_connected_entities = (
        top_connected_entities[:10]
    )

    # -----------------------------------------------------
    # HIGH CONFIDENCE RELATIONSHIPS
    # -----------------------------------------------------

    high_confidence_relationships = [

        relationship

        for relationship in all_relationships

        if relationship.get(
            "confidence",
            0
        ) >= 0.80
    ]

    # -----------------------------------------------------
    # CASE INSIGHTS
    # -----------------------------------------------------

    case_insights = []

    for case in processed_cases:

        case_insights.append({

            "case_id":
                case["case_id"],

            "title":
                case["title"],

            "entity_count":
                len(case["entities"]),

            "relationship_count":
                len(case["relationships"]),

            "evidence_count":
                1,

            "entity_ids":
                case["entity_ids"],

            "relationship_ids":
                case["relationship_ids"]
        })

    # -----------------------------------------------------
    # FINAL RESPONSE
    # -----------------------------------------------------

    return {

        "status": "success",

        "summary": {

            "total_cases":
                len(processed_cases),

            "unique_entities":
                len(entity_map),

            "total_relationships":
                len(all_relationships),

            "cross_case_entities":
                len(cross_case_entities),

            "high_confidence_relationships":
                len(
                    high_confidence_relationships
                )
        },

        "cross_case_entities":
            cross_case_entities,

        "top_connected_entities":
            top_connected_entities,

        "high_confidence_relationships":
            high_confidence_relationships,

        "case_insights":
            case_insights
    }


# =========================================================
# INTEGRATION DATA
# =========================================================

@app.post("/integration-data")
def integration_data():

    if not DATA_FILE.exists():

        return {
            "status": "error",

            "message": (
                "sample_cases.json was not found."
            )
        }

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        cases = json.load(file)

    processed_cases = []

    entities_map = {}
    relationships = []
    evidence_records = []

    # =====================================================
    # PROCESS EVERYTHING
    # =====================================================

    for case in cases:

        processed_case = build_case(
            case
        )

        processed_cases.append(
            processed_case
        )

        case_id = processed_case[
            "case_id"
        ]

        # -------------------------------------------------
        # ENTITIES
        # -------------------------------------------------

        for entity in processed_case[
            "resolved_entities"
        ]:

            canonical_id = entity.get(
                "canonical_id"
            )

            if not canonical_id:
                continue

            if canonical_id not in entities_map:

                entities_map[
                    canonical_id
                ] = {

                    "id":
                        canonical_id,

                    "canonical_id":
                        canonical_id,

                    "name":
                        entity.get(
                            "canonical_name",
                            canonical_id
                        ),

                    "type":
                        entity.get(
                            "entity_type",
                            "UNKNOWN"
                        ),

                    "label":
                        entity.get(
                            "entity_type",
                            "UNKNOWN"
                        ),

                    "case_ids":
                        [case_id],

                    "metadata": {}
                }

            else:

                if case_id not in entities_map[
                    canonical_id
                ]["case_ids"]:

                    entities_map[
                        canonical_id
                    ]["case_ids"].append(
                        case_id
                    )

        # -------------------------------------------------
        # RELATIONSHIPS
        # -------------------------------------------------

        relationships.extend(
            processed_case[
                "relationships"
            ]
        )

        # -------------------------------------------------
        # EVIDENCE
        # -------------------------------------------------

        evidence = processed_case[
            "evidence"
        ]

        evidence_records.append({

            "evidence_id":
                evidence.get(
                    "evidence_id"
                ),

            "case_id":
                case_id,

            "source_document":
                evidence.get(
                    "source"
                ),

            "page":
                evidence.get(
                    "page"
                ),

            "text":
                evidence.get(
                    "text"
                ),

            "extraction_timestamp":
                evidence.get(
                    "extracted_at"
                ),

            "confidence":
                evidence.get(
                    "confidence"
                ),

            "supports_relationship_ids":
                processed_case[
                    "relationship_ids"
                ],

            "supports_entity_ids":
                processed_case[
                    "entity_ids"
                ]
        })

    # =====================================================
    # CASE OUTPUT
    # =====================================================

    case_records = []

    for case in processed_cases:

        case_records.append({

            "case_id":
                case["case_id"],

            "name":
                case["title"],

            "title":
                case["title"],

            "description":
                case["description"],

            "summary":
                case["summary"],

            "entity_ids":
                case["entity_ids"],

            "relationship_ids":
                case["relationship_ids"],

            "dates":
                case["dates"],

            "location":
                case["location"]
        })

    # =====================================================
    # FINAL INTEGRATION RESPONSE
    # =====================================================

    return {

        "status": "success",

        "version": "1.0",

        "entities":
            list(entities_map.values()),

        "relationships":
            relationships,

        "cases":
            case_records,

        "evidence":
            evidence_records,

        "summary": {

            "total_cases":
                len(case_records),

            "total_entities":
                len(entities_map),

            "total_relationships":
                len(relationships),

            "total_evidence":
                len(evidence_records)
        }
    }