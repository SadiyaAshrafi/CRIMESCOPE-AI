from neo4j import Driver


def get_network_dna(driver: Driver):
    """
    Calculate high-level statistics describing
    the CrimeScope network.
    """

    with driver.session() as session:

        # ---------------------------------------------
        # TOTAL ENTITIES
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (n)
            WHERE NOT n:Case AND NOT n:Evidence
            RETURN count(n) AS total_entities
            """
        )

        total_entities = result.single()["total_entities"]

        # ---------------------------------------------
        # TOTAL RELATIONSHIPS
        # ---------------------------------------------

        result = session.run(
            """
            MATCH ()-[r]->()
            RETURN count(r) AS total_relationships
            """
        )

        total_relationships = result.single()[
            "total_relationships"
        ]

        # ---------------------------------------------
        # CASES
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (c:Case)
            RETURN count(c) AS total_cases
            """
        )

        total_cases = result.single()["total_cases"]

        # ---------------------------------------------
        # ORGANIZATIONS
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (o:Organization)
            RETURN count(o) AS total_organizations
            """
        )

        total_organizations = result.single()[
            "total_organizations"
        ]

        # ---------------------------------------------
        # LOCATIONS
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (l:Location)
            RETURN count(l) AS total_locations
            """
        )

        total_locations = result.single()[
            "total_locations"
        ]

        # ---------------------------------------------
        # CROSS-CASE LINKS
        # ---------------------------------------------
        #
        # Count entity pairs that appear in more
        # than one case.
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (entity)-[:MENTIONED_IN]->(c:Case)

            WITH entity, count(DISTINCT c) AS case_count

            WHERE case_count > 1

            RETURN count(entity) AS cross_case_entities
            """
        )

        cross_case_entities = result.single()[
            "cross_case_entities"
        ]

        # ---------------------------------------------
        # MOST CONNECTED ENTITIES
        # ---------------------------------------------

        result = session.run(
            """
            MATCH (entity)
            WHERE NOT entity:Case
              AND NOT entity:Evidence

            OPTIONAL MATCH (entity)-[r]-()

            WITH
                entity,
                count(r) AS connection_count

            RETURN
                entity.id AS id,
                entity.name AS name,
                labels(entity) AS labels,
                connection_count

            ORDER BY connection_count DESC
            LIMIT 10
            """
        )

        most_connected_entities = []

        for record in result:

            most_connected_entities.append(
                {
                    "id": record["id"],
                    "name": record["name"],
                    "labels": record["labels"],
                    "connection_count": record[
                        "connection_count"
                    ],
                }
            )

        return {
            "total_entities": total_entities,
            "total_relationships": total_relationships,
            "total_cases": total_cases,
            "total_organizations": total_organizations,
            "total_locations": total_locations,
            "cross_case_entities": cross_case_entities,
            "most_connected_entities": (
                most_connected_entities
            ),
        }