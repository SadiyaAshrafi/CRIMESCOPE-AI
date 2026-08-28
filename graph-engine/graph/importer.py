from neo4j import Driver


def import_case(driver: Driver, data: dict):
    case_id = data["case_id"]

    with driver.session() as session:

        # --------------------------------------------------
        # 1. CASE
        # --------------------------------------------------
        session.run(
            """
            MERGE (c:Case {id: $case_id})
            SET c.title = $title,
                c.date = $date,
                c.location = $location,
                c.description = $description
            """,
            case_id=case_id,
            title=data.get("title"),
            date=data.get("date"),
            location=data.get("location"),
            description=data.get("description"),
        )

        # --------------------------------------------------
        # 2. RESOLVED ENTITIES
        # --------------------------------------------------
        for entity in data.get("resolved_entities", []):
            canonical_id = entity["canonical_id"]
            entity_type = entity["entity_type"]
            canonical_name = entity["canonical_name"]
            original = entity["original"]

            if entity_type == "PERSON":
                label = "Person"

            elif entity_type == "ORGANIZATION":
                label = "Organization"

            elif entity_type == "LOCATION":
                label = "Location"

            else:
                continue

            query = f"""
                MERGE (e:{label} {{id: $id}})
                SET e.name = $canonical_name,
                    e.original_name = $original
            """

            session.run(
                query,
                id=canonical_id,
                canonical_name=canonical_name,
                original=original,
            )

            # Connect entity to case
            session.run(
                f"""
                MATCH (e:{label} {{id: $id}})
                MATCH (c:Case {{id: $case_id}})
                MERGE (e)-[:MENTIONED_IN]->(c)
                """,
                id=canonical_id,
                case_id=case_id,
            )

        # --------------------------------------------------
        # 3. RELATIONSHIPS
        # --------------------------------------------------
        for relationship in data.get("relationships", []):

            source_name = relationship["source"]
            target_name = relationship["target"]
            relationship_type = relationship["relationship"]

            source = next(
                (
                    e
                    for e in data.get("resolved_entities", [])
                    if e["original"] == source_name
                ),
                None,
            )

            target = next(
                (
                    e
                    for e in data.get("resolved_entities", [])
                    if e["original"] == target_name
                ),
                None,
            )

            if not source or not target:
                continue

            source_id = source["canonical_id"]
            target_id = target["canonical_id"]

            source_label = {
                "PERSON": "Person",
                "ORGANIZATION": "Organization",
                "LOCATION": "Location",
            }.get(source["entity_type"])

            target_label = {
                "PERSON": "Person",
                "ORGANIZATION": "Organization",
                "LOCATION": "Location",
            }.get(target["entity_type"])

            if not source_label or not target_label:
                continue

            query = f"""
                MATCH (s:{source_label} {{id: $source_id}})
                MATCH (t:{target_label} {{id: $target_id}})
                MERGE (s)-[r:{relationship_type}]->(t)
                SET r.confidence = $confidence,
                    r.case_id = $case_id
            """

            session.run(
                query,
                source_id=source_id,
                target_id=target_id,
                confidence=relationship.get("confidence"),
                case_id=case_id,
            )

        # --------------------------------------------------
        # 4. EVIDENCE
        # --------------------------------------------------
        for evidence in data.get("evidence", []):

            session.run(
                """
                MERGE (ev:Evidence {id: $evidence_id})
                SET ev.case_id = $case_id,
                    ev.source = $source,
                    ev.page = $page,
                    ev.text = $text,
                    ev.confidence = $confidence,
                    ev.extracted_at = $extracted_at

                WITH ev

                MATCH (c:Case {id: $case_id})
                MERGE (c)-[:SUPPORTED_BY]->(ev)
                """,
                evidence_id=evidence["evidence_id"],
                case_id=evidence["case_id"],
                source=evidence.get("source"),
                page=evidence.get("page"),
                text=evidence.get("text"),
                confidence=evidence.get("confidence"),
                extracted_at=evidence.get("extracted_at"),
            )

    print(f"Imported {case_id} successfully.")