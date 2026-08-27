import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

function NetworkGraph() {
  const graphRef = useRef(null);

  useEffect(() => {
    const cy = cytoscape({
      container: graphRef.current,

      elements: [
        {
          data: {
            id: "ravi",
            label: "Ravi Kumar",
            type: "PERSON",
          },
        },
        {
          data: {
            id: "meridian",
            label: "Meridian Imports",
            type: "ORGANIZATION",
          },
        },
        {
          data: {
            id: "arjun",
            label: "Arjun Mehta",
            type: "PERSON",
          },
        },
        {
          data: {
            id: "eastern",
            label: "Eastern Logistics",
            type: "ORGANIZATION",
          },
        },
        {
          data: {
            id: "neha",
            label: "Neha Sharma",
            type: "PERSON",
          },
        },

        {
          data: {
            id: "r1",
            source: "ravi",
            target: "meridian",
            relationship: "ASSOCIATED_WITH",
          },
        },
        {
          data: {
            id: "r2",
            source: "arjun",
            target: "meridian",
            relationship: "CONNECTED_TO",
          },
        },
        {
          data: {
            id: "r3",
            source: "ravi",
            target: "eastern",
            relationship: "CONNECTED_TO",
          },
        },
        {
          data: {
            id: "r4",
            source: "neha",
            target: "eastern",
            relationship: "ASSOCIATED_WITH",
          },
        },
      ],

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
          },
        },

        {
          selector: 'node[type="ORGANIZATION"]',
          style: {
            "background-color": "#7c3aed",
            "border-color": "#a78bfa",
            shape: "round-rectangle",
            width: 100,
            height: 50,
          },
        },

        {
          selector: 'node[type="PERSON"]',
          style: {
            shape: "ellipse",
          },
        },

        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#405578",
            "target-arrow-color": "#405578",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },

        {
          selector: ":selected",
          style: {
            "border-width": 4,
            "border-color": "#facc15",
          },
        },
      ],

      layout: {
        name: "cose",
        animate: true,
        padding: 50,
      },

      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    cy.on("tap", "node", (event) => {
      const node = event.target;

      console.log("Selected entity:", {
        id: node.id(),
        name: node.data("label"),
        type: node.data("type"),
      });
    });

    cy.on("tap", "edge", (event) => {
      const edge = event.target;

      console.log("Selected relationship:", {
        relationship: edge.data("relationship"),
        source: edge.source().data("label"),
        target: edge.target().data("label"),
      });
    });

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div
      ref={graphRef}
      style={{
        width: "100%",
        height: "390px",
      }}
    />
  );
}

export default NetworkGraph;