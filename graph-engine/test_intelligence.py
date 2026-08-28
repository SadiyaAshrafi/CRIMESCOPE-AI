from database.connection import driver
from intelligence.cross_case import analyze_case_connections


def main():

    results = analyze_case_connections(
        driver,
        "CASE-101",
    )

    for result in results:

        print("\n==============================")
        print(
            f"{result['source_case']} → "
            f"{result['related_case']}"
        )
        print(
            f"Connection Score: "
            f"{result['connection_score']}/100"
        )

        print("WHY?")

        for reason in result["reasons"]:
            print(
                f"  ✓ {reason['type']}: "
                f"{reason['entity']}"
            )


if __name__ == "__main__":

    try:
        main()

    finally:
        driver.close()