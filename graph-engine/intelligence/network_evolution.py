from neo4j import Driver


def get_network_snapshot(driver: Driver, end_date: str):
    """
    Return the state of the network up to a given date.

    Case dates are stored as strings in YYYY-MM-DD format.
    """

    with driver.session() as session:

        # ==================================================
        # ENTITIES
        # ==================================================

        result = session.run(
            """
            MATCH (entity)-[:MENTIONED_IN]->(case:Case)
            WHERE case.date <= $end_date

            RETURN DISTINCT
                entity.id AS entity_id,
                entity.name AS entity_name,
                labels(entity) AS entity_labels
            ORDER BY entity_name
            """,
            end_date=end_date,
        )

        entities = []

        for record in result:

            entities.append(
                {
                    "id": record["entity_id"],
                    "name": record["entity_name"],
                    "labels": record["entity_labels"],
                }
            )

        # ==================================================
        # CASES
        # ==================================================

        result = session.run(
            """
            MATCH (case:Case)
            WHERE case.date <= $end_date

            RETURN
                case.id AS case_id,
                case.date AS case_date
            ORDER BY case.date
            """,
            end_date=end_date,
        )

        cases = []

        for record in result:

            cases.append(
                {
                    "id": record["case_id"],
                    "date": record["case_date"],
                }
            )

        # ==================================================
        # INVESTIGATIVE RELATIONSHIPS
        # ==================================================
        #
        # IMPORTANT:
        # MENTIONED_IN is case-membership metadata.
        # We don't count it as a criminal-network
        # relationship here.
        # ==================================================

        result = session.run(
            """
            MATCH (source)-[r]->(target)

            WHERE type(r) <> 'MENTIONED_IN'

            MATCH (source)-[:MENTIONED_IN]->(case:Case)

            WHERE case.date <= $end_date

            RETURN DISTINCT
                source.id AS source_id,
                source.name AS source_name,
                type(r) AS relationship_type,
                target.id AS target_id,
                target.name AS target_name
            ORDER BY source_name
            """,
            end_date=end_date,
        )

        relationships = []

        for record in result:

            relationships.append(
                {
                    "source_id": record["source_id"],
                    "source_name": record["source_name"],
                    "relationship": record[
                        "relationship_type"
                    ],
                    "target_id": record["target_id"],
                    "target_name": record["target_name"],
                }
            )

        return {
            "snapshot_date": end_date,
            "entities": entities,
            "cases": cases,
            "relationships": relationships,
        }


def compare_snapshots(
    driver: Driver,
    earlier_date: str,
    later_date: str,
):
    """
    Compare two network snapshots.

    Detects:
        - new entities
        - new cases
        - new relationships
        - removed entities
        - removed relationships
    """

    earlier = get_network_snapshot(
        driver,
        earlier_date,
    )

    later = get_network_snapshot(
        driver,
        later_date,
    )

    # ==================================================
    # ENTITY COMPARISON
    # ==================================================

    earlier_entity_ids = {
        entity["id"]
        for entity in earlier["entities"]
    }

    later_entity_ids = {
        entity["id"]
        for entity in later["entities"]
    }

    new_entity_ids = (
        later_entity_ids - earlier_entity_ids
    )

    removed_entity_ids = (
        earlier_entity_ids - later_entity_ids
    )

    new_entities = [
        entity
        for entity in later["entities"]
        if entity["id"] in new_entity_ids
    ]

    removed_entities = [
        entity
        for entity in earlier["entities"]
        if entity["id"] in removed_entity_ids
    ]

    # ==================================================
    # CASE COMPARISON
    # ==================================================

    earlier_case_ids = {
        case["id"]
        for case in earlier["cases"]
    }

    later_case_ids = {
        case["id"]
        for case in later["cases"]
    }

    new_case_ids = (
        later_case_ids - earlier_case_ids
    )

    removed_case_ids = (
        earlier_case_ids - later_case_ids
    )

    new_cases = [
        case
        for case in later["cases"]
        if case["id"] in new_case_ids
    ]

    removed_cases = [
        case
        for case in earlier["cases"]
        if case["id"] in removed_case_ids
    ]

    # ==================================================
    # RELATIONSHIP COMPARISON
    # ==================================================

    def relationship_key(rel):

        return (
            rel["source_id"],
            rel["relationship"],
            rel["target_id"],
        )

    earlier_relationships = {
        relationship_key(rel)
        for rel in earlier["relationships"]
    }

    later_relationships = {
        relationship_key(rel)
        for rel in later["relationships"]
    }

    new_relationship_keys = (
        later_relationships
        - earlier_relationships
    )

    removed_relationship_keys = (
        earlier_relationships
        - later_relationships
    )

    new_relationships = [
        rel
        for rel in later["relationships"]
        if relationship_key(rel)
        in new_relationship_keys
    ]

    removed_relationships = [
        rel
        for rel in earlier["relationships"]
        if relationship_key(rel)
        in removed_relationship_keys
    ]

    # ==================================================
    # FINAL RESULT
    # ==================================================

    return {

        "earlier_date": earlier_date,
        "later_date": later_date,

        # ------------------------------
        # ENTITIES
        # ------------------------------

        "earlier_entity_count": len(
            earlier["entities"]
        ),

        "later_entity_count": len(
            later["entities"]
        ),

        "new_entity_count": len(
            new_entities
        ),

        "new_entities": new_entities,

        "removed_entity_count": len(
            removed_entities
        ),

        "removed_entities": removed_entities,

        # ------------------------------
        # CASES
        # ------------------------------

        "earlier_case_count": len(
            earlier["cases"]
        ),

        "later_case_count": len(
            later["cases"]
        ),

        "new_case_count": len(
            new_cases
        ),

        "new_cases": new_cases,

        "removed_case_count": len(
            removed_cases
        ),

        "removed_cases": removed_cases,

        # ------------------------------
        # RELATIONSHIPS
        # ------------------------------

        "earlier_relationship_count": len(
            earlier["relationships"]
        ),

        "later_relationship_count": len(
            later["relationships"]
        ),

        "new_relationship_count": len(
            new_relationships
        ),

        "new_relationships": new_relationships,

        "removed_relationship_count": len(
            removed_relationships
        ),

        "removed_relationships": removed_relationships,
    }