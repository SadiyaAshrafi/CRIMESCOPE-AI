
function EvidencePanel({ evidence, onClose }) {
  if (!evidence) return null;

  const confidence =
    evidence.confidence != null
      ? `${Math.round(Number(evidence.confidence) * 100)}%`
      : "—";

  return (
    <div className="evidence-overlay">
      <div className="evidence-panel">

        {/* HEADER */}

        <div className="evidence-header">
          <div>
            <span className="evidence-label">
              RELATIONSHIP
            </span>

            <h2>Evidence Details</h2>
          </div>

          <button
            className="evidence-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>


        {/* RELATIONSHIP */}

        <div className="relationship-display">

          <div className="relationship-party">
            <span>FROM</span>
            <strong>
              {evidence.source || "Unknown Entity"}
            </strong>
          </div>


          <div className="relationship-middle">
            <span>→</span>
          </div>


          <div className="relationship-party">
            <span>TO</span>
            <strong>
              {evidence.target || "Unknown Entity"}
            </strong>
          </div>

        </div>


        {/* CONNECTION */}

        <div className="evidence-section">

          <span className="evidence-label">
            CONNECTION
          </span>

          <div className="evidence-card">

            <div className="evidence-row">
              <span>Relationship</span>

              <strong>
                {evidence.relationship ||
                  evidence.relationshipType ||
                  "ASSOCIATED_WITH"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Confidence</span>

              <strong>
                {confidence}
              </strong>
            </div>

          </div>

        </div>


        {/* SUPPORTED BY */}

        <div className="evidence-section">

          <span className="evidence-label">
            SUPPORTED BY
          </span>

          <div className="evidence-card">

            <div className="evidence-row">
              <span>Evidence ID</span>

              <strong>
                {evidence.evidenceId || "—"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Source Document</span>

              <strong>
                {evidence.sourceDocument || "—"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Page Number</span>

              <strong>
                {evidence.pageNumber ?? "—"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Extraction Time</span>

              <strong>
                {evidence.extractionTimestamp || "—"}
              </strong>
            </div>

          </div>

        </div>


        <button className="full-button">
          View Evidence
        </button>

      </div>
    </div>
  );
}

export default EvidencePanel;
