
import { useMemo, useState } from "react";
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

import {
  mockEntities,
  mockRelationships,
  mockNetworkDNA,
} from "../data/MockData";

function Dashboard() {
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  /*
   * Convert relationship IDs into readable entity names.
   *
   * This keeps the graph component independent from the
   * backend data format and will make API integration easier later.
   */
  const graphData = useMemo(() => {
    const entityMap = new Map(
      mockEntities.map((entity) => [entity.id, entity])
    );

    const nodes = mockEntities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      type: entity.type,
    }));

    const edges = mockRelationships.map((relationship) => {
      const sourceEntity = entityMap.get(relationship.source);
      const targetEntity = entityMap.get(relationship.target);

      return {
        id: relationship.id,
        source: relationship.source,
        target: relationship.target,
        type: relationship.type,
        confidence: relationship.confidence,
        evidenceId: relationship.evidenceId,

        sourceDocument: relationship.sourceDocument,
        pageNumber: relationship.pageNumber,
        extractionTimestamp: relationship.extractionTimestamp,

        sourceName: sourceEntity?.name || relationship.source,
        targetName: targetEntity?.name || relationship.target,
      };
    });

    return {
      nodes,
      edges,
    };
  }, []);

  /*
   * Current frontend statistics.
   *
   * These are intentionally derived from MockData.js where possible.
   * Later these values can come directly from Irfan's API response.
   */
  const activeCases = 5;

  const entityCount =
    mockNetworkDNA?.entities ?? graphData.nodes.length;

  const relationshipCount =
    mockNetworkDNA?.relationships ?? graphData.edges.length;

  const crossCaseLinks =
    mockNetworkDNA?.crossCaseLinks ?? 0;

  const handleNodeSelect = (item) => {
    if (!item) return;

    if (item.type === "RELATIONSHIP") {
      setSelectedEvidence(item);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">

          {/* =====================================================
              PAGE HEADING
          ===================================================== */}

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


          {/* =====================================================
              STAT CARDS
          ===================================================== */}

          <div className="stats-grid">

            <StatCard
              title="ACTIVE CASES"
              value={activeCases}
              description="Investigation cases"
              icon={<Folder size={20} />}
            />

            <StatCard
              title="ENTITIES"
              value={entityCount}
              description="People & organizations"
              icon={<Users size={20} />}
            />

            <StatCard
              title="RELATIONSHIPS"
              value={relationshipCount}
              description="Known connections"
              icon={<GitBranch size={20} />}
            />

            <StatCard
              title="CROSS-CASE LINKS"
              value={crossCaseLinks}
              description="Potential connections"
              icon={<Network size={20} />}
            />

          </div>


          {/* =====================================================
              MAIN DASHBOARD GRID
          ===================================================== */}

          <div className="dashboard-grid">

            {/* ===================================================
                NETWORK GRAPH
            =================================================== */}

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

                <NetworkGraph
                  nodes={graphData.nodes}
                  edges={graphData.edges}
                  onNodeSelect={handleNodeSelect}
                />

              </div>

            </div>


            {/* ===================================================
                AI INSIGHTS
            =================================================== */}

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


              <div className="insight">

                <div className="insight-alert">
                  !
                </div>

                <div>
                  <strong>
                    Cross-case connection detected
                  </strong>

                  <p>
                    CASE-101 and CASE-103 share Ravi Kumar
                    and Eastern Logistics.
                  </p>
                </div>

              </div>


              <div className="insight">

                <div className="insight-alert">
                  !
                </div>

                <div>
                  <strong>
                    New network cluster
                  </strong>

                  <p>
                    3 entities formed a new relationship
                    cluster in June 2026.
                  </p>
                </div>

              </div>


              <button className="full-button">
                Discover Related Cases
              </button>

            </div>

          </div>


          {/* =====================================================
              NETWORK DNA
          ===================================================== */}

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
                  {entityCount}
                </strong>

                <span>
                  Entities
                </span>
              </div>


              <div>
                <strong>
                  {relationshipCount}
                </strong>

                <span>
                  Relationships
                </span>
              </div>


              <div>
                <strong>
                  {mockNetworkDNA?.cases ?? activeCases}
                </strong>

                <span>
                  Cases
                </span>
              </div>


              <div>
                <strong>
                  {mockNetworkDNA?.clusters ?? 0}
                </strong>

                <span>
                  Clusters
                </span>
              </div>


              <div>
                <strong>
                  {crossCaseLinks}
                </strong>

                <span>
                  Cross-case
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =======================================================
            EVIDENCE PANEL
        ======================================================= */}

        <EvidencePanel
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />

      </main>
    </div>
  );
}

export default Dashboard;
