from neo4j import Driver


CONSTRAINTS = [
    """
    CREATE CONSTRAINT person_id_unique IF NOT EXISTS
    FOR (p:Person)
    REQUIRE p.id IS UNIQUE
    """,

    """
    CREATE CONSTRAINT organization_id_unique IF NOT EXISTS
    FOR (o:Organization)
    REQUIRE o.id IS UNIQUE
    """,

    """
    CREATE CONSTRAINT location_id_unique IF NOT EXISTS
    FOR (l:Location)
    REQUIRE l.id IS UNIQUE
    """,

    """
    CREATE CONSTRAINT case_id_unique IF NOT EXISTS
    FOR (c:Case)
    REQUIRE c.id IS UNIQUE
    """,

    """
    CREATE CONSTRAINT event_id_unique IF NOT EXISTS
    FOR (e:Event)
    REQUIRE e.id IS UNIQUE
    """,

    """
    CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS
    FOR (e:Evidence)
    REQUIRE e.id IS UNIQUE
    """,
]


def create_schema(driver: Driver):
    with driver.session() as session:
        for constraint in CONSTRAINTS:
            session.run(constraint)

    print("CrimeGraph schema created successfully.")