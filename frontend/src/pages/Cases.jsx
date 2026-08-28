
import { useNavigate } from "react-router-dom";
import { Folder, Users, GitBranch, ChevronRight } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { mockCases } from "../data/MockData";

function Cases() {
  const navigate = useNavigate();

  const totalEntities = mockCases.reduce(
    (total, caseItem) => total + caseItem.entityCount,
    0
  );

  const totalRelationships = mockCases.reduce(
    (total, caseItem) => total + caseItem.relationshipCount,
    0
  );

  const openCase = (caseId) => {
    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">
          {/* PAGE HEADER */}
          <div className="page-heading">
            <div>
              <h1>Investigation Cases</h1>

              <p>
                Manage and review active criminal investigations
              </p>
            </div>

            <button className="primary-button">
              + New Investigation
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>ACTIVE CASES</span>
                <Folder size={18} className="stat-icon" />
              </div>

              <div className="stat-value">
                {mockCases.length}
              </div>

              <div className="stat-description">
                Investigation cases
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>ENTITIES</span>
                <Users size={18} className="stat-icon" />
              </div>

              <div className="stat-value">
                {totalEntities}
              </div>

              <div className="stat-description">
                Entities across cases
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>RELATIONSHIPS</span>
                <GitBranch size={18} className="stat-icon" />
              </div>

              <div className="stat-value">
                {totalRelationships}
              </div>

              <div className="stat-description">
                Known connections
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>STATUS</span>

                <span className="status-indicator">
                  <span className="status-dot" />
                  LIVE
                </span>
              </div>

              <div className="stat-value">
                ACTIVE
              </div>

              <div className="stat-description">
                Current investigation status
              </div>
            </div>
          </div>

          {/* CASES PANEL */}
          <div className="panel cases-panel">
            <div className="panel-header">
              <div>
                <h2>Investigation Cases</h2>

                <p>
                  Active cases currently available for analysis
                </p>
              </div>

              <span className="case-count">
                {mockCases.length} cases
              </span>
            </div>

            <div className="cases-list">
              {mockCases.map((caseItem) => (
                <div
                  className="case-row"
                  key={caseItem.id}
                >
                  {/* CASE INFORMATION */}
                  <div className="case-main">
                    <div className="case-icon">
                      <Folder size={18} />
                    </div>

                    <div className="case-info">
                      <div className="case-title">
                        {caseItem.title}
                      </div>

                      <div className="case-id">
                        {caseItem.id}
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="case-status">
                    <span className="case-status-dot" />
                    <span>{caseItem.status}</span>
                  </div>

                  {/* DATE */}
                  <div className="case-date">
                    <span>DATE</span>

                    <strong>
                      {caseItem.date}
                    </strong>
                  </div>

                  {/* ENTITIES */}
                  <div className="case-metric">
                    <Users size={16} />

                    <div>
                      <strong>
                        {caseItem.entityCount}
                      </strong>

                      <span>
                        Entities
                      </span>
                    </div>
                  </div>

                  {/* RELATIONSHIPS */}
                  <div className="case-metric">
                    <GitBranch size={16} />

                    <div>
                      <strong>
                        {caseItem.relationshipCount}
                      </strong>

                      <span>
                        Relationships
                      </span>
                    </div>
                  </div>

                  {/* OPEN CASE */}
                  <button
                    type="button"
                    className="case-open-button"
                    onClick={() => openCase(caseItem.id)}
                  >
                    <span>Open Case</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Cases;
