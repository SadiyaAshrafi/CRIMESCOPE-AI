from database.connection import driver
from intelligence.network_evolution import (
    compare_snapshots,
)


def main():

    result = compare_snapshots(
        driver,
        "2026-04-01",
        "2026-06-30",
    )

    print()
    print("======================================")
    print("CRIMESCOPE AI — NETWORK EVOLUTION")
    print("======================================")

    print(
        f"Period: "
        f"{result['earlier_date']} → "
        f"{result['later_date']}"
    )

    print()

    print(
        f"Entities: "
        f"{result['earlier_entity_count']} → "
        f"{result['later_entity_count']}"
    )

    print(
        f"New entities: "
        f"+{result['new_entity_count']}"
    )

    print()

    print(
        f"Cases: "
        f"{result['earlier_case_count']} → "
        f"{result['later_case_count']}"
    )

    print(
        f"New cases: "
        f"+{result['new_case_count']}"
    )

    print()

    print(
        f"Relationships: "
        f"{result['earlier_relationship_count']} → "
        f"{result['later_relationship_count']}"
    )

    print(
        f"New relationships: "
        f"+{result['new_relationship_count']}"
    )

    print()

    print("NEW ENTITIES")
    print("--------------------------------------")

    for entity in result["new_entities"]:

        print(
            f"✓ {entity['name']} "
            f"({', '.join(entity['labels'])})"
        )

    print()

    print("NEW RELATIONSHIPS")
    print("--------------------------------------")

    for relationship in result[
        "new_relationships"
    ]:

        print(
            f"✓ {relationship['source_name']} "
            f"→ {relationship['relationship']} → "
            f"{relationship['target_name']}"
        )


if __name__ == "__main__":

    try:
        main()

    finally:
        driver.close()