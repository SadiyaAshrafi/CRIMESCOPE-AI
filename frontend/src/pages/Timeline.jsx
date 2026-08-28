import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Folder,
  MapPin,
  Users,
  GitBranch,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getIntegrationData } from "../services/api";

function Timeline() {
  const [integrationData, setIntegrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            err?.message || "Unable to load investigation timeline."
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

  const cases = integrationData?.cases ?? [];
  const entities = integrationData?.entities ?? [];
  const relationships = integrationData?.relationships ?? [];
  const evidence = integrationData?.evidence ?? [];

  const timelineEvents = useMemo(() => {
    return cases
      .map((caseItem) => {
        const caseDate =
          caseItem.dates?.[0] ||
          caseItem.date ||
          null;

        const caseEntities = entities.filter((entity) =>
          (caseItem.entity_ids ?? []).includes(entity.id)
        );

        const caseRelationships = relationships.filter((relationship) =>
          (caseItem.relationship_ids ?? []).includes(relationship.id)
        );

        const caseEvidence = evidence.filter(
          (item) => item.case_id === caseItem.case_id
        );

        return {
          id: caseItem.case_id,
          caseId: caseItem.case_id,

          title:
            caseItem.title ||
            caseItem.name ||
            caseItem.case_id,

          description:
            caseItem.description ||
            caseItem.summary ||
            "Investigation activity recorded.",

          date: caseDate,

          location:
            caseItem.location ||
            "Location unavailable",

          entityCount: caseEntities.length,
          relationshipCount: caseRelationships.length,
          evidenceCount: caseEvidence.length,

          entities: caseEntities,
          relationships: caseRelationships,
          evidence: caseEvidence,
        };
      })
      .filter((event) => event.date)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );
  }, [cases, entities, relationships, evidence]);

  const totalEvents = timelineEvents.length;
  const totalEvidence = evidence.length;

  const totalLocations = useMemo(() => {
    return new Set(
      timelineEvents
        .map((event) => event.location)
        .filter(Boolean)
    ).size;
  }, [timelineEvents]);

  const latestEvent = timelineEvents[0] ?? null;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDay = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
    });
  };

  const formatMonth = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      month: "short",
    });
  };

  const getEventType = (event) => {
    if (event.relationshipCount > 0) {
      return "NETWORK ACTIVITY";
    }

    if (event.evidenceCount > 0) {
      return "EVIDENCE ACTIVITY";
    }

    return "INVESTIGATION";
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard timeline-page">

          {/* PAGE HEADER */}

          <div className="page-heading">
            <div>
              <h1>Investigation Timeline</h1>

              <p>
                Chronological intelligence across criminal investigations
              </p>
            </div>

            <div className="timeline-live-status">
              <span className="status-dot" />
              LIVE INTELLIGENCE
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2>Backend Connection</h2>

                  <p>
                    Unable to load timeline intelligence.
                  </p>
                </div>

                <AlertTriangle size={20} />
              </div>

              <p>{error}</p>

              <p>
                Make sure the backend is running on
                http://127.0.0.1:8000.
              </p>
            </div>
          )}

          {/* SUMMARY CARDS */}

          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-top">
                <span>EVENTS</span>

                <CalendarDays
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {loading ? "—" : totalEvents}
              </div>

              <div className="stat-description">
                Investigation timeline events
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>EVIDENCE</span>

                <Folder
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {loading ? "—" : totalEvidence}
              </div>

              <div className="stat-description">
                Evidence records available
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>LOCATIONS</span>

                <MapPin
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value">
                {loading ? "—" : totalLocations}
              </div>

              <div className="stat-description">
                Investigation locations
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>LATEST ACTIVITY</span>

                <Clock3
                  size={18}
                  className="stat-icon"
                />
              </div>

              <div className="stat-value case-date-value">
                {loading
                  ? "—"
                  : latestEvent
                  ? formatDate(latestEvent.date)
                  : "—"}
              </div>

              <div className="stat-description">
                Most recent investigation event
              </div>
            </div>

          </div>

          {/* TIMELINE PANEL */}

          <div className="panel timeline-panel">

            <div className="panel-header">
              <div>
                <h2>Investigation Activity</h2>

                <p>
                  Chronological view of backend investigation intelligence
                </p>
              </div>

              <span className="timeline-count">
                {loading
                  ? "Loading..."
                  : `${totalEvents} events`}
              </span>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="timeline-empty">
                <Clock3 size={28} />

                <h3>
                  Loading investigation timeline...
                </h3>

                <p>
                  Fetching cases and investigation activity
                  from the backend.
                </p>
              </div>

            ) : timelineEvents.length === 0 ? (

              /* EMPTY */

              <div className="timeline-empty">
                <CalendarDays size={28} />

                <h3>
                  No timeline events available
                </h3>

                <p>
                  The backend returned no investigation
                  cases with dates.
                </p>
              </div>

            ) : (

              /* TIMELINE */

              <div className="timeline-list">

                {timelineEvents.map((event, index) => (
                  <div
                    className="timeline-item"
                    key={event.id}
                  >

                    {/* DATE */}

                    <div className="timeline-date">
                      <strong>
                        {formatDay(event.date)}
                      </strong>

                      <span>
                        {formatMonth(event.date)}
                      </span>
                    </div>

                    {/* TIMELINE TRACK */}

                    <div className="timeline-track">

                      <div className="timeline-marker">
                        <span />
                      </div>

                      {index <
                        timelineEvents.length - 1 && (
                        <div className="timeline-line" />
                      )}

                    </div>

                    {/* EVENT CONTENT */}

                    <div className="timeline-content">

                      <div className="timeline-event-header">

                        <div>
                          <span className="timeline-event-type">
                            {getEventType(event)}
                          </span>

                          <h3>
                            {event.title}
                          </h3>

                          <span className="timeline-case-id">
                            {event.caseId}
                          </span>
                        </div>

                        <div className="timeline-event-date">
                          <CalendarDays size={14} />

                          {formatDate(event.date)}
                        </div>

                      </div>

                      <p className="timeline-description">
                        {event.description}
                      </p>

                      {/* LOCATION */}

                      <div className="timeline-location">
                        <MapPin size={15} />

                        <span>
                          {event.location}
                        </span>
                      </div>

                      {/* EVENT METRICS */}

                      <div className="timeline-event-metrics">

                        <div className="timeline-metric">
                          <Users size={15} />

                          <div>
                            <strong>
                              {event.entityCount}
                            </strong>

                            <span>
                              Entities
                            </span>
                          </div>
                        </div>

                        <div className="timeline-metric">
                          <GitBranch size={15} />

                          <div>
                            <strong>
                              {event.relationshipCount}
                            </strong>

                            <span>
                              Relationships
                            </span>
                          </div>
                        </div>

                        <div className="timeline-metric">
                          <Folder size={15} />

                          <div>
                            <strong>
                              {event.evidenceCount}
                            </strong>

                            <span>
                              Evidence
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* ENTITY TAGS */}

                      {event.entities.length > 0 && (
                        <div className="timeline-entities">

                          {event.entities
                            .slice(0, 6)
                            .map((entity) => (
                              <span
                                key={entity.id}
                                className="timeline-entity-tag"
                              >
                                {entity.name}
                              </span>
                            ))}

                          {event.entities.length > 6 && (
                            <span className="timeline-entity-tag">
                              +{event.entities.length - 6} more
                            </span>
                          )}

                        </div>
                      )}

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

          {/* TIMELINE INTELLIGENCE */}

          {!loading &&
            timelineEvents.length > 0 && (
              <div className="panel timeline-summary">

                <div>
                  <h2>
                    Timeline Intelligence
                  </h2>

                  <p>
                    Current chronological investigation overview
                  </p>
                </div>

                <div className="dna-values">

                  <div>
                    <strong>
                      {timelineEvents.length}
                    </strong>

                    <span>
                      Events
                    </span>
                  </div>

                  <div>
                    <strong>
                      {cases.length}
                    </strong>

                    <span>
                      Cases
                    </span>
                  </div>

                  <div>
                    <strong>
                      {entities.length}
                    </strong>

                    <span>
                      Entities
                    </span>
                  </div>

                  <div>
                    <strong>
                      {relationships.length}
                    </strong>

                    <span>
                      Relationships
                    </span>
                  </div>

                  <div>
                    <strong>
                      {evidence.length}
                    </strong>

                    <span>
                      Evidence
                    </span>
                  </div>

                </div>

              </div>
            )}

        </section>
      </main>
    </div>
  );
}

export default Timeline;