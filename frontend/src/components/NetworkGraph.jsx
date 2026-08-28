
import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const MOCK_NODES = [
  {
    id: "ravi",
    name: "Ravi Kumar",
    type: "PERSON",
  },
  {
    id: "meridian",
    name: "Meridian Imports",
    type: "ORGANIZATION",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    type: "PERSON",
  },
  {
    id: "eastern",
    name: "Eastern Logistics",
    type: "ORGANIZATION",
  },
  {
    id: "neha",
    name: "Neha Sharma",
    type: "PERSON",
  },
];

const MOCK_EDGES = [
  {
    id: "r1",
    source: "ravi",
    target: "meridian",
    type: "ASSOCIATED_WITH",
    confidence: 91,
    evidenceId: "EVID-101-001",
    sourceDocument: "Case_101.pdf",
    pageNumber: 4,
    extractionTimestamp: "2026-06-10T10:42:00",
  },
  {
    id: "r2",
    source: "arjun",
    target: "meridian",
    type: "CONNECTED_TO",
    confidence: 87,
    evidenceId: "EVID-101-002",
    sourceDocument: "Case_101.pdf",
    pageNumber: 6,
    extractionTimestamp: "2026-06-10T10:44:00",
  },
  {
    id: "r3",
    source: "ravi",
    target: "eastern",
    type: "CONNECTED_TO",
    confidence: 89,
    evidenceId: "EVID-103-001",
    sourceDocument: "Case_103.pdf",
    pageNumber: 7,
    extractionTimestamp: "2026-06-12T09:21:00",
  },
  {
    id: "r4",
    source: "neha",
    target: "eastern",
    type: "ASSOCIATED_WITH",
    confidence: 84,
    evidenceId: "EVID-103-002",
    sourceDocument: "Case_103.pdf",
    pageNumber: 8,
    extractionTimestamp: "2026-06-12T09:25:00",
  },
];

function NetworkGraph({
  nodes = MOCK_NODES,
  edges = MOCK_EDGES,
  onNodeSelect,
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = [
      ...nodes.map((node) => ({
        data: {
          id: String(node.id),
          label: node.name || node.label || node.id,
          type: node.type,
        },
      })),

      ...edges.map((edge) => ({
        data: {
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),
          label:
            edge.type ||
            edge.relationship ||
            edge.relationshipType ||
            "CONNECTED_TO",
          confidence: edge.confidence,
          evidenceId: edge.evidenceId,
          sourceDocument: edge.sourceDocument,
          pageNumber: edge.pageNumber,
          extractionTimestamp: edge.extractionTimestamp,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,

      elements,

      layout: {
        name: "cose",
        animate: false,
        padding: 50,
      },

      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#2563eb",
            color: "#ffffff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "11px",
            width: 55,
            height: 55,
            "border-width": 2,
            "border-color": "#60a5fa",
            "text-wrap": "wrap",
            "text-max-width": "90px",
          },
        },

        {
          selector: 'node[type="PERSON"]',
          style: {
            shape: "ellipse",
            "background-color": "#2563eb",
          },
        },

        {
          selector: 'node[type="ORGANIZATION"]',
          style: {
            shape: "round-rectangle",
            width: 110,
            height: 50,
            "background-color": "#7c3aed",
          },
        },

        {
          selector: 'node[type="LOCATION"]',
          style: {
            shape: "diamond",
            "background-color": "#059669",
          },
        },

        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#64748b",
            "target-arrow-color": "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "9px",
            color: "#cbd5e1",
            "text-background-color": "#111827",
            "text-background-opacity": 0.8,
            "text-background-padding": "3px",
          },
        },

        {
          selector: ":selected",
          style: {
            "border-width": 4,
            "border-color": "#facc15",
            "line-color": "#facc15",
            "target-arrow-color": "#facc15",
          },
        },
      ],

      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.on("tap", "node", (event) => {
      const node = event.target;

      if (onNodeSelect) {
        onNodeSelect({
          id: node.data("id"),
          name: node.data("label"),
          type: node.data("type"),
        });
      }
    });

    cy.on("tap", "edge", (event) => {
      const edge = event.target;

      if (onNodeSelect) {
        onNodeSelect({
          id: edge.data("id"),
          type: "RELATIONSHIP",

          source: edge.source().data("label"),
          target: edge.target().data("label"),

          relationship: edge.data("label"),
          relationshipType: edge.data("label"),

          confidence: edge.data("confidence"),
          evidenceId: edge.data("evidenceId"),

          sourceDocument: edge.data("sourceDocument"),
          pageNumber: edge.data("pageNumber"),
          extractionTimestamp:
            edge.data("extractionTimestamp"),
        });
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [nodes, edges, onNodeSelect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "390px",
      }}
    />
  );
}

export default NetworkGraph;