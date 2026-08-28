import { useMemo, useState } from "react";
import {
  Clock3,
  CalendarDays,
  User,
  Building2,
  MapPin,
  FileText,
  Network,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const mockTimelineEvents = [
  {
    id: 1,
    date: "2026-08-27",
    time: "18:42",
    type: "RELATIONSHIP",
    title: "New network relationship identified",
    description:
      "A previously unknown relationship was detected between Ravi Kumar and Eastern Logistics.",
    entity: "Ravi Kumar",
    relatedEntity: "Eastern Logistics",
    location: "Chennai",
    caseId: "CASE-2026-014",
    confidence: 94,
  },
  {
    id: 2,
    date: "2026-08-27",
    time: "15:18",
    type: "EVIDENCE",
    title: "Evidence linked to investigation",
    description:
      "A financial document was connected to an existing investigation and associated entities.",
    entity: "Ravi Kumar",
    relatedEntity: "Financial Record",
    location: "Chennai",
    caseId: "CASE-2026-014",
    confidence: 91,
  },
  {
    id: 3,
    date: "2026-08-26",
    time: "21:05",
    type: "ENTITY",
    title: "New organization identified",
    description:
      "Eastern Logistics was added to the intelligence graph after entity extraction.",
    entity: "Eastern Logistics",
    relatedEntity: null,
    location: "Chennai",
    caseId: "CASE-2026-011",
    confidence: 97,
  },
  {
    id: 4,
    date: "2026-08-26",
    time: "13:27",
    type: "CASE",
    title: "Investigation activity detected",
    description:
      "Multiple entities from an active investigation were connected to an existing network cluster.",
    entity: "CASE-2026-011",
    relatedEntity: "Network Cluster 03",
    location: "Bengaluru",
    caseId: "CASE-2026-011",
    confidence: 88,
  },
  {
    id: 5,
    date: "2026-08-25",
    time: "17:51",
    type: "LOCATION",
    title: "Location association discovered",
    description:
      "A location was identified as a shared point between entities across multiple investigations.",
    entity: "Chennai Port",
    relatedEntity: "Eastern Logistics",
    location: "Chennai",
    caseId: "CASE-2026-009",
    confidence: 86,
  },
  {
    id: 6,
    date: "2026-08-24",
    time: "11:36",
    type: "RELATIONSHIP",
    title: "Cross-case relationship detected",
    description:
      "An entity appearing in two investigations was identified as a potential cross-case connector.",
    entity: "Arun Mehta",
    relatedEntity: "CASE-2026-014",
    location: "Mumbai",
    caseId: "CASE-2026-014",
    confidence: 93,
  },
  {
    id: 7,
    date: "2026-08-23",
    time: "09:14",
    type: "EVIDENCE",
    title: "Communication record processed",
    description:
      "A communication record was processed and matched against entities in the intelligence graph.",
    entity: "Arun Mehta",
    relatedEntity: "Communication Record",
    location: "Mumbai",
    caseId: "CASE-2026-009",
    confidence: 89,
  },
  {
    id: 8,
    date: "2026-08-21",
    time: "16:48",
    type: "ENTITY",
    title: "Person entity added",
    description:
      "A person entity was extracted from newly processed investigation evidence.",
    entity: "Vikram Shah",
    relatedEntity: null,
    location: "Delhi",
    caseId: "CASE-2026-006",
    confidence: 95,
  },
];

const eventTypes = [
  "ALL",
  "RELATIONSHIP",
  "EVIDENCE",
  "ENTITY",
  "CASE",
  "LOCATION",
];

function Timeline() {
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    return mockTimelineEvents.filter((event) => {
      const matchesType =
        selectedType === "ALL" || event.type === selectedType;

      const searchableText = [
        event.title,
        event.description,
        event.entity,
        event.relatedEntity,
        event.location,
        event.caseId,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchTerm.toLowerCase()
      );

      return matchesType && matchesSearch;
    });
  }, [selectedType, searchTerm]);

  const getEventIcon = (type) => {
    switch (type) {
      case "RELATIONSHIP":
        return <Network size={17} />;
      case "EVIDENCE":
        return <FileText size={17} />;
      case "ENTITY":
        return <User size={17} />;
      case "CASE":
        return <CalendarDays size={17} />;
      case "LOCATION":
        return <MapPin size={17} />;
      default:
        return <Clock3 size={17} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard timeline-page">
          <div className="page-heading">
            <div>
              <h1>Network Timeline</h1>
              <p>
                Temporal investigation intelligence across cases and
                relationships
              </p>
            </div>

            <div className="timeline-live-status">
              <span className="status-dot" />
              LIVE TIMELINE
            </div>
          </div>

          <div className="timeline-overview-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>TOTAL EVENTS</span>
                <Clock3 size={18} className="stat-icon" />
              </div>

              <div className="stat-value">{mockTimelineEvents.length}</div>

              <div className="stat-description">
                Intelligence events tracked
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>RELATIONSHIPS</span>
                <Network size={18} className="stat-icon" />
              </div>

              <div className="stat-value">
                {
                  mockTimelineEvents.filter(
                    (event) => event.type === "RELATIONSHIP"
                  ).length
                }
              </div>

              <div className="stat-description">
                Network connections discovered
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>EVIDENCE EVENTS</span>
                <FileText size={18} className="stat-icon" />
              </div>

              <div className="stat-value">
                {
                  mockTimelineEvents.filter(
                    (event) => event.type === "EVIDENCE"
                  ).length
                }
              </div>

              <div className="stat-description">
                Evidence intelligence updates
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>CROSS-CASE</span>
                <Building2 size={18} className="stat-icon" />
              </div>

              <div className="stat-value">3</div>

              <div className="stat-description">
                Events connecting investigations
              </div>
            </div>
          </div>

          <div className="panel timeline-controls-panel">
            <div className="timeline-search">
              <Search size={16} />

              <input
                type="text"
                placeholder="Search timeline events, entities, cases..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="timeline-filter">
              <Filter size={15} />

              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === "ALL" ? "All Events" : type}
                  </option>
                ))}
              </select>

              <ChevronDown size={14} />
            </div>
          </div>

          <div className="panel timeline-panel">
            <div className="panel-header">
              <div>
                <h2>Investigation Activity</h2>
                <p>
                  Chronological intelligence events across the network
                </p>
              </div>

              <span className="timeline-count">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="timeline-list">
              {filteredEvents.length === 0 ? (
                <div className="timeline-empty">
                  <Clock3 size={28} />
                  <h3>No timeline events found</h3>
                  <p>
                    Try changing the search term or event filter.
                  </p>
                </div>
              ) : (
                filteredEvents.map((event, index) => (
                  <div className="timeline-item" key={event.id}>
                    <div className="timeline-date">
                      <strong>{event.date}</strong>
                      <span>{event.time}</span>
                    </div>

                    <div className="timeline-track">
                      <div className="timeline-icon">
                        {getEventIcon(event.type)}
                      </div>

                      {index !== filteredEvents.length - 1 && (
                        <div className="timeline-line" />
                      )}
                    </div>

                    <button
                      className="timeline-event-card"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="timeline-event-top">
                        <span className="timeline-event-type">
                          {event.type}
                        </span>

                        <span className="timeline-confidence">
                          {event.confidence}% confidence
                        </span>
                      </div>

                      <h3>{event.title}</h3>

                      <p>{event.description}</p>

                      <div className="timeline-event-meta">
                        <span>
                          <User size={12} />
                          {event.entity}
                        </span>

                        {event.relatedEntity && (
                          <span>
                            <Network size={12} />
                            {event.relatedEntity}
                          </span>
                        )}

                        <span>
                          <MapPin size={12} />
                          {event.location}
                        </span>

                        <span className="timeline-case">
                          {event.caseId}
                        </span>
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedEvent && (
            <div
              className="timeline-detail-overlay"
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className="timeline-detail-panel"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="panel-header">
                  <div>
                    <span className="timeline-detail-label">
                      INTELLIGENCE EVENT
                    </span>

                    <h2>{selectedEvent.title}</h2>

                    <p>
                      {selectedEvent.date} · {selectedEvent.time}
                    </p>
                  </div>

                  <button
                    className="timeline-detail-close"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="timeline-detail-body">
                  <div className="timeline-detail-description">
                    <span>EVENT DESCRIPTION</span>
                    <p>{selectedEvent.description}</p>
                  </div>

                  <div className="timeline-detail-grid">
                    <div>
                      <span>EVENT TYPE</span>
                      <strong>{selectedEvent.type}</strong>
                    </div>

                    <div>
                      <span>CONFIDENCE</span>
                      <strong>{selectedEvent.confidence}%</strong>
                    </div>

                    <div>
                      <span>PRIMARY ENTITY</span>
                      <strong>{selectedEvent.entity}</strong>
                    </div>

                    <div>
                      <span>RELATED ENTITY</span>
                      <strong>
                        {selectedEvent.relatedEntity || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>LOCATION</span>
                      <strong>{selectedEvent.location}</strong>
                    </div>

                    <div>
                      <span>CASE</span>
                      <strong>{selectedEvent.caseId}</strong>
                    </div>
                  </div>
                </div>

                <button
                  className="primary-button timeline-detail-button"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close Intelligence
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Timeline;