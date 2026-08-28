import re


def normalize_entity(text: str, label: str):
    """
    Convert an extracted entity into a canonical form.
    """

    normalized = text.strip().lower()

    # Remove punctuation
    normalized = re.sub(r"[^a-z0-9\s]", " ", normalized)

    # Remove extra spaces
    normalized = re.sub(r"\s+", " ", normalized).strip()

    # Create canonical ID
    canonical_id = normalized.replace(" ", "_")

    return {
        "original": text,
        "canonical_name": normalized,
        "canonical_id": canonical_id,
        "entity_type": label
    }


def resolve_entities(entities: list):

    resolved = []

    seen = {}

    for entity in entities:

        result = normalize_entity(
            entity["text"],
            entity["label"]
        )

        key = (
            result["canonical_id"],
            result["entity_type"]
        )

        if key not in seen:

            seen[key] = result
            resolved.append(result)

    return resolved