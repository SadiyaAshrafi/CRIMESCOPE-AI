from database.connection import driver


def seed_database():
    with driver.session() as session:

        # --------------------------------------------------
        # CASES
        # --------------------------------------------------

        cases = [
            {
                "id": "CASE-101",
                "title": "Logistics Investigation",
                "date": "2026-03-15",
                "location": "Bengaluru",
                "description": (
                    "Person A was associated with Organization X "
                    "during an investigation in Bengaluru."
                ),
            },
            {
                "id": "CASE-102",
                "title": "Financial Investigation",
                "date": "2026-04-21",
                "location": "Mysuru",
                "description": (
                    "Person B was associated with Organization X "
                    "and investigators identified a connection to Person A."
                ),
            },
            {
                "id": "CASE-103",
                "title": "Network Investigation",
                "date": "2026-05-10",
                "location": "Bengaluru",
                "description": (
                    "Person A and Person B were identified in records "
                    "associated with Organization X."
                ),
            },
            {
                "id": "CASE-104",
                "title": "Transport Investigation",
                "date": "2026-06-02",
                "location": "Tumakuru",
                "description": (
                    "Organization X was referenced in connection "
                    "with Person C and Location Y."
                ),
            },
            {
                "id": "CASE-105",
                "title": "Regional Investigation",
                "date": "2026-06-20",
                "location": "Bengaluru",
                "description": (
                    "Person C appeared in records connected to "
                    "Person A and Organization X."
                ),
            },
        ]

        for case in cases:
            session.run(
                """
                MERGE (c:Case {id: $id})
                SET c.title = $title,
                    c.date = $date,
                    c.location = $location,
                    c.description = $description
                """,
                **case,
            )

        # --------------------------------------------------
        # PEOPLE
        # --------------------------------------------------

        people = [
            ("person_a", "Person A"),
            ("person_b", "Person B"),
            ("person_c", "Person C"),
        ]

        for entity_id, name in people:
            session.run(
                """
                MERGE (p:Person {id: $id})
                SET p.name = $name
                """,
                id=entity_id,
                name=name,
            )

        # --------------------------------------------------
        # ORGANIZATION
        # --------------------------------------------------

        session.run(
            """
            MERGE (o:Organization {id: "organization_x"})
            SET o.name = "Organization X"
            """
        )

        # --------------------------------------------------
        # LOCATIONS
        # --------------------------------------------------

        locations = [
            ("bengaluru", "Bengaluru"),
            ("mysuru", "Mysuru"),
            ("tumakuru", "Tumakuru"),
            ("location_y", "Location Y"),
            ("location_z", "Location Z"),
        ]

        for entity_id, name in locations:
            session.run(
                """
                MERGE (l:Location {id: $id})
                SET l.name = $name
                """,
                id=entity_id,
                name=name,
            )

        # --------------------------------------------------
        # ENTITY → CASE CONNECTIONS
        # --------------------------------------------------

        case_entities = {
            "CASE-101": [
                "person_a",
                "organization_x",
                "bengaluru",
                "location_y",
            ],
            "CASE-102": [
                "person_b",
                "organization_x",
                "mysuru",
                "location_z",
                "person_a",
            ],
            "CASE-103": [
                "person_a",
                "person_b",
                "organization_x",
                "bengaluru",
                "location_y",
            ],
            "CASE-104": [
                "organization_x",
                "person_c",
                "tumakuru",
                "location_y",
            ],
            "CASE-105": [
                "person_c",
                "person_a",
                "organization_x",
                "bengaluru",
                "location_y",
            ],
        }

        for case_id, entity_ids in case_entities.items():
            for entity_id in entity_ids:

                session.run(
                    """
                    MATCH (c:Case {id: $case_id})
                    MATCH (e {id: $entity_id})
                    MERGE (e)-[:MENTIONED_IN]->(c)
                    """,
                    case_id=case_id,
                    entity_id=entity_id,
                )

        # --------------------------------------------------
        # REALISTIC RELATIONSHIPS
        # --------------------------------------------------

        relationships = [
            (
                "person_a",
                "organization_x",
                "ASSOCIATED_WITH",
                0.91,
                "CASE-101",
            ),
            (
                "person_b",
                "organization_x",
                "ASSOCIATED_WITH",
                0.88,
                "CASE-102",
            ),
            (
                "person_a",
                "person_b",
                "CONNECTED_TO",
                0.84,
                "CASE-102",
            ),
            (
                "person_a",
                "organization_x",
                "ASSOCIATED_WITH",
                0.93,
                "CASE-103",
            ),
            (
                "person_b",
                "organization_x",
                "ASSOCIATED_WITH",
                0.89,
                "CASE-103",
            ),
            (
                "person_c",
                "organization_x",
                "ASSOCIATED_WITH",
                0.86,
                "CASE-104",
            ),
            (
                "person_c",
                "person_a",
                "CONNECTED_TO",
                0.82,
                "CASE-105",
            ),
        ]

        for (
            source_id,
            target_id,
            relationship_type,
            confidence,
            case_id,
        ) in relationships:

            query = f"""
                MATCH (s {{id: $source_id}})
                MATCH (t {{id: $target_id}})
                MERGE (s)-[r:{relationship_type}]->(t)
                SET r.confidence = $confidence,
                    r.case_id = $case_id
            """

            session.run(
                query,
                source_id=source_id,
                target_id=target_id,
                confidence=confidence,
                case_id=case_id,
            )

        # --------------------------------------------------
        # EVIDENCE
        # --------------------------------------------------

        evidence = [
            {
                "id": "EVID-CASE-101-4",
                "case_id": "CASE-101",
                "source": "case_101.txt",
                "page": 4,
                "text": (
                    "Person A was associated with Organization X "
                    "in Bengaluru."
                ),
                "confidence": 0.91,
            },
            {
                "id": "EVID-CASE-102-2",
                "case_id": "CASE-102",
                "source": "case_102.txt",
                "page": 2,
                "text": (
                    "Person B was associated with Organization X "
                    "and connected to Person A."
                ),
                "confidence": 0.88,
            },
            {
                "id": "EVID-CASE-103-7",
                "case_id": "CASE-103",
                "source": "case_103.txt",
                "page": 7,
                "text": (
                    "Person A and Person B were identified in "
                    "records associated with Organization X."
                ),
                "confidence": 0.93,
            },
        ]

        for item in evidence:
            session.run(
                """
                MERGE (e:Evidence {id: $id})
                SET e.case_id = $case_id,
                    e.source = $source,
                    e.page = $page,
                    e.text = $text,
                    e.confidence = $confidence

                WITH e

                MATCH (c:Case {id: $case_id})
                MERGE (c)-[:SUPPORTED_BY]->(e)
                """,
                **item,
            )

    print("CrimeGraph seed data imported successfully.")


if __name__ == "__main__":
    try:
        seed_database()
    finally:
        driver.close()