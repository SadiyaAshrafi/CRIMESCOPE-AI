
import { useMemo, useState } from "react";
import {
  Users,
  GitBranch,
  Folder,
  Building2,
  MapPin,
  Network,
  Layers3,
  TrendingUp,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetworkGraph from "../components/NetworkGraph";

import {
  mockNetworkDNA,
  mockNetworkEvolution,
  mockEntities,
  mockRelationships,
} from "../data/MockData";

function NetworkDNA() {
  const [selectedNode, setSelectedNode] = useState(null);

  /*
   * =========================================================
   * DATA LAYER
   * =========================================================
   *
   * Currently using mock data.
   *
   * Later replace these four constants with API response data.
   *
   * Example:
   *
   * const networkData = apiResponse.networkDNA;
   * const evolutionData = apiResponse.evolution;
   * const entities = apiResponse.entities;
   * const relationships = apiResponse.relationships;
   *
   * The UI below does not need to change.
   */

  const networkData = mockNetworkDNA;
  const evolutionData = mockNetworkEvolution;
  const entities = mockEntities;
  const relationships = mockRelationships;

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const formatConfidence = (confidence) => {
    const value = Number(confidence);

    if (Number.isNaN(value)) {
      return "—";
    }

    const percentage = value <= 1 ? value * 100 : value;

    return `${Math.round(percentage)}%`;
  };

  /*
   * =========================================================
   * NODE LOOKUP
   * =========================================================
   *
   * Faster and cleaner than repeatedly searching mockEntities.
   */

  const nodeMap = useMemo(() => {
    return new Map(
      entities.map((entity) => [entity.id, entity])
    );
  }, [entities]);

  /*
   * =========================================================
   * GRAPH NODES
   * =========================================================
   */

  const graphNodes = useMemo(() => {
    return entities.map((entity) => ({
      ...entity,

      cluster:
        entity.type === "PERSON"
          ? "PERSONS"
          : entity.type === "ORGANIZATION"
          ? "ORGANIZATIONS"
          : "LOCATIONS",
    }));
  }, [entities]);

  /*
   * =========================================================
   * GRAPH EDGES
   * =========================================================
   */

  const graphEdges = useMemo(() => {
    return relationships.map((relationship) => {
      const sourceNode = nodeMap.get(relationship.source);
      const targetNode = nodeMap.get(relationship.target);

      return {
        ...relationship,

        source: relationship.source,
        target: relationship.target,

        sourceName:
          sourceNode?.name || relationship.source,

        targetName:
          targetNode?.name || relationship.target,
      };
    });
  }, [relationships, nodeMap]);

  /*
   * =========================================================
   * NODE SELECTION
   * =========================================================
   */

  const handleNodeSelect = (item) => {
    if (!item) return;

    if (item.type === "RELATIONSHIP") {
      return;
    }

    setSelectedNode(item);
  };

  /*
   * =========================================================
   * SELECTED NODE CONNECTIONS
   * =========================================================
   */

  const connectedRelationships = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    return graphEdges.filter(
      (relationship) =>
        relationship.source === selectedNode.id ||
        relationship.target === selectedNode.id
    );
  }, [selectedNode, graphEdges]);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard network-dna-page">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-heading">
            <div>
              <h1>Network DNA</h1>

              <p>
                Structural intelligence and evolution of the
                criminal network
              </p>
            </div>

            <div className="dna-live-status">
              <span className="status-dot" />
              LIVE INTELLIGENCE
            </div>
          </div>

          {/* =================================================
              OVERVIEW CARDS
          ================================================= */}

          <div className="stats-grid">

            {/* ENTITIES */}

            <div className="stat-card">
              <div className="stat-top">
                <span>ENTITIES</span>

                <Users
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {networkData.entities}
              </div>

              <div className="stat-description">
                People, organizations & locations
              </div>
            </div>

            {/* RELATIONSHIPS */}

            <div className="stat-card">
              <div className="stat-top">
                <span>RELATIONSHIPS</span>

                <GitBranch
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {networkData.relationships}
              </div>

              <div className="stat-description">
                Known network connections
              </div>
            </div>

            {/* CASES */}

            <div className="stat-card">
              <div className="stat-top">
                <span>CASES</span>

                <Folder
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {networkData.cases}
              </div>

              <div className="stat-description">
                Investigations in network
              </div>
            </div>

            {/* CROSS CASE LINKS */}

            <div className="stat-card">
              <div className="stat-top">
                <span>CROSS-CASE LINKS</span>

                <Network
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {networkData.crossCaseLinks}
              </div>

              <div className="stat-description">
                Potential shared connections
              </div>
            </div>

          </div>

          {/* =================================================
              GLOBAL NETWORK GRAPH
          ================================================= */}

          <div className="panel dna-network-panel">

            <div className="panel-header">
              <div>
                <h2>Criminal Network Graph</h2>

                <p>
                  Global relationship intelligence across
                  investigations
                </p>
              </div>

              <span className="dna-network-badge">
                {graphNodes.length} entities
              </span>
            </div>

            <div className="dna-network-container">

              {graphNodes.length > 0 ? (
                <NetworkGraph
                  nodes={graphNodes}
                  edges={graphEdges}
                  onNodeSelect={handleNodeSelect}
                />
              ) : (
                <div className="dna-empty-state">
                  No network intelligence available.
                </div>
              )}

            </div>

          </div>

          {/* =================================================
              SELECTED ENTITY
          ================================================= */}

          {selectedNode && (
            <div className="panel dna-selected-entity">

              <div className="panel-header">

                <div>
                  <h2>Entity Intelligence</h2>

                  <p>
                    Relationship intelligence for selected
                    entity
                  </p>
                </div>

                <button
                  className="dna-close-button"
                  onClick={() => setSelectedNode(null)}
                  aria-label="Close entity intelligence"
                >
                  <X size={16} />
                </button>

              </div>

              <div className="dna-entity-content">

                {/* ENTITY INFO */}

                <div className="dna-entity-main">

                  <div className="dna-entity-icon">

                    {selectedNode.type === "PERSON" && (
                      <Users size={20} />
                    )}

                    {selectedNode.type === "ORGANIZATION" && (
                      <Building2 size={20} />
                    )}

                    {selectedNode.type === "LOCATION" && (
                      <MapPin size={20} />
                    )}

                  </div>

                  <div>
                    <span>ENTITY</span>

                    <strong>
                      {selectedNode.name}
                    </strong>

                    <small>
                      {selectedNode.type}
                    </small>
                  </div>

                </div>

                {/* ENTITY STATS */}

                <div className="dna-entity-stats">

                  <div>
                    <strong>
                      {connectedRelationships.length}
                    </strong>

                    <span>
                      Connections
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        connectedRelationships.filter(
                          (item) =>
                            item.source === selectedNode.id
                        ).length
                      }
                    </strong>

                    <span>
                      Outgoing
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        connectedRelationships.filter(
                          (item) =>
                            item.target === selectedNode.id
                        ).length
                      }
                    </strong>

                    <span>
                      Incoming
                    </span>
                  </div>

                </div>

              </div>

              {/* CONNECTIONS */}

              {connectedRelationships.length > 0 ? (

                <div className="dna-connection-list">

                  {connectedRelationships.map(
                    (relationship) => (

                      <div
                        className="dna-connection-row"
                        key={relationship.id}
                      >

                        <div>
                          <span>
                            {relationship.source ===
                            selectedNode.id
                              ? "TO"
                              : "FROM"}
                          </span>

                          <strong>
                            {relationship.source ===
                            selectedNode.id
                              ? relationship.targetName
                              : relationship.sourceName}
                          </strong>
                        </div>

                        <div className="dna-connection-meta">

                          <span>
                            {relationship.type}
                          </span>

                          <strong>
                            {formatConfidence(
                              relationship.confidence
                            )}
                          </strong>

                        </div>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="dna-empty-state dna-entity-empty">
                  No relationships found for this entity.
                </div>

              )}

            </div>
          )}

          {/* =================================================
              NETWORK COMPOSITION + INTELLIGENCE
          ================================================= */}

          <div className="dashboard-grid">

            {/* NETWORK COMPOSITION */}

            <div className="panel dna-composition-panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Network Composition
                  </h2>

                  <p>
                    Distribution of entities across the
                    intelligence graph
                  </p>
                </div>

                <Layers3
                  size={20}
                  className="stat-icon"
                />

              </div>

              <div className="dna-composition-grid">

                {/* TOTAL ENTITIES */}

                <div className="dna-composition-card">

                  <div className="dna-composition-icon">
                    <Users size={19} />
                  </div>

                  <div>
                    <strong>
                      {networkData.entities}
                    </strong>

                    <span>
                      Total Entities
                    </span>
                  </div>

                </div>

                {/* ORGANIZATIONS */}

                <div className="dna-composition-card">

                  <div className="dna-composition-icon">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <strong>
                      {networkData.organizations}
                    </strong>

                    <span>
                      Organizations
                    </span>
                  </div>

                </div>

                {/* LOCATIONS */}

                <div className="dna-composition-card">

                  <div className="dna-composition-icon">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <strong>
                      {networkData.locations}
                    </strong>

                    <span>
                      Locations
                    </span>
                  </div>

                </div>

                {/* CLUSTERS */}

                <div className="dna-composition-card">

                  <div className="dna-composition-icon">
                    <Network size={19} />
                  </div>

                  <div>
                    <strong>
                      {networkData.clusters}
                    </strong>

                    <span>
                      Network Clusters
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* NETWORK INTELLIGENCE */}

            <div className="panel dna-health-panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Network Intelligence
                  </h2>

                  <p>
                    Current structural indicators
                  </p>
                </div>

                <TrendingUp
                  size={20}
                  className="stat-icon"
                />

              </div>

              <div className="dna-health-list">

                {/* DENSITY */}

                <div className="dna-health-row">

                  <span>
                    Network Density
                  </span>

                  <strong>
                    {networkData.density || "UNKNOWN"}
                  </strong>

                </div>

                {/* CROSS CASE */}

                <div className="dna-health-row">

                  <span>
                    Cross-Case Activity
                  </span>

                  <strong>
                    {networkData.crossCaseLinks} LINKS
                  </strong>

                </div>

                {/* CLUSTERS */}

                <div className="dna-health-row">

                  <span>
                    Active Clusters
                  </span>

                  <strong>
                    {networkData.clusters}
                  </strong>

                </div>

                {/* RELATIONSHIPS */}

                <div className="dna-health-row">

                  <span>
                    Relationship Coverage
                  </span>

                  <strong>
                    {networkData.relationships} CONNECTIONS
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              NETWORK EVOLUTION
          ================================================= */}

          <div className="panel dna-evolution-panel">

            <div className="panel-header">

              <div>
                <h2>
                  Network Evolution
                </h2>

                <p>
                  How the intelligence network has grown
                  over time
                </p>
              </div>

              <TrendingUp
                size={20}
                className="stat-icon"
              />

            </div>

            <div className="evolution-table">

              <div className="evolution-header">

                <span>PERIOD</span>

                <span>ENTITIES</span>

                <span>RELATIONSHIPS</span>

                <span>CROSS-CASE LINKS</span>

              </div>

              {evolutionData.length > 0 ? (

                evolutionData.map((item) => (

                  <div
                    className="evolution-row"
                    key={item.date}
                  >

                    <strong>
                      {item.date}
                    </strong>

                    <span>
                      {item.entities}
                    </span>

                    <span>
                      {item.relationships}
                    </span>

                    <span className="evolution-highlight">
                      {item.crossCaseLinks}
                    </span>

                  </div>

                ))

              ) : (

                <div className="dna-empty-state">
                  No evolution data available.
                </div>

              )}

            </div>

          </div>

          {/* =================================================
              DNA SUMMARY
          ================================================= */}

          <div className="panel dna-summary">

            <div>
              <h2>
                Network DNA Summary
              </h2>

              <p>
                Current intelligence network overview
              </p>
            </div>

            <div className="dna-values">

              <div>
                <strong>
                  {networkData.entities}
                </strong>

                <span>
                  Entities
                </span>
              </div>

              <div>
                <strong>
                  {networkData.relationships}
                </strong>

                <span>
                  Relationships
                </span>
              </div>

              <div>
                <strong>
                  {networkData.cases}
                </strong>

                <span>
                  Cases
                </span>
              </div>

              <div>
                <strong>
                  {networkData.clusters}
                </strong>

                <span>
                  Clusters
                </span>
              </div>

              <div>
                <strong>
                  {networkData.crossCaseLinks}
                </strong>

                <span>
                  Cross-case
                </span>
              </div>

            </div>

          </div>

        </section>
      </main>
    </div>
  );
}

export default NetworkDNA;
