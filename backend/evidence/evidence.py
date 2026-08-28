from datetime import datetime, timezone


def create_evidence(
    case_id: str,
    source: str,
    page: int,
    text: str,
    confidence: float
):
    """
    Create a traceable evidence record.
    """

    return {
        "evidence_id": f"EVID-{case_id}-{page}",
        "case_id": case_id,
        "source": source,
        "page": page,
        "text": text,
        "confidence": confidence,
        "extracted_at": datetime.now(timezone.utc).isoformat()
    }