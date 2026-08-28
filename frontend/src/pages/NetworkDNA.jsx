import { useEffect, useMemo, useState } from "react";
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
AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NetworkGraph from "../components/NetworkGraph";

import { getIntegrationData } from "../services/api";

function NetworkDNA() {
const [integrationData, setIntegrationData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [selectedNode, setSelectedNode] = useState(null);

/*

* =========================================================
* LOAD BACKEND DATA
* =========================================================
  */

useEffect(() => {
let mounted = true;
const loadData = async () => {
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
          "Unable to load network intelligence."
      );
    }
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
};

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
* ENTITY COUNTS
* =========================================================
  */

const entityCounts = useMemo(() => {
const organizations = entities.filter(
(entity) =>
entity.type === "ORGANIZATION" ||
entity.label === "ORGANIZATION"
).length;

const locations = entities.filter(
  (entity) =>
    entity.type === "LOCATION" ||
    entity.label === "LOCATION"
).length;

const persons = entities.filter(
  (entity) =>
    entity.type === "PERSON" ||
    entity.label === "PERSON"
).length;

return {
  total: entities.length,
  organizations,
  locations,
  persons,
};

}, [entities]);

/*

* =========================================================
* CROSS-CASE ENTITIES
* =========================================================
  */

const crossCaseEntities = useMemo(() => {
return entities.filter(
(entity) =>
(entity.case_ids?.length ?? 0) > 1
);
}, [entities]);

/*

* =========================================================
* CLUSTER COUNT
* =========================================================
*
* A cluster is represented here by a unique group of cases
* shared by an entity.
  */

const clusterCount = useMemo(() => {
const groups = new Set();
entities.forEach((entity) => {
  const caseIds = entity.case_ids ?? [];

  if (caseIds.length > 1) {
    groups.add(
      [...caseIds]
        .sort()
        .join("-")
    );
  }
});

return groups.size;

}, [entities]);

/*

* =========================================================
* NETWORK DATA
* =========================================================
  */

const networkData = useMemo(() => {
const totalEntities = entities.length;
const totalRelationships = relationships.length;
const totalCases = cases.length;
const crossCaseLinks = crossCaseEntities.length;
const possibleConnections =
  totalEntities > 1
    ? (totalEntities * (totalEntities - 1)) / 2
    : 0;

const density =
  possibleConnections > 0
    ? totalRelationships / possibleConnections
    : 0;

return {
  entities: totalEntities,
  relationships: totalRelationships,
  cases: totalCases,
  crossCaseLinks,
  organizations: entityCounts.organizations,
  locations: entityCounts.locations,
  persons: entityCounts.persons,
  clusters: clusterCount,
  density:
    possibleConnections > 0
      ? `${(density * 100).toFixed(1)}%`
      : "0%",
};

}, [
entities,
relationships,
cases,
crossCaseEntities,
entityCounts,
clusterCount,
]);

/*

* =========================================================
* NODE LOOKUP
* =========================================================
  */

const nodeMap = useMemo(() => {
return new Map(
entities.map((entity) => [
entity.id,
entity,
])
);
}, [entities]);

/*

* =========================================================
* EVIDENCE LOOKUP
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
* GRAPH NODES
* =========================================================
  */

const graphNodes = useMemo(() => {
return entities.map((entity) => ({
id: entity.id,

  name:
    entity.name ||
    entity.canonical_id ||
    entity.id,

  type:
    entity.type ||
    entity.label ||
    "UNKNOWN",

  case_ids:
    entity.case_ids ?? [],

  cluster:
    entity.type === "PERSON"
      ? "PERSONS"
      : entity.type === "ORGANIZATION"
      ? "ORGANIZATIONS"
      : entity.type === "LOCATION"
      ? "LOCATIONS"
      : "OTHER",
}));

}, [entities]);

/*

* =========================================================
* GRAPH EDGES
* =========================================================
*
* IMPORTANT:
* Backend relationships use:
*
* source_entity_id
* target_entity_id
*
* not source / target.
  */

const graphEdges = useMemo(() => {
return relationships
.map((relationship) => {
const sourceId =
relationship.source_entity_id;

    const targetId =
      relationship.target_entity_id;

    if (!sourceId || !targetId) {
      return null;
    }

    const sourceNode =
      nodeMap.get(sourceId);

    const targetNode =
      nodeMap.get(targetId);

    const evidenceRecord =
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
        relationship.confidence ?? 0,

      evidenceId:
        relationship.evidence_id,

      sourceDocument:
        evidenceRecord?.source_document,

      pageNumber:
        evidenceRecord?.page,

      extractionTimestamp:
        relationship.timestamp ||
        evidenceRecord?.extraction_timestamp,

      date:
        relationship.date,

      caseId:
        relationship.case_id,

      sourceName:
        sourceNode?.name ||
        relationship.source ||
        sourceId,

      targetName:
        targetNode?.name ||
        relationship.target ||
        targetId,
    };
  })
  .filter(Boolean);

}, [
relationships,
nodeMap,
evidenceMap,
]);

/*

* =========================================================
* SELECT NODE
* =========================================================
  */

const handleNodeSelect = (item) => {
if (!item) {
return;
}

```
if (item.type === "RELATIONSHIP") {
  return;
}

setSelectedNode(item);
```

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
    relationship.source ===
      selectedNode.id ||
    relationship.target ===
      selectedNode.id
);

}, [
selectedNode,
graphEdges,
]);

/*

* =========================================================
* CONFIDENCE FORMATTER
* =========================================================
  */

const formatConfidence = (
confidence
) => {
const value = Number(
confidence
);
if (Number.isNaN(value)) {
  return "—";
}

const percentage =
  value <= 1
    ? value * 100
    : value;

return `${Math.round(
  percentage
)}%`;

};

/*

* =========================================================
* NETWORK EVOLUTION
* =========================================================
*
* Derived from actual backend case dates.
*
* Each case adds its entities and relationships to the
* network as the investigation timeline progresses.
  */

const evolutionData = useMemo(() => {
if (!cases.length) {
return [];
}

const sortedCases = [...cases].sort(
  (a, b) =>
    new Date(
      a.dates?.[0] ||
        a.date ||
        0
    ).getTime() -
    new Date(
      b.dates?.[0] ||
        b.date ||
        0
    ).getTime()
);

const entityFirstSeen =
  new Map();

const relationshipFirstSeen =
  new Map();

entities.forEach((entity) => {
  const firstCaseDate = cases
    .filter((caseItem) =>
      (
        entity.case_ids ??
        []
      ).includes(
        caseItem.case_id
      )
    )
    .map(
      (caseItem) =>
        caseItem.dates?.[0] ||
        caseItem.date
    )
    .filter(Boolean)
    .sort()[0];

  if (firstCaseDate) {
    entityFirstSeen.set(
      entity.id,
      firstCaseDate
    );
  }
});

relationships.forEach(
  (relationship) => {
    const relationshipDate =
      relationship.date;

    if (
      relationshipDate
    ) {
      relationshipFirstSeen.set(
        relationship.id,
        relationshipDate
      );
    }
  }
);

return sortedCases.map(
  (caseItem) => {
    const currentDate =
      caseItem.dates?.[0] ||
      caseItem.date;

    const entitiesAtPoint =
      [...entityFirstSeen.values()]
        .filter(
          (date) =>
            date <= currentDate
        ).length;

    const relationshipsAtPoint =
      [
        ...relationshipFirstSeen.values(),
      ].filter(
        (date) =>
          date <= currentDate
      ).length;

    const crossCaseAtPoint =
      entities.filter(
        (entity) => {
          const seenCases =
            cases.filter(
              (item) =>
                (
                  entity.case_ids ??
                  []
                ).includes(
                  item.case_id
                ) &&
                (
                  item.dates?.[0] ||
                  item.date ||
                  ""
                ) <= currentDate
            );

          return (
            seenCases.length > 1
          );
        }
      ).length;

    return {
      date:
        currentDate ||
        caseItem.case_id,

      entities:
        entitiesAtPoint,

      relationships:
        relationshipsAtPoint,

      crossCaseLinks:
        crossCaseAtPoint,
    };
  }
);

}, [
cases,
entities,
relationships,
]);

/*

* =========================================================
* LOADING STATE
* =========================================================
  */

if (loading) {
return ( <div className="app-layout"> <Sidebar />

    <main className="main-content">
      <Header />

      <section className="dashboard network-dna-page">
        <div className="page-heading">
          <div>
            <h1>
              Network DNA
            </h1>

            <p>
              Structural intelligence and
              evolution of the criminal
              network
            </p>
          </div>

          <div className="dna-live-status">
            <span className="status-dot" />
            LOADING INTELLIGENCE
          </div>
        </div>

        <div className="panel">
          <div className="dna-empty-state">
            <Network size={30} />

            <h3>
              Loading network intelligence...
            </h3>

            <p>
              Fetching entities,
              relationships and
              investigation data from
              the backend.
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
);

}

/*

* =========================================================
* ERROR STATE
* =========================================================
  */

if (error) {
return ( <div className="app-layout"> <Sidebar />
    <main className="main-content">
      <Header />

      <section className="dashboard network-dna-page">
        <div className="page-heading">
          <div>
            <h1>
              Network DNA
            </h1>

            <p>
              Structural intelligence and
              evolution of the criminal
              network
            </p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>
                Backend Connection
              </h2>

              <p>
                Unable to load network
                intelligence.
              </p>
            </div>

            <AlertTriangle size={20} />
          </div>

          <p>
            {error}
          </p>

          <p>
            Make sure the CRIMESCOPE AI
            backend is running on
            http://127.0.0.1:8000.
          </p>
        </div>
      </section>
    </main>
  </div>
);

}

/*

* =========================================================
* RENDER
* =========================================================
  */

return ( <div className="app-layout"> <Sidebar />

  <main className="main-content">
    <Header />

    <section className="dashboard network-dna-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-heading">
        <div>
          <h1>
            Network DNA
          </h1>

          <p>
            Structural intelligence and
            evolution of the criminal
            network
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

        <div className="stat-card">
          <div className="stat-top">
            <span>
              ENTITIES
            </span>

            <Users
              size={18}
              className="stat-icon"
            />
          </div>

          <div className="stat-value">
            {networkData.entities}
          </div>

          <div className="stat-description">
            People, organizations &
            locations
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
            {networkData.relationships}
          </div>

          <div className="stat-description">
            Known network connections
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>
              CASES
            </span>

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

        <div className="stat-card">
          <div className="stat-top">
            <span>
              CROSS-CASE LINKS
            </span>

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
            <h2>
              Criminal Network Graph
            </h2>

            <p>
              Global relationship
              intelligence across
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
              onNodeSelect={
                handleNodeSelect
              }
            />
          ) : (
            <div className="dna-empty-state">
              <Network size={28} />

              <h3>
                No network intelligence
              </h3>

              <p>
                The backend returned no
                entities.
              </p>
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
              <h2>
                Entity Intelligence
              </h2>

              <p>
                Relationship intelligence
                for selected entity
              </p>
            </div>

            <button
              type="button"
              className="dna-close-button"
              onClick={() =>
                setSelectedNode(null)
              }
              aria-label="Close entity intelligence"
            >
              <X size={16} />
            </button>

          </div>

          <div className="dna-entity-content">

            <div className="dna-entity-main">

              <div className="dna-entity-icon">

                {selectedNode.type ===
                  "PERSON" && (
                  <Users size={20} />
                )}

                {selectedNode.type ===
                  "ORGANIZATION" && (
                  <Building2 size={20} />
                )}

                {selectedNode.type ===
                  "LOCATION" && (
                  <MapPin size={20} />
                )}

              </div>

              <div>
                <span>
                  ENTITY
                </span>

                <strong>
                  {selectedNode.name}
                </strong>

                <small>
                  {selectedNode.type}
                </small>
              </div>

            </div>

            <div className="dna-entity-stats">

              <div>
                <strong>
                  {
                    connectedRelationships.length
                  }
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
                        item.source ===
                        selectedNode.id
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
                        item.target ===
                        selectedNode.id
                    ).length
                  }
                </strong>

                <span>
                  Incoming
                </span>
              </div>

            </div>

          </div>

          {connectedRelationships.length >
          0 ? (
            <div className="dna-connection-list">

              {connectedRelationships.map(
                (relationship) => (
                  <div
                    className="dna-connection-row"
                    key={
                      relationship.id
                    }
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
                        {
                          relationship.type
                        }
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
              No relationships found
              for this entity.
            </div>
          )}

        </div>
      )}

      {/* =================================================
          NETWORK COMPOSITION + INTELLIGENCE
      ================================================= */}

      <div className="dashboard-grid">

        <div className="panel dna-composition-panel">

          <div className="panel-header">

            <div>
              <h2>
                Network Composition
              </h2>

              <p>
                Distribution of entities
                across the intelligence
                graph
              </p>
            </div>

            <Layers3
              size={20}
              className="stat-icon"
            />

          </div>

          <div className="dna-composition-grid">

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

            <div className="dna-composition-card">

              <div className="dna-composition-icon">
                <Users size={19} />
              </div>

              <div>
                <strong>
                  {networkData.persons}
                </strong>

                <span>
                  Persons
                </span>
              </div>

            </div>

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

        <div className="panel dna-health-panel">

          <div className="panel-header">

            <div>
              <h2>
                Network Intelligence
              </h2>

              <p>
                Current structural
                indicators
              </p>
            </div>

            <TrendingUp
              size={20}
              className="stat-icon"
            />

          </div>

          <div className="dna-health-list">

            <div className="dna-health-row">

              <span>
                Network Density
              </span>

              <strong>
                {networkData.density}
              </strong>

            </div>

            <div className="dna-health-row">

              <span>
                Cross-Case Activity
              </span>

              <strong>
                {networkData.crossCaseLinks}
                {" "}
                LINKS
              </strong>

            </div>

            <div className="dna-health-row">

              <span>
                Active Clusters
              </span>

              <strong>
                {networkData.clusters}
              </strong>

            </div>

            <div className="dna-health-row">

              <span>
                Relationship Coverage
              </span>

              <strong>
                {networkData.relationships}
                {" "}
                CONNECTIONS
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
              How the intelligence
              network has grown over time
            </p>
          </div>

          <TrendingUp
            size={20}
            className="stat-icon"
          />

        </div>

        <div className="evolution-table">

          <div className="evolution-header">

            <span>
              PERIOD
            </span>

            <span>
              ENTITIES
            </span>

            <span>
              RELATIONSHIPS
            </span>

            <span>
              CROSS-CASE LINKS
            </span>

          </div>

          {evolutionData.length > 0 ? (
            evolutionData.map(
              (item) => (
                <div
                  className="evolution-row"
                  key={
                    item.date
                  }
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
                    {
                      item.crossCaseLinks
                    }
                  </span>

                </div>
              )
            )
          ) : (
            <div className="dna-empty-state">
              No evolution data
              available.
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
            Current intelligence
            network overview
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
