
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  GitBranch,
  Users,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetworkGraph from "../components/NetworkGraph";
import EvidencePanel from "../components/EvidencePanel";

import {
  mockCases,
  mockEntities,
  mockRelationships,
  mockEvidence,
} from "../data/MockData";

function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const caseData = useMemo(() => {
    return mockCases.find((item) => item.id === caseId);
  }, [caseId]);

  /*
   * Current MockData does not yet assign every entity/relationship
   * to a case. For the prototype, CASE-101 uses the available
   * network data. Backend case filtering can replace this later.
   */

  const graphNodes = useMemo(() => {
    return mockEntities;
  }, []);

  const graphEdges = useMemo(() => {
    return mockRelationships.map((relationship) => {
      const sourceNode = mockEntities.find(
        (node) => node.id === relationship.source
      );

      const targetNode = mockEntities.find(
        (node) => node.id === relationship.target
      );

      const evidence = mockEvidence.find(
        (item) => item.id === relationship.evidenceId
      );

      return {
        ...relationship,

        source: relationship.source,
        target: relationship.target,

        sourceName:
          sourceNode?.name || relationship.source,

        targetName:
          targetNode?.name || relationship.target,

        sourceDocument: evidence?.document || "—",
        pageNumber: evidence?.page ?? null,
        extractionTimestamp:
          evidence?.extractedAt || "—",
      };
    });
  }, []);

  const openEvidence = (relationship) => {
    setSelectedEvidence({
      id: relationship.id,
      type: "RELATIONSHIP",

      source: relationship.sourceName,
      target: relationship.targetName,

      relationship: relationship.type,
      relationshipType: relationship.type,

      confidence: relationship.confidence,

      evidenceId: relationship.evidenceId,

      sourceDocument:
        relationship.sourceDocument,

      pageNumber:
        relationship.pageNumber,

      extractionTimestamp:
        relationship.extractionTimestamp,
    });
  };

  const handleNodeSelect = (item) => {
    if (item.type === "RELATIONSHIP") {
      setSelectedEvidence(item);
    }
  };

  /*
   * CASE NOT FOUND
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
              onClick={() => navigate("/cases")}
            >
              <ArrowLeft size={15} />
              Back to Cases
            </button>

            <div className="panel case-not-found">
              <div className="case-not-found-icon">
                <Folder size={24} />
              </div>

              <h2>Case Not Found</h2>

              <p>
                No investigation exists for case ID{" "}
                <strong>{caseId}</strong>.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() => navigate("/cases")}
              >
                Return to Cases
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard case-details-page">
          {/* =====================================================
              CASE HEADER
          ====================================================== */}

          <div className="case-details-header">
            <div className="case-details-header-left">
              <button
                type="button"
                className="back-button"
                onClick={() => navigate("/cases")}
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
                    {caseData.id}
                  </div>

                  <h1>
                    {caseData.title}
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
              {caseData.status}
            </div>
          </div>

          {/* =====================================================
              CASE STATS
          ====================================================== */}

          <div className="stats-grid case-stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>CASE ENTITIES</span>
                <Users
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {caseData.entityCount}
              </div>

              <div className="stat-description">
                People, organizations & locations
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>RELATIONSHIPS</span>
                <GitBranch
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {caseData.relationshipCount}
              </div>

              <div className="stat-description">
                Known connections
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>CASE DATE</span>
                <CalendarDays
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value case-date-value">
                {caseData.date}
              </div>

              <div className="stat-description">
                Investigation opened
              </div>
            </div>
          </div>

          {/* =====================================================
              NETWORK
          ====================================================== */}

          <div className="panel case-network-panel">
            <div className="panel-header">
              <div>
                <h2>Criminal Network</h2>

                <p>
                  Relationship intelligence for{" "}
                  {caseData.id}
                </p>
              </div>

              <span className="case-network-badge">
                {graphNodes.length} entities
              </span>
            </div>

            <div className="case-network-container">
              <NetworkGraph
                nodes={graphNodes}
                edges={graphEdges}
                onNodeSelect={handleNodeSelect}
              />
            </div>
          </div>

          {/* =====================================================
              RELATIONSHIPS
          ====================================================== */}

          <div className="panel case-relationships-panel">
            <div className="panel-header">
              <div>
                <h2>Known Relationships</h2>

                <p>
                  Evidence-backed connections in this
                  investigation
                </p>
              </div>

              <span className="case-count">
                {graphEdges.length} connections
              </span>
            </div>

            <div className="relationship-list">
              {graphEdges.map((relationship) => {
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
                    key={relationship.id}
                    onClick={() =>
                      openEvidence(relationship)
                    }
                  >
                    <div className="relationship-list-main">
                      <div className="relationship-entity">
                        <span>FROM</span>

                        <strong>
                          {relationship.sourceName}
                        </strong>
                      </div>

                      <div className="relationship-list-arrow">
                        →
                      </div>

                      <div className="relationship-entity">
                        <span>TO</span>

                        <strong>
                          {relationship.targetName}
                        </strong>
                      </div>
                    </div>

                    <div className="relationship-list-meta">
                      <span className="relationship-type">
                        {relationship.type}
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
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            EVIDENCE PANEL
        ====================================================== */}

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
