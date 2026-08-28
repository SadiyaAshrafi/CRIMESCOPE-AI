from database.connection import driver
from intelligence.network_dna import get_network_dna


def main():

    dna = get_network_dna(driver)

    print()
    print("======================================")
    print("CRIMESCOPE AI — NETWORK DNA")
    print("======================================")

    print(
        f"Entities: "
        f"{dna['total_entities']}"
    )

    print(
        f"Relationships: "
        f"{dna['total_relationships']}"
    )

    print(
        f"Cases: "
        f"{dna['total_cases']}"
    )

    print(
        f"Organizations: "
        f"{dna['total_organizations']}"
    )

    print(
        f"Locations: "
        f"{dna['total_locations']}"
    )

    print(
        f"Cross-case entities: "
        f"{dna['cross_case_entities']}"
    )

    print()
    print("TOP CONNECTED ENTITIES")
    print("--------------------------------------")

    for entity in dna["most_connected_entities"]:

        print(
            f"{entity['name']} "
            f"({', '.join(entity['labels'])}) "
            f"→ "
            f"{entity['connection_count']} connections"
        )


if __name__ == "__main__":

    try:
        main()

    finally:
        driver.close()