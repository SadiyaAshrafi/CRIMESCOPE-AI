import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  GitBranch,
  Users,
  CalendarDays,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetworkGraph from "../components/NetworkGraph";
import EvidencePanel from "../components/EvidencePanel";

import { getIntegrationData } from "../services/api";

function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [integrationData, setIntegrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  /*
   * =========================================================
   * LOAD REAL BACKEND DATA
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const data = await getIntegrationData();

        if (mounted) {
          setIntegrationData(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load investigation data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * BACKEND DATA
   * =========================================================
   */

  const entities = integrationData?.entities ?? [];
  const relationships = integrationData?.relationships ?? [];
  const cases = integrationData?.cases ?? [];
  const evidence = integrationData?.evidence ?? [];

  /*
   * =========================================================
   * CURRENT CASE
   * =========================================================
   */

  const caseData = useMemo(() => {
    if (!caseId) {
      return null;
    }

    return (
      cases.find(
        (item) => item.case_id === caseId
      ) || null
    );
  }, [cases, caseId]);

  /*
   * =========================================================
   * CASE ENTITY IDS
   * =========================================================
   */

  const caseEntityIds = useMemo(() => {
    if (!caseData) {
      return new Set();
    }

    return new Set(
      caseData.entity_ids ?? []
    );
  }, [caseData]);

  /*
   * =========================================================
   * CASE RELATIONSHIP IDS
   * =========================================================
   */

  const caseRelationshipIds = useMemo(() => {
    if (!caseData) {
      return new Set();
    }

    return new Set(
      caseData.relationship_ids ?? []
    );
  }, [caseData]);

  /*
   * =========================================================
   * ENTITY MAP
   * =========================================================
   */

  const entityMap = useMemo(() => {
    return new Map(
      entities.map((entity) => [
        entity.id || entity.canonical_id,
        entity,
      ])
    );
  }, [entities]);

  /*
   * =========================================================
   * CASE NODES
   * =========================================================
   */

  const graphNodes = useMemo(() => {
    if (!caseData) {
      return [];
    }

    return entities
      .filter((entity) => {
        const entityId =
          entity.id || entity.canonical_id;

        return caseEntityIds.has(entityId);
      })
      .map((entity) => ({
        id:
          entity.id ||
          entity.canonical_id,

        name:
          entity.name ||
          entity.canonical_name ||
          entity.id,

        type:
          entity.type ||
          entity.label ||
          "UNKNOWN",
      }));
  }, [entities, caseData, caseEntityIds]);

  /*
   * =========================================================
   * EVIDENCE MAP
   * =========================================================
   */

  const evidenceMap = useMemo(() => {
    return new Map(
      evidence.map((item) => [
        item.evidence_id,
        item,
      ])
    );
  }, [evidence]);

  /*
   * =========================================================
   * CASE EDGES
   * =========================================================
   */

  const graphEdges = useMemo(() => {
    if (!caseData) {
      return [];
    }

    return relationships
      .filter((relationship) => {
        /*
         * Primary filtering:
         * relationship ID belongs to this case.
         */
        if (
          caseRelationshipIds.has(
            relationship.id
          )
        ) {
          return true;
        }

        /*
         * Fallback filtering:
         * backend relationship contains case_id.
         */
        if (
          relationship.case_id &&
          relationship.case_id === caseId
        ) {
          return true;
        }

        return false;
      })
      .map((relationship) => {
        const sourceId =
          relationship.source_entity_id;

        const targetId =
          relationship.target_entity_id;

        const sourceEntity =
          entityMap.get(sourceId);

        const targetEntity =
          entityMap.get(targetId);

        const evidenceItem =
          relationship.evidence_id
            ? evidenceMap.get(
                relationship.evidence_id
              )
            : null;

        return {
          id: relationship.id,

          source: sourceId,

          target: targetId,

          type:
            relationship.relationship ||
            relationship.type ||
            "RELATED_TO",

          confidence:
            Number(
              relationship.confidence ?? 0
            ),

          evidenceId:
            relationship.evidence_id ||
            null,

          sourceDocument:
            evidenceItem?.source_document ||
            "—",

          pageNumber:
            evidenceItem?.page ??
            null,

          extractionTimestamp:
            relationship.timestamp ||
            evidenceItem?.extraction_timestamp ||
            "—",

          date:
            relationship.date ||
            null,

          sourceName:
            sourceEntity?.name ||
            relationship.source ||
            sourceId,

          targetName:
            targetEntity?.name ||
            relationship.target ||
            targetId,
        };
      });
  }, [
    relationships,
    caseData,
    caseRelationshipIds,
    caseId,
    entityMap,
    evidenceMap,
  ]);

  /*
   * =========================================================
   * CASE EVIDENCE
   * =========================================================
   */

  const caseEvidence = useMemo(() => {
    if (!caseData) {
      return [];
    }

    return evidence.filter(
      (item) =>
        item.case_id === caseId
    );
  }, [evidence, caseData, caseId]);

  /*
   * =========================================================
   * OPEN EVIDENCE
   * =========================================================
   */

  const openEvidence = (relationship) => {
    setSelectedEvidence({
      id: relationship.id,

      type: "RELATIONSHIP",

      source:
        relationship.sourceName,

      target:
        relationship.targetName,

      relationship:
        relationship.type,

      relationshipType:
        relationship.type,

      confidence:
        relationship.confidence,

      evidenceId:
        relationship.evidenceId,

      sourceDocument:
        relationship.sourceDocument,

      pageNumber:
        relationship.pageNumber,

      extractionTimestamp:
        relationship.extractionTimestamp,

      date:
        relationship.date,
    });
  };

  /*
   * =========================================================
   * GRAPH NODE SELECT
   * =========================================================
   */

  const handleNodeSelect = (item) => {
    if (!item) {
      return;
    }

    if (
      item.type === "RELATIONSHIP" ||
      item.evidenceId
    ) {
      setSelectedEvidence(item);
    }
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header />

          <section className="dashboard">
            <div className="panel case-not-found">
              <Loader2
                size={30}
                className="spin"
              />

              <h2>
                Loading Investigation
              </h2>

              <p>
                Fetching real investigation data
                from the intelligence backend...
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header />

          <section className="dashboard">
            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate("/cases")
              }
            >
              <ArrowLeft size={15} />
              Back to Cases
            </button>

            <div className="panel case-not-found">
              <div className="case-not-found-icon">
                <AlertTriangle size={24} />
              </div>

              <h2>
                Backend Connection Failed
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * CASE NOT FOUND
   * =========================================================
   */

  if (!caseData) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header />

          <section className="dashboard">
            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate("/cases")
              }
            >
              <ArrowLeft size={15} />
              Back to Cases
            </button>

            <div className="panel case-not-found">
              <div className="case-not-found-icon">
                <Folder size={24} />
              </div>

              <h2>
                Case Not Found
              </h2>

              <p>
                No investigation exists for case ID{" "}
                <strong>{caseId}</strong>.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  navigate("/cases")
                }
              >
                Return to Cases
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * CASE VALUES
   * =========================================================
   */

  const caseEntityCount =
    caseData.entity_ids?.length ??
    graphNodes.length;

  const caseRelationshipCount =
    caseData.relationship_ids?.length ??
    graphEdges.length;

  const caseDate =
    caseData.dates?.[0] ||
    caseData.date ||
    "—";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard case-details-page">

          {/* =================================================
              CASE HEADER
          ================================================= */}

          <div className="case-details-header">
            <div className="case-details-header-left">

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  navigate("/cases")
                }
              >
                <ArrowLeft size={15} />
                Back to Cases
              </button>

              <div className="case-title-block">

                <div className="case-details-icon">
                  <Folder size={22} />
                </div>

                <div className="case-title-content">

                  <div className="case-details-id">
                    {caseData.case_id}
                  </div>

                  <h1>
                    {caseData.title ||
                      caseData.name ||
                      "Investigation"}
                  </h1>

                  <p>
                    Investigation intelligence and
                    criminal network
                  </p>

                </div>
              </div>
            </div>

            <div className="case-details-status">
              <span className="case-status-dot" />
              ACTIVE
            </div>
          </div>

          {/* =================================================
              CASE DESCRIPTION
          ================================================= */}

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>
                  Investigation Overview
                </h2>

                <p>
                  Intelligence extracted from the
                  investigation dataset
                </p>
              </div>

            </div>

            <p>
              {caseData.description ||
                caseData.summary ||
                "No investigation description available."}
            </p>

          </div>

          {/* =================================================
              CASE STATS
          ================================================= */}

          <div className="stats-grid case-stats-grid">

            <div className="stat-card">

              <div className="stat-top">
                <span>
                  CASE ENTITIES
                </span>

                <Users
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {caseEntityCount}
              </div>

              <div className="stat-description">
                People, organizations & locations
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-top">
                <span>
                  RELATIONSHIPS
                </span>

                <GitBranch
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {caseRelationshipCount}
              </div>

              <div className="stat-description">
                Known connections
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-top">
                <span>
                  CASE DATE
                </span>

                <CalendarDays
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value case-date-value">
                {caseDate}
              </div>

              <div className="stat-description">
                Investigation date
              </div>

            </div>

          </div>

          {/* =================================================
              LOCATION
          ================================================= */}

          {caseData.location && (
            <div className="panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Investigation Location
                  </h2>

                  <p>
                    Geographic context
                  </p>
                </div>

              </div>

              <strong>
                {caseData.location}
              </strong>

            </div>
          )}

          {/* =================================================
              NETWORK
          ================================================= */}

          <div className="panel case-network-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Criminal Network
                </h2>

                <p>
                  Relationship intelligence for{" "}
                  {caseData.case_id}
                </p>
              </div>

              <span className="case-network-badge">
                {graphNodes.length} entities
              </span>

            </div>

            <div className="case-network-container">

              {graphNodes.length === 0 ? (
                <div className="timeline-empty">

                  <Network
                    size={28}
                  />

                  <h3>
                    No network entities
                  </h3>

                  <p>
                    No entities were returned for
                    this investigation.
                  </p>

                </div>
              ) : (
                <NetworkGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  onNodeSelect={
                    handleNodeSelect
                  }
                />
              )}

            </div>
          </div>

          {/* =================================================
              RELATIONSHIPS
          ================================================= */}

          <div className="panel case-relationships-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Known Relationships
                </h2>

                <p>
                  Evidence-backed connections in
                  this investigation
                </p>
              </div>

              <span className="case-count">
                {graphEdges.length} connections
              </span>

            </div>

            {graphEdges.length === 0 ? (
              <div className="timeline-empty">

                <GitBranch
                  size={28}
                />

                <h3>
                  No relationships available
                </h3>

                <p>
                  The backend has not returned
                  relationships for this case.
                </p>

              </div>
            ) : (
              <div className="relationship-list">

                {graphEdges.map(
                  (relationship) => {

                    const confidence =
                      Math.round(
                        Number(
                          relationship.confidence
                        ) * 100
                      );

                    return (
                      <button
                        type="button"
                        className="relationship-list-item"
                        key={
                          relationship.id
                        }
                        onClick={() =>
                          openEvidence(
                            relationship
                          )
                        }
                      >

                        <div className="relationship-list-main">

                          <div className="relationship-entity">

                            <span>
                              FROM
                            </span>

                            <strong>
                              {
                                relationship.sourceName
                              }
                            </strong>

                          </div>

                          <div className="relationship-list-arrow">
                            →
                          </div>

                          <div className="relationship-entity">

                            <span>
                              TO
                            </span>

                            <strong>
                              {
                                relationship.targetName
                              }
                            </strong>

                          </div>

                        </div>

                        <div className="relationship-list-meta">

                          <span className="relationship-type">
                            {
                              relationship.type
                            }
                          </span>

                          <span className="relationship-confidence">
                            {confidence}%
                          </span>

                          <ChevronRight
                            size={15}
                            className="relationship-chevron"
                          />

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* =================================================
              CASE EVIDENCE
          ================================================= */}

          <div className="panel">

            <div className="panel-header">

              <div>
                <h2>
                  Evidence Records
                </h2>

                <p>
                  Source documents supporting this
                  investigation
                </p>
              </div>

              <span className="case-count">
                {caseEvidence.length} records
              </span>

            </div>

            {caseEvidence.length === 0 ? (
              <div className="timeline-empty">

                <p>
                  No evidence records available.
                </p>

              </div>
            ) : (
              <div className="relationship-list">

                {caseEvidence.map(
                  (item) => (

                    <button
                      type="button"
                      className="relationship-list-item"
                      key={
                        item.evidence_id
                      }
                      onClick={() =>
                        setSelectedEvidence({
                          id:
                            item.evidence_id,

                          type: "EVIDENCE",

                          evidenceId:
                            item.evidence_id,

                          sourceDocument:
                            item.source_document,

                          pageNumber:
                            item.page,

                          confidence:
                            item.confidence,

                          extractionTimestamp:
                            item.extraction_timestamp,

                          text:
                            item.text,
                        })
                      }
                    >

                      <div className="relationship-list-main">

                        <div className="relationship-entity">

                          <span>
                            SOURCE
                          </span>

                          <strong>
                            {
                              item.source_document
                            }
                          </strong>

                        </div>

                        <div className="relationship-list-arrow">
                          →
                        </div>

                        <div className="relationship-entity">

                          <span>
                            CONFIDENCE
                          </span>

                          <strong>
                            {Math.round(
                              Number(
                                item.confidence ??
                                  0
                              ) * 100
                            )}
                            %
                          </strong>

                        </div>

                      </div>

                      <div className="relationship-list-meta">

                        <span className="relationship-type">
                          PAGE{" "}
                          {item.page ?? "—"}
                        </span>

                        <ChevronRight
                          size={15}
                          className="relationship-chevron"
                        />

                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </div>

        </section>

        {/* =================================================
            EVIDENCE PANEL
        ================================================= */}

        <EvidencePanel
          evidence={selectedEvidence}
          onClose={() =>
            setSelectedEvidence(null)
          }
        />

      </main>
    </div>
  );
}

export default CaseDetails;