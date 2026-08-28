from datetime import date
from neo4j import Driver


def calculate_temporal_score(date_1, date_2):
    """
    Calculate a temporal connection score based on
    the number of days between two case dates.

    Closer cases receive a stronger score.
    """

    if not date_1 or not date_2:
        return 0

    try:
        d1 = date.fromisoformat(date_1)
        d2 = date.fromisoformat(date_2)
    except ValueError:
        return 0

    days_apart = abs((d2 - d1).days)

    if days_apart <= 30:
        return 15
    elif days_apart <= 90:
        return 10
    elif days_apart <= 180:
        return 5

    return 0


def find_related_cases(driver: Driver, case_id: str):
    """
    Find cases related through shared entities.

    Also retrieves the dates of both cases so temporal
    proximity can be calculated.
    """

    with driver.session() as session:

        result = session.run(
            """
            MATCH (source_case:Case {id: $case_id})

            MATCH (shared_entity)-[:MENTIONED_IN]->(source_case)
            MATCH (shared_entity)-[:MENTIONED_IN]->(related_case:Case)

            WHERE related_case.id <> source_case.id

            WITH
                source_case,
                related_case,
                collect(
                    DISTINCT {
                        entity_id: shared_entity.id,
                        entity_name: shared_entity.name,
                        entity_labels: labels(shared_entity)
                    }
                ) AS shared_entities

            RETURN
                source_case.id AS source_case,
                source_case.date AS source_date,
                related_case.id AS related_case,
                related_case.date AS related_date,
                shared_entities
            ORDER BY related_case.id
            """,
            case_id=case_id,
        )

        results = []

        for record in result:

            shared_entities = record["shared_entities"]

            reasons = []

            for entity in shared_entities:

                labels = entity["entity_labels"]

                if "Person" in labels:
                    reason_type = "Shared Person"

                elif "Organization" in labels:
                    reason_type = "Shared Organization"

                elif "Location" in labels:
                    reason_type = "Shared Location"

                else:
                    reason_type = "Shared Entity"

                reasons.append(
                    {
                        "type": reason_type,
                        "entity": entity["entity_name"],
                        "entity_id": entity["entity_id"],
                    }
                )

            results.append(
                {
                    "source_case": record["source_case"],
                    "source_date": record["source_date"],
                    "related_case": record["related_case"],
                    "related_date": record["related_date"],
                    "shared_entities": reasons,
                }
            )

        return results


def calculate_connection_score(
    shared_entities,
    source_date=None,
    related_date=None,
):
    """
    Calculate an explainable connection score.

    Entity weights:
        Person       = 35
        Organization = 30
        Location     = 20
        Other        = 10

    Temporal proximity:
        <= 30 days  = +15
        <= 90 days  = +10
        <= 180 days = +5
    """

    weights = {
        "Shared Person": 35,
        "Shared Organization": 30,
        "Shared Location": 20,
        "Shared Entity": 10,
    }

    score = 0
    used_types = set()

    for entity in shared_entities:

        entity_type = entity["type"]

        if entity_type not in used_types:

            score += weights.get(entity_type, 10)

            used_types.add(entity_type)

    temporal_score = calculate_temporal_score(
        source_date,
        related_date,
    )

    score += temporal_score

    return min(score, 100)


def analyze_case_connections(driver: Driver, case_id: str):
    """
    Return related cases with explainable connection scores.
    """

    related_cases = find_related_cases(
        driver,
        case_id,
    )

    analysis = []

    for relation in related_cases:

        temporal_score = calculate_temporal_score(
            relation["source_date"],
            relation["related_date"],
        )

        reasons = list(
            relation["shared_entities"]
        )

        if temporal_score > 0:

            days_apart = abs(
                (
                    date.fromisoformat(
                        relation["related_date"]
                    )
                    - date.fromisoformat(
                        relation["source_date"]
                    )
                ).days
            )

            reasons.append(
                {
                    "type": "Temporal Proximity",
                    "entity": (
                        f"Cases occurred "
                        f"{days_apart} days apart"
                    ),
                    "entity_id": None,
                }
            )

        score = calculate_connection_score(
            relation["shared_entities"],
            relation["source_date"],
            relation["related_date"],
        )

        analysis.append(
            {
                "source_case": relation["source_case"],
                "source_date": relation["source_date"],
                "related_case": relation["related_case"],
                "related_date": relation["related_date"],
                "connection_score": score,
                "reasons": reasons,
            }
        )

    analysis.sort(
        key=lambda item: item["connection_score"],
        reverse=True,
    )

    return analysis
def find_indirect_connections(driver: Driver, case_id: str):
    """
    Find indirect connections between the requested case
    and other cases.

    Maximum graph path length: 3 relationships.
    """

    with driver.session() as session:

        result = session.run(
            """
            MATCH (source_case:Case {id: $case_id})

            MATCH (source_entity)-[:MENTIONED_IN]->(source_case)

            MATCH path =
                (source_entity)-[*2..3]-(target_entity)

            MATCH (target_entity)-[:MENTIONED_IN]->(related_case:Case)

            WHERE related_case.id <> source_case.id

            RETURN DISTINCT
                source_case.id AS source_case,
                related_case.id AS related_case,
                source_entity.id AS source_entity_id,
                source_entity.name AS source_entity,
                target_entity.id AS target_entity_id,
                target_entity.name AS target_entity,
                length(path) AS path_length

            ORDER BY path_length ASC
            """,
            case_id=case_id,
        )

        connections = []

        for record in result:

            connections.append(
                {
                    "source_case": record["source_case"],
                    "related_case": record["related_case"],
                    "source_entity_id": record[
                        "source_entity_id"
                    ],
                    "source_entity": record[
                        "source_entity"
                    ],
                    "target_entity_id": record[
                        "target_entity_id"
                    ],
                    "target_entity": record[
                        "target_entity"
                    ],
                    "path_length": record[
                        "path_length"
                    ],
                }
            )

        return connections 
def calculate_indirect_score(path_length):
    """
    Score an indirect connection based on
    graph distance.
    """

    if path_length == 1:
        return 20

    if path_length == 2:
        return 15

    if path_length == 3:
        return 10

    return 0
def analyze_indirect_connections(
    driver: Driver,
    case_id: str,
):
    """
    Return explainable indirect case connections.
    """

    connections = find_indirect_connections(
        driver,
        case_id,
    )

    if not connections:
        return []

    analysis = []

    seen = set()

    for connection in connections:

        key = (
            connection["related_case"],
            connection["source_entity_id"],
            connection["target_entity_id"],
        )

        if key in seen:
            continue

        seen.add(key)

        score = calculate_indirect_score(
            connection["path_length"]
        )

        analysis.append(
            {
                "source_case": connection[
                    "source_case"
                ],
                "related_case": connection[
                    "related_case"
                ],
                "connection_score": score,
                "source_entity": connection[
                    "source_entity"
                ],
                "target_entity": connection[
                    "target_entity"
                ],
                "path_length": connection[
                    "path_length"
                ],
                "reason": (
                    "Indirect graph connection "
                    f"of {connection['path_length']} "
                    "relationships"
                ),
            }
        )

    analysis.sort(
        key=lambda item: item["connection_score"],
        reverse=True,
    )

    return analysis