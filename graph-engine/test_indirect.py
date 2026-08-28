from database.connection import driver
from intelligence.cross_case import (
    analyze_indirect_connections,
)


def main():

    results = analyze_indirect_connections(
        driver,
        "CASE-101",
    )

    print("\n")
    print("======================================")
    print("INDIRECT CASE CONNECTIONS")
    print("======================================")

    for result in results:

        print("\n--------------------------------------")

        print(
            f"{result['source_case']} → "
            f"{result['related_case']}"
        )

        print(
            f"Connection Score: "
            f"{result['connection_score']}/100"
        )

        print(
            f"Path: "
            f"{result['source_entity']} → "
            f"{result['target_entity']}"
        )

        print(
            f"Distance: "
            f"{result['path_length']} relationships"
        )

        print(
            f"WHY?\n  ✓ "
            f"{result['reason']}"
        )


if __name__ == "__main__":

    try:
        main()

    finally:
        driver.close()