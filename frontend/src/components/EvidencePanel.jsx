
function EvidencePanel({ evidence, onClose }) {
  if (!evidence) return null;

  return (
    <div className="evidence-overlay">
      <div className="evidence-panel">
        <div className="evidence-header">
          <div>
            <span className="evidence-label">RELATIONSHIP</span>
            <h2>Evidence Details</h2>
          </div>

          <button
            className="evidence-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="evidence-relationship">
          <div>
            <span>FROM</span>
            <strong>{evidence.source || "Unknown Entity"}</strong>
          </div>

          <div>
            <span>TO</span>
            <strong>{evidence.target || "Unknown Entity"}</strong>
          </div>
        </div>

        <div className="evidence-section">
          <span className="evidence-label">CONNECTION</span>

          <div className="evidence-card">
            <div className="evidence-row">
              <span>Relationship</span>
              <strong>
                {evidence.relationship || "ASSOCIATED_WITH"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Confidence</span>
              <strong>
                {evidence.confidence != null
                  ? `${evidence.confidence}%`
                  : "—"}
              </strong>
            </div>
          </div>
        </div>

        <div className="evidence-section">
          <span className="evidence-label">SUPPORTED BY</span>

          <div className="evidence-card">
            <div className="evidence-row">
              <span>Evidence ID</span>
              <strong>{evidence.evidenceId || "—"}</strong>
            </div>

            <div className="evidence-row">
              <span>Source Document</span>
              <strong>
                {evidence.sourceDocument || "—"}
              </strong>
            </div>

            <div className="evidence-row">
              <span>Page Number</span>
              <strong>{evidence.pageNumber || "—"}</strong>
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

