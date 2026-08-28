from fastapi import APIRouter, HTTPException, Query

from database.connection import driver

from graph.queries import (
    get_case,
    get_entity_connections,
    get_case_network,
    get_full_graph,
)

from intelligence.cross_case import (
    analyze_case_connections,
    analyze_indirect_connections,
)

from intelligence.network_dna import (
    get_network_dna,
)

from intelligence.network_evolution import (
    compare_snapshots,
)


router = APIRouter()


# ============================================================
# HEALTH
# ============================================================

@router.get("/health")
def health():
    return {
        "system": "CRIMESCOPE AI",
        "module": "Graph + Criminal Network Intelligence Engine",
        "status": "running",
    }


# ============================================================
# CASES
# ============================================================

@router.get("/cases/{case_id}")
def case_details(case_id: str):
    result = get_case(driver, case_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Case {case_id} not found",
        )

    return result


@router.get("/cases/{case_id}/network")
def case_network(case_id: str):
    result = get_case_network(driver, case_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Case {case_id} not found",
        )

    return result


# ============================================================
# CASE INTELLIGENCE
# ============================================================

@router.get("/cases/{case_id}/related")
def related_cases(case_id: str):
    return {
        "case_id": case_id,
        "connections": analyze_case_connections(
            driver,
            case_id,
        ),
    }


@router.get("/cases/{case_id}/indirect")
def indirect_connections(case_id: str):
    return {
        "case_id": case_id,
        "connections": analyze_indirect_connections(
            driver,
            case_id,
        ),
    }


# ============================================================
# ENTITY
# ============================================================

@router.get("/entities/{entity_id}")
def entity_connections(entity_id: str):
    connections = get_entity_connections(
        driver,
        entity_id,
    )

    return {
        "entity_id": entity_id,
        "connections": connections,
    }


# ============================================================
# NETWORK DNA
# ============================================================

@router.get("/graph")
def full_graph():
    return get_full_graph(driver)

@router.get("/network/dna")
def network_dna():
    return get_network_dna(driver)


# ============================================================
# NETWORK EVOLUTION
# ============================================================

@router.get("/network/evolution")
def network_evolution(
    from_date: str = Query(...),
    to_date: str = Query(...),
):
    return compare_snapshots(
        driver,
        from_date,
        to_date,
    )