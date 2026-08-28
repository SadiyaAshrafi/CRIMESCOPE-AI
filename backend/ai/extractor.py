import re
import spacy

nlp = spacy.load("en_core_web_sm")


CUSTOM_PATTERNS = {
    "PERSON": r"\bPerson\s+[A-Z]\b",
    "ORGANIZATION": r"\bOrganization\s+[A-Z]\b",
    "LOCATION": r"\bLocation\s+[A-Z]\b",
    "CASE": r"\bCASE-\d{3}\b"
}


def extract_custom_entities(text: str):

    entities = []

    for entity_type, pattern in CUSTOM_PATTERNS.items():

        for match in re.finditer(pattern, text):

            entities.append({
                "text": match.group(),
                "label": entity_type,
                "start": match.start(),
                "end": match.end(),
                "source": "CRIMESCOPE_RULE"
            })

    return entities


def extract_entities(text: str):

    doc = nlp(text)

    entities = []

    # Standard spaCy entities
    for ent in doc.ents:

        # Ignore dates here because dates are handled separately
        if ent.label_ == "DATE":
            continue

        entities.append({
            "text": ent.text.strip(),
            "label": ent.label_,
            "start": ent.start_char,
            "end": ent.end_char,
            "source": "SPACY"
        })

    # Custom CRIMESCOPE entities
    entities.extend(
        extract_custom_entities(text)
    )

    # Remove duplicate entities
    unique_entities = {}

    for entity in entities:

        key = (
            entity["text"].lower().strip(),
            entity["start"],
            entity["end"]
        )

        unique_entities[key] = entity

    return list(unique_entities.values())


def extract_dates(text: str):

    doc = nlp(text)

    dates = []

    for ent in doc.ents:

        if ent.label_ == "DATE":
            dates.append(ent.text)

    return dates


def extract_relationships(text: str, entities: list):

    relationships = []

    lower_text = text.lower()

    persons = [
        e for e in entities
        if e["label"] == "PERSON"
    ]

    organizations = [
        e for e in entities
        if e["label"] == "ORGANIZATION"
    ]

    locations = [
        e for e in entities
        if e["label"] == "LOCATION"
    ]


    # =====================================================
    # ASSOCIATED_WITH
    # =====================================================

    if "associated with" in lower_text:

        for person in persons:

            for organization in organizations:

                relationships.append({
                    "source": person["text"],
                    "source_type": "PERSON",
                    "relationship": "ASSOCIATED_WITH",
                    "target": organization["text"],
                    "target_type": "ORGANIZATION",
                    "confidence": 0.91
                })


    # =====================================================
    # CONNECTED_TO
    # =====================================================

    if "connection to" in lower_text:

        for i, person_a in enumerate(persons):

            for person_b in persons[i + 1:]:

                if person_a["text"] != person_b["text"]:

                    relationships.append({
                        "source": person_a["text"],
                        "source_type": "PERSON",
                        "relationship": "CONNECTED_TO",
                        "target": person_b["text"],
                        "target_type": "PERSON",
                        "confidence": 0.82
                    })


    # =====================================================
    # ACTIVITY_AT
    # =====================================================

    if "activity involving" in lower_text:

        for person in persons:

            for location in locations:

                relationships.append({
                    "source": person["text"],
                    "source_type": "PERSON",
                    "relationship": "ACTIVITY_AT",
                    "target": location["text"],
                    "target_type": "LOCATION",
                    "confidence": 0.78
                })


    # =====================================================
    # REMOVE DUPLICATE RELATIONSHIPS
    # =====================================================

    unique_relationships = {}

    for relationship in relationships:

        key = (
            relationship["source"],
            relationship["relationship"],
            relationship["target"]
        )

        unique_relationships[key] = relationship

    return list(unique_relationships.values())