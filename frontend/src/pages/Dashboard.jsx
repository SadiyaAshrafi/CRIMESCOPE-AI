
import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  Users,
  GitBranch,
  Network,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import NetworkGraph from "../components/NetworkGraph";
import EvidencePanel from "../components/EvidencePanel";

import { getIntegrationData } from "../services/api";

function Dashboard() {
  const [integrationData, setIntegrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadIntegrationData() {
      try {
        setLoading(true);
        setError("");

        const data = await getIntegrationData();

        if (mounted) {
          setIntegrationData(data);
        }
      } catch (err) {
        console.error("Integration data error:", err);

        if (mounted) {
          setError(
            err.message || "Unable to load integration data."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadIntegrationData();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // BACKEND DATA
  // =========================================================

  const entities = integrationData?.entities ?? [];
  const relationships = integrationData?.relationships ?? [];
  const cases = integrationData?.cases ?? [];
  const evidence = integrationData?.evidence ?? [];
  const summary = integrationData?.summary ?? {};

  // =========================================================
  // GRAPH DATA
  // =========================================================

  const graphData = useMemo(() => {
    const entityMap = new Map(
      entities.map((entity) => [entity.id, entity])
    );

    const nodes = entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
    }));

    const edges = relationships
      .map((relationship) => {
        const sourceId = relationship.source_entity_id;
        const targetId = relationship.target_entity_id;

        if (!sourceId || !targetId) {
          return null;
        }

        const sourceEntity = entityMap.get(sourceId);
        const targetEntity = entityMap.get(targetId);

        const relatedEvidence = evidence.find(
          (item) =>
            item.evidence_id === relationship.evidence_id
        );

        return {
          id: relationship.id,

          source: sourceId,
          target: targetId,

          type:
            relationship.relationship ||
            relationship.type ||
            "RELATED_TO",

          confidence: relationship.confidence ?? 0,

          evidenceId: relationship.evidence_id,

          sourceDocument:
            relatedEvidence?.source_document,

          pageNumber:
            relatedEvidence?.page,

          extractionTimestamp:
            relatedEvidence?.extraction_timestamp,

          date: relationship.date,

          sourceName:
            sourceEntity?.name ||
            relationship.source ||
            sourceId,

          targetName:
            targetEntity?.name ||
            relationship.target ||
            targetId,
        };
      })
      .filter(Boolean);

    return {
      nodes,
      edges,
    };
  }, [entities, relationships, evidence]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const activeCases =
    summary.total_cases ?? cases.length;

  const entityCount =
    summary.total_entities ?? entities.length;

  const relationshipCount =
    summary.total_relationships ??
    relationships.length;

  const crossCaseLinks = useMemo(() => {
    return entities.filter(
      (entity) =>
        (entity.case_ids?.length ?? 0) > 1
    ).length;
  }, [entities]);

  // =========================================================
  // CROSS CASE GROUPS
  // =========================================================

  const clusterCount = useMemo(() => {
    const groups = new Set();

    entities.forEach((entity) => {
      const caseIds = [...(entity.case_ids ?? [])].sort();

      if (caseIds.length > 1) {
        groups.add(caseIds.join("-"));
      }
    });

    return groups.size;
  }, [entities]);

  // =========================================================
  // LATEST EVIDENCE
  // =========================================================

  const latestEvidence = useMemo(() => {
    return [...evidence]
      .sort((a, b) => {
        const first = new Date(
          a.extraction_timestamp || 0
        ).getTime();

        const second = new Date(
          b.extraction_timestamp || 0
        ).getTime();

        return second - first;
      })
      .slice(0, 2);
  }, [evidence]);

  // =========================================================
  // CROSS CASE ENTITIES
  // =========================================================

  const crossCaseEntities = useMemo(() => {
    return entities
      .filter(
        (entity) =>
          (entity.case_ids?.length ?? 0) > 1
      )
      .slice(0, 2);
  }, [entities]);

  // =========================================================
  // NODE / EDGE SELECTION
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">

          {/* PAGE HEADING */}

          <div className="page-heading">
            <div>
              <h1>Investigation Dashboard</h1>

              <p>
                Evidence-aware criminal network intelligence
              </p>
            </div>

            <button className="primary-button">
              + New Investigation
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Backend Connection</h2>

                  <p>
                    Unable to load the integration dataset.
                  </p>
                </div>

                <AlertTriangle size={20} />
              </div>

              <p>{error}</p>

              <p>
                Make sure the FastAPI backend is running on
                http://127.0.0.1:8000
              </p>
            </div>
          )}

          {/* STAT CARDS */}

          <div className="stats-grid">

            <StatCard
              title="ACTIVE CASES"
              value={loading ? "—" : activeCases}
              description="Investigation cases"
              icon={<Folder size={20} />}
            />

            <StatCard
              title="ENTITIES"
              value={loading ? "—" : entityCount}
              description="People, organizations & locations"
              icon={<Users size={20} />}
            />

            <StatCard
              title="RELATIONSHIPS"
              value={loading ? "—" : relationshipCount}
              description="Known network connections"
              icon={<GitBranch size={20} />}
            />

            <StatCard
              title="CROSS-CASE LINKS"
              value={loading ? "—" : crossCaseLinks}
              description="Entities appearing across cases"
              icon={<Network size={20} />}
            />

          </div>

          {/* MAIN DASHBOARD GRID */}

          <div className="dashboard-grid">

            {/* NETWORK GRAPH */}

            <div className="panel network-panel">

              <div className="panel-header">

                <div>
                  <h2>Criminal Network</h2>

                  <p>
                    Interactive relationship intelligence
                  </p>
                </div>

                <button className="secondary-button">
                  Expand
                </button>

              </div>

              <div className="network-placeholder">

                {loading ? (
                  <div className="timeline-empty">

                    <Network size={28} />

                    <h3>
                      Loading intelligence network...
                    </h3>

                    <p>
                      Fetching entities and relationships.
                    </p>

                  </div>
                ) : graphData.nodes.length === 0 ? (
                  <div className="timeline-empty">

                    <Network size={28} />

                    <h3>
                      No network data available
                    </h3>

                    <p>
                      The integration backend returned no
                      entities.
                    </p>

                  </div>
                ) : (
                  <NetworkGraph
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    onNodeSelect={handleNodeSelect}
                  />
                )}

              </div>
            </div>

            {/* AI INSIGHTS */}

            <div className="panel insights-panel">

              <div className="panel-header">

                <div>
                  <h2>AI Insights</h2>

                  <p>
                    Intelligence requiring attention
                  </p>
                </div>

                <AlertTriangle size={20} />

              </div>

              {loading ? (
                <div className="insight">

                  <div className="insight-alert">
                    ...
                  </div>

                  <div>
                    <strong>
                      Loading intelligence
                    </strong>

                    <p>
                      Analyzing investigation data.
                    </p>
                  </div>

                </div>
              ) : (
                <>
                  <div className="insight">

                    <div className="insight-alert">
                      !
                    </div>

                    <div>

                      <strong>
                        Cross-case connection detected
                      </strong>

                      <p>
                        {crossCaseEntities.length > 0
                          ? `${crossCaseEntities
                              .map(
                                (entity) =>
                                  entity.name
                              )
                              .join(
                                " and "
                              )} appear across multiple investigations.`
                          : "No cross-case entity detected in the current dataset."}
                      </p>

                    </div>

                  </div>

                  <div className="insight">

                    <div className="insight-alert">
                      !
                    </div>

                    <div>

                      <strong>
                        Evidence intelligence available
                      </strong>

                      <p>
                        {latestEvidence.length > 0
                          ? `${latestEvidence.length} recent evidence records are available for investigation analysis.`
                          : "No evidence records are currently available."}
                      </p>

                    </div>

                  </div>
                </>
              )}

              <button className="full-button">
                Discover Related Cases
              </button>

            </div>
          </div>

          {/* NETWORK DNA */}

          <div className="panel dna-summary">

            <div>

              <h2>Network DNA</h2>

              <p>
                Current intelligence network overview
              </p>

            </div>

            <div className="dna-values">

              <div>
                <strong>
                  {loading ? "—" : entityCount}
                </strong>

                <span>
                  Entities
                </span>
              </div>

              <div>
                <strong>
                  {loading ? "—" : relationshipCount}
                </strong>

                <span>
                  Relationships
                </span>
              </div>

              <div>
                <strong>
                  {loading ? "—" : activeCases}
                </strong>

                <span>
                  Cases
                </span>
              </div>

              <div>
                <strong>
                  {loading ? "—" : clusterCount}
                </strong>

                <span>
                  Cross-case groups
                </span>
              </div>

              <div>
                <strong>
                  {loading ? "—" : crossCaseLinks}
                </strong>

                <span>
                  Cross-case
                </span>
              </div>

            </div>
          </div>

        </section>

        {/* EVIDENCE PANEL */}

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

export default Dashboard;
