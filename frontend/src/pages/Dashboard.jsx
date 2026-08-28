
import { useState } from "react";
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

function Dashboard() {
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">

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

          <div className="stats-grid">
            <StatCard
              title="ACTIVE CASES"
              value="5"
              description="Investigation cases"
              icon={<Folder size={20} />}
            />

            <StatCard
              title="ENTITIES"
              value="27"
              description="People & organizations"
              icon={<Users size={20} />}
            />

            <StatCard
              title="RELATIONSHIPS"
              value="43"
              description="Known connections"
              icon={<GitBranch size={20} />}
            />

            <StatCard
              title="CROSS-CASE LINKS"
              value="8"
              description="Potential connections"
              icon={<Network size={20} />}
            />
          </div>

          <div className="dashboard-grid">

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
                        onNodeSelect={(item) => {
                   if (item.type === "RELATIONSHIP") {
                     setSelectedEvidence(item);
                   }
                  }}
               />
              </div>
            </div>

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
                <div className="insight-alert">!</div>

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
                <div className="insight-alert">!</div>

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

          <div className="panel dna-summary">
            <div>
              <h2>Network DNA</h2>

              <p>
                Current intelligence network overview
              </p>
            </div>

            <div className="dna-values">
              <div>
                <strong>27</strong>
                <span>Entities</span>
              </div>

              <div>
                <strong>43</strong>
                <span>Relationships</span>
              </div>

              <div>
                <strong>5</strong>
                <span>Cases</span>
              </div>

              <div>
                <strong>3</strong>
                <span>Clusters</span>
              </div>

              <div>
                <strong>8</strong>
                <span>Cross-case</span>
              </div>
            </div>
          </div>

        </section>

        <EvidencePanel
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />

      </main>
    </div>
  );
}

export default Dashboard;
