
import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

function NetworkGraph({
  nodes = [],
  edges = [],
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
          label: node.name,
          type: node.type,
        },
      })),

      ...edges.map((edge) => ({
        data: {
          id: String(edge.id),
          source: String(edge.source),
          target: String(edge.target),

          label: edge.type,

          confidence: edge.confidence,
          evidenceId: edge.evidenceId,

          sourceName: edge.sourceName,
          targetName: edge.targetName,

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
        animate: true,
        padding: 30,
      },

      style: [
        {
          selector: "node",

          style: {
            label: "data(label)",

            "text-valign": "bottom",
            "text-halign": "center",

            "font-size": "12px",

            "background-color": "#2563eb",

            color: "#e5e7eb",

            "text-outline-color": "#111827",
            "text-outline-width": 2,

            width: 38,
            height: 38,

            "border-width": 2,
            "border-color": "#60a5fa",
          },
        },

        {
          selector: 'node[type="PERSON"]',

          style: {
            "background-color": "#2563eb",
          },
        },

        {
          selector: 'node[type="ORGANIZATION"]',

          style: {
            "background-color": "#7c3aed",
          },
        },

        {
          selector: 'node[type="LOCATION"]',

          style: {
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
    });


    /* NODE CLICK */

    cy.on("tap", "node", (event) => {
      const node = event.target;

      if (!onNodeSelect) return;

      onNodeSelect({
        id: node.data("id"),
        name: node.data("label"),
        type: node.data("type"),
      });
    });


    /* EDGE CLICK */

    cy.on("tap", "edge", (event) => {
      const edge = event.target;

      if (!onNodeSelect) return;

      onNodeSelect({
        id: edge.data("id"),

        type: "RELATIONSHIP",

        source:
          edge.data("sourceName") ||
          edge.source().data("label"),

        target:
          edge.data("targetName") ||
          edge.target().data("label"),

        relationship:
          edge.data("label"),

        relationshipType:
          edge.data("label"),

        confidence:
          edge.data("confidence"),

        evidenceId:
          edge.data("evidenceId"),

        sourceDocument:
          edge.data("sourceDocument"),

        pageNumber:
          edge.data("pageNumber"),

        extractionTimestamp:
          edge.data("extractionTimestamp"),
      });
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
        height: "100%",
        minHeight: "420px",
      }}
    />
  );
}

export default NetworkGraph;

