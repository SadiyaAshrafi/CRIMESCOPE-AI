import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  Users,
  GitBranch,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getIntegrationData } from "../services/api";

function Cases() {
  const navigate = useNavigate();

  const [integrationData, setIntegrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * =========================================================
   * LOAD REAL BACKEND DATA
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
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
              "Unable to load investigation cases."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

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

  const cases = integrationData?.cases ?? [];
  const entities = integrationData?.entities ?? [];
  const relationships =
    integrationData?.relationships ?? [];

  const summary =
    integrationData?.summary ?? {};

  /*
   * =========================================================
   * CASE METRICS
   * =========================================================
   *
   * We calculate per-case entity and relationship counts
   * from the real backend IDs.
   */

  const caseRows = useMemo(() => {
    return cases.map((caseItem) => {
      const caseId = caseItem.case_id;

      const entityCount =
        caseItem.entity_ids?.length ?? 0;

      const relationshipCount =
        caseItem.relationship_ids?.length ?? 0;

      return {
        ...caseItem,

        id: caseId,

        title:
          caseItem.title ||
          caseItem.name ||
          "Untitled Investigation",

        date:
          caseItem.dates?.[0] ||
          caseItem.date ||
          "—",

        entityCount,

        relationshipCount,

        status: "ACTIVE",
      };
    });
  }, [cases]);

  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const totalCases =
    summary.total_cases ??
    caseRows.length;

  const totalEntities =
    summary.total_entities ??
    entities.length;

  const totalRelationships =
    summary.total_relationships ??
    relationships.length;

  /*
   * =========================================================
   * OPEN CASE
   * =========================================================
   */

  const openCase = (caseId) => {
    navigate(
      `/cases/${encodeURIComponent(caseId)}`
    );
  };

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header />

          <section className="dashboard">

            <div className="page-heading">
              <div>
                <h1>
                  Investigation Cases
                </h1>

                <p>
                  Loading investigation intelligence...
                </p>
              </div>
            </div>

            <div className="panel case-not-found">

              <Loader2
                size={30}
                className="spin"
              />

              <h2>
                Loading Cases
              </h2>

              <p>
                Fetching investigation data from
                the intelligence backend.
              </p>

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
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <Header />

          <section className="dashboard">

            <div className="page-heading">
              <div>
                <h1>
                  Investigation Cases
                </h1>

                <p>
                  Manage and review active criminal
                  investigations
                </p>
              </div>
            </div>

            <div className="panel case-not-found">

              <div className="case-not-found-icon">
                <AlertTriangle size={24} />
              </div>

              <h2>
                Backend Connection Failed
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Retry
              </button>

            </div>

          </section>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * MAIN PAGE
   * =========================================================
   */

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-heading">

            <div>
              <h1>
                Investigation Cases
              </h1>

              <p>
                Manage and review active criminal
                investigations
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
            >
              + New Investigation
            </button>

          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="stats-grid">

            {/* ACTIVE CASES */}

            <div className="stat-card">

              <div className="stat-top">

                <span>
                  ACTIVE CASES
                </span>

                <Folder
                  size={18}
                  className="stat-icon"
                />

              </div>

              <div className="stat-value">
                {totalCases}
              </div>

              <div className="stat-description">
                Investigation cases
              </div>

            </div>

            {/* ENTITIES */}

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
                {totalEntities}
              </div>

              <div className="stat-description">
                Unique entities across investigations
              </div>

            </div>

            {/* RELATIONSHIPS */}

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
                {totalRelationships}
              </div>

              <div className="stat-description">
                Known network connections
              </div>

            </div>

            {/* STATUS */}

            <div className="stat-card">

              <div className="stat-top">

                <span>
                  STATUS
                </span>

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

          {/* =================================================
              CASES PANEL
          ================================================= */}

          <div className="panel cases-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Investigation Cases
                </h2>

                <p>
                  Active cases currently available
                  for analysis
                </p>

              </div>

              <span className="case-count">
                {caseRows.length} cases
              </span>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {caseRows.length === 0 ? (

              <div className="timeline-empty">

                <Folder size={28} />

                <h3>
                  No investigation cases
                </h3>

                <p>
                  The backend returned no
                  investigation cases.
                </p>

              </div>

            ) : (

              <div className="cases-list">

                {caseRows.map(
                  (caseItem) => (

                    <div
                      className="case-row"
                      key={caseItem.id}
                    >

                      {/* =====================================
                          CASE INFORMATION
                      ====================================== */}

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

                      {/* =====================================
                          STATUS
                      ====================================== */}

                      <div className="case-status">

                        <span className="case-status-dot" />

                        <span>
                          {caseItem.status}
                        </span>

                      </div>

                      {/* =====================================
                          DATE
                      ====================================== */}

                      <div className="case-date">

                        <span>
                          DATE
                        </span>

                        <strong>
                          {caseItem.date}
                        </strong>

                      </div>

                      {/* =====================================
                          ENTITIES
                      ====================================== */}

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

                      {/* =====================================
                          RELATIONSHIPS
                      ====================================== */}

                      <div className="case-metric">

                        <GitBranch size={16} />

                        <div>

                          <strong>
                            {
                              caseItem.relationshipCount
                            }
                          </strong>

                          <span>
                            Relationships
                          </span>

                        </div>

                      </div>

                      {/* =====================================
                          OPEN CASE
                      ====================================== */}

                      <button
                        type="button"
                        className="case-open-button"
                        onClick={() =>
                          openCase(
                            caseItem.id
                          )
                        }
                      >

                        <span>
                          Open Case
                        </span>

                        <ChevronRight
                          size={15}
                        />

                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>
      </main>
    </div>
  );
}

export default Cases;