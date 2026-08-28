from neo4j import Driver


def get_case(driver: Driver, case_id: str):
    """
    Get a single case by its ID.
    """

    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Case {id: $case_id})
            RETURN c
            """,
            case_id=case_id,
        )

        record = result.single()

        if not record:
            return None

        return dict(record["c"])


def get_entity_connections(driver: Driver, entity_id: str):
    """
    Get all direct connections of an entity.
    """

    with driver.session() as session:
        result = session.run(
            """
            MATCH (e {id: $entity_id})-[r]-(connected)
            RETURN
                labels(e) AS source_labels,
                e.id AS source_id,
                type(r) AS relationship,
                labels(connected) AS target_labels,
                connected.id AS target_id
            """,
            entity_id=entity_id,
        )

        return [record.data() for record in result]


def get_case_network(driver: Driver, case_id: str):
    """
    Get all entities associated with a case.
    """

    with driver.session() as session:
        result = session.run(
            """
            MATCH (c:Case {id: $case_id})
            OPTIONAL MATCH (entity)-[:MENTIONED_IN]->(c)

            RETURN
                c.id AS case_id,
                collect(
                    DISTINCT {
                        id: entity.id,
                        labels: labels(entity),
                        name: entity.name
                    }
                ) AS entities
            """,
            case_id=case_id,
        )

        record = result.single()

        if not record:
            return None

        return record.data()
def get_full_graph(driver: Driver):
    """
    Return the complete CrimeScope graph
    in a frontend-friendly nodes + edges format.
    """

    with driver.session() as session:

        # ---------------------------------------------
        # NODES
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (n)
            WHERE NOT n:Evidence
            RETURN
                n.id AS id,
                n.name AS name,
                labels(n) AS labels
            ORDER BY n.name
            """
        )

        nodes = []

        for record in result:
            labels = record["labels"]

            # Remove Case label from type selection
            entity_labels = [
                label for label in labels
                if label != "Case"
            ]

            node_type = (
                entity_labels[0]
                if entity_labels
                else "Case"
            )

            nodes.append(
                {
                    "id": record["id"],
                    "label": record["name"],
                    "type": node_type,
                }
            )

        # ---------------------------------------------
        # EDGES
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (source)-[r]->(target)
            WHERE type(r) <> 'MENTIONED_IN'
              AND NOT source:Evidence
              AND NOT target:Evidence
            RETURN
                source.id AS source_id,
                target.id AS target_id,
                type(r) AS relationship
            ORDER BY source.id
            """
        )

        edges = []

        for record in result:
            source_id = record["source_id"]
            target_id = record["target_id"]
            relationship = record["relationship"]

            edges.append(
                {
                    "id": (
                        f"{source_id}_"
                        f"{relationship}_"
                        f"{target_id}"
                    ),
                    "source": source_id,
                    "target": target_id,
                    "relationship": relationship,
                }
            )

        return {
            "nodes": nodes,
            "edges": edges,
        }