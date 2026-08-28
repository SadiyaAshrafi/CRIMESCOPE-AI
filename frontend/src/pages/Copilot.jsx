import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Network,
  Search,
  ShieldAlert,
  Clock3,
  Loader2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import { getIntelligenceSummary } from "../services/api";

function Copilot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");

  const suggestedQueries = [
    "Show connections between suspects across cases",
    "Who are the most connected entities?",
    "Find potential cross-case links",
    "Summarize the current investigation network",
  ];

  /*
   * =========================================================
   * LOAD REAL BACKEND INTELLIGENCE
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadIntelligence = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getIntelligenceSummary();

        if (mounted) {
          setIntelligence(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load investigation intelligence."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadIntelligence();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =========================================================
   * BACKEND DATA
   * =========================================================
   */

  const summary = intelligence?.summary ?? {};

  const crossCaseEntities =
    intelligence?.cross_case_entities ?? [];

  const topConnectedEntities =
    intelligence?.top_connected_entities ?? [];

  const highConfidenceRelationships =
    intelligence?.high_confidence_relationships ?? [];

  const caseInsights =
    intelligence?.case_insights ?? [];

  /*
   * =========================================================
   * FORMAT INTELLIGENCE ANSWER
   * =========================================================
   */

  const generateAnswer = (question) => {
    const normalized = question.toLowerCase();

    /*
     * CROSS-CASE CONNECTIONS
     */

    if (
      normalized.includes("cross-case") ||
      normalized.includes("cross case") ||
      normalized.includes("suspects across cases") ||
      normalized.includes("connections between suspects")
    ) {
      if (crossCaseEntities.length === 0) {
        return "No cross-case entities were identified in the current investigation data.";
      }

      const people = crossCaseEntities.filter(
        (entity) => entity.type === "PERSON"
      );

      const organizations = crossCaseEntities.filter(
        (entity) => entity.type === "ORGANIZATION"
      );

      const locations = crossCaseEntities.filter(
        (entity) => entity.type === "LOCATION"
      );

      let answer =
        `I found ${crossCaseEntities.length} entities appearing across multiple cases. ` +
        `There are ${summary.cross_case_entities ?? crossCaseEntities.length} cross-case entities in the current intelligence set.`;

      if (people.length > 0) {
        answer += `\n\nPeople appearing across cases:\n`;

        people.forEach((person) => {
          answer += `• ${person.name} — ${person.case_ids.join(", ")}\n`;
        });
      }

      if (organizations.length > 0) {
        answer += `\nOrganizations:\n`;

        organizations.forEach((organization) => {
          answer += `• ${organization.name} — ${organization.case_ids.join(", ")}\n`;
        });
      }

      if (locations.length > 0) {
        answer += `\nLocations:\n`;

        locations.forEach((location) => {
          answer += `• ${location.name} — ${location.case_ids.join(", ")}\n`;
        });
      }

      return answer;
    }

    /*
     * MOST CONNECTED ENTITIES
     */

    if (
      normalized.includes("most connected") ||
      normalized.includes("most connections") ||
      normalized.includes("connected entities") ||
      normalized.includes("highest connection")
    ) {
      if (topConnectedEntities.length === 0) {
        return "No connected-entity intelligence is currently available.";
      }

      let answer =
        "The most connected entities in the current investigation network are:\n\n";

      topConnectedEntities
        .slice(0, 7)
        .forEach((entity, index) => {
          answer +=
            `${index + 1}. ${entity.name} ` +
            `(${entity.type}) — ${entity.connection_count} connections\n`;
        });

      return answer;
    }

    /*
     * NETWORK SUMMARY
     */

    if (
      normalized.includes("summarize") ||
      normalized.includes("summary") ||
      normalized.includes("current investigation network") ||
      normalized.includes("investigation network")
    ) {
      return (
        `Current investigation network summary:\n\n` +
        `• ${summary.total_cases ?? 0} cases\n` +
        `• ${summary.unique_entities ?? 0} unique entities\n` +
        `• ${summary.total_relationships ?? 0} relationships\n` +
        `• ${summary.cross_case_entities ?? 0} cross-case entities\n` +
        `• ${summary.high_confidence_relationships ?? 0} high-confidence relationships\n\n` +
        `The network currently contains ${summary.total_cases ?? 0} investigations with ` +
        `${summary.unique_entities ?? 0} unique entities and ` +
        `${summary.total_relationships ?? 0} recorded relationships.`
      );
    }

    /*
     * HIGH CONFIDENCE RELATIONSHIPS
     */

    if (
      normalized.includes("relationship") ||
      normalized.includes("connections") ||
      normalized.includes("links")
    ) {
      if (highConfidenceRelationships.length === 0) {
        return "No high-confidence relationships are currently available.";
      }

      let answer =
        `I found ${highConfidenceRelationships.length} high-confidence relationships in the current intelligence response:\n\n`;

      highConfidenceRelationships.forEach((relationship) => {
        const confidence = Math.round(
          relationship.confidence * 100
        );

        answer +=
          `• ${relationship.source} → ${relationship.target}\n` +
          `  ${relationship.relationship} · ${confidence}% confidence · ${relationship.date}\n`;
      });

      return answer;
    }

    /*
     * CASES
     */

    if (
      normalized.includes("cases") ||
      normalized.includes("investigations")
    ) {
      if (caseInsights.length === 0) {
        return "No case intelligence is currently available.";
      }

      let answer =
        `There are ${caseInsights.length} investigation cases in the current intelligence dataset:\n\n`;

      caseInsights.forEach((caseItem) => {
        answer +=
          `• ${caseItem.case_id} — ${caseItem.title}\n` +
          `  ${caseItem.entity_count} entities · ` +
          `${caseItem.relationship_count} relationships · ` +
          `${caseItem.evidence_count} evidence record\n`;
      });

      return answer;
    }

    /*
     * FALLBACK
     */

    return (
      "I can analyze the currently available investigation intelligence. " +
      "Try asking about cross-case connections, the most connected entities, " +
      "relationships, cases, or a summary of the investigation network."
    );
  };

  /*
   * =========================================================
   * SUBMIT QUERY
   * =========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery || thinking) {
      return;
    }

    if (!intelligence) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          type: "user",
          text: trimmedQuery,
        },
        {
          id: Date.now() + 1,
          type: "assistant",
          text:
            "Investigation intelligence is still loading. Please try again in a moment.",
        },
      ]);

      setQuery("");

      return;
    }

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: trimmedQuery,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setQuery("");
    setThinking(true);

    await new Promise((resolve) =>
      setTimeout(resolve, 350)
    );

    const answer = generateAnswer(trimmedQuery);

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        type: "assistant",
        text: answer,
      },
    ]);

    setThinking(false);
  };

  /*
   * =========================================================
   * SUGGESTED QUERY
   * =========================================================
   */

  const handleSuggestedQuery = (suggestion) => {
    setQuery(suggestion);
  };

  /*
   * =========================================================
   * CONTEXT STATUS
   * =========================================================
   */

  const contextStatus = useMemo(() => {
    if (loading) {
      return "CONNECTING";
    }

    if (error) {
      return "OFFLINE";
    }

    return "READY";
  }, [loading, error]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard copilot-page">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-heading copilot-heading">
            <div>
              <div className="copilot-title">

                <div className="copilot-title-icon">
                  <Bot size={22} />
                </div>

                <div>
                  <h1>Investigator Copilot</h1>

                  <p>
                    AI-assisted intelligence for investigation
                    and network analysis
                  </p>
                </div>

              </div>
            </div>

            <div className="copilot-status">
              <span className="status-dot" />

              {contextStatus === "CONNECTING"
                ? "CONNECTING"
                : contextStatus === "OFFLINE"
                ? "INTELLIGENCE OFFLINE"
                : "INTELLIGENCE READY"}
            </div>
          </div>

          {/* =================================================
              BACKEND ERROR
          ================================================= */}

          {error && (
            <div className="panel">
              <div className="panel-header">

                <div>
                  <h2>Intelligence Connection</h2>

                  <p>
                    Unable to load intelligence-summary
                    from the backend.
                  </p>
                </div>

                <ShieldAlert
                  size={19}
                  className="stat-icon"
                />

              </div>

              <p>{error}</p>

              <p>
                Make sure the backend is running on
                http://127.0.0.1:8000.
              </p>
            </div>
          )}

          {/* =================================================
              MAIN COPILOT
          ================================================= */}

          <div className="copilot-layout">

            {/* =================================================
                CHAT
            ================================================= */}

            <div className="panel copilot-chat-panel">

              <div className="panel-header">

                <div>
                  <h2>
                    Investigation Assistant
                  </h2>

                  <p>
                    Ask natural-language questions about the
                    intelligence network
                  </p>
                </div>

                <Sparkles
                  size={19}
                  className="stat-icon"
                />

              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (
                <div className="copilot-empty">

                  <div className="copilot-empty-icon">
                    <Loader2
                      size={30}
                      className="copilot-loading-icon"
                    />
                  </div>

                  <h2>
                    Connecting to intelligence engine...
                  </h2>

                  <p>
                    Loading investigation network intelligence
                    from the backend.
                  </p>

                </div>
              ) : messages.length === 0 ? (

                /* =================================================
                    EMPTY STATE
                ================================================= */

                <div className="copilot-empty">

                  <div className="copilot-empty-icon">
                    <Bot size={30} />
                  </div>

                  <h2>
                    How can I help with your investigation?
                  </h2>

                  <p>
                    Query relationships, entities, cases and
                    cross-case intelligence using natural
                    language.
                  </p>

                  <div className="copilot-suggestions">

                    {suggestedQueries.map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() =>
                            handleSuggestedQuery(
                              suggestion
                            )
                          }
                        >
                          <Search size={14} />

                          <span>
                            {suggestion}
                          </span>
                        </button>
                      )
                    )}

                  </div>

                </div>
              ) : (

                /* =================================================
                    MESSAGES
                ================================================= */

                <div className="copilot-messages">

                  {messages.map((message) => (

                    <div
                      key={message.id}
                      className={`copilot-message ${
                        message.type === "user"
                          ? "copilot-message-user"
                          : "copilot-message-assistant"
                      }`}
                    >

                      <div className="copilot-message-icon">

                        {message.type === "user" ? (
                          <User size={15} />
                        ) : (
                          <Bot size={15} />
                        )}

                      </div>

                      <div className="copilot-message-body">

                        <span>
                          {message.type === "user"
                            ? "INVESTIGATOR"
                            : "COPILOT"}
                        </span>

                        <p
                          style={{
                            whiteSpace: "pre-line",
                          }}
                        >
                          {message.text}
                        </p>

                      </div>

                    </div>

                  ))}

                  {thinking && (
                    <div className="copilot-message copilot-message-assistant">

                      <div className="copilot-message-icon">
                        <Bot size={15} />
                      </div>

                      <div className="copilot-message-body">

                        <span>COPILOT</span>

                        <p>
                          Analyzing investigation intelligence...
                        </p>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* =================================================
                  INPUT
              ================================================= */}

              <form
                className="copilot-input-area"
                onSubmit={handleSubmit}
              >

                <div className="copilot-input-wrapper">

                  <Search size={17} />

                  <input
                    type="text"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Ask Copilot about the investigation network..."
                    aria-label="Ask Investigator Copilot"
                    disabled={loading || thinking}
                  />

                  <button
                    type="submit"
                    className="copilot-send-button"
                    aria-label="Send query"
                    disabled={loading || thinking}
                  >
                    {thinking ? (
                      <Loader2
                        size={16}
                        className="copilot-loading-icon"
                      />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>

                </div>

              </form>

            </div>

            {/* =================================================
                INTELLIGENCE SIDEBAR
            ================================================= */}

            <div className="copilot-side-column">

              <div className="panel copilot-intelligence-panel">

                <div className="panel-header">

                  <div>
                    <h2>
                      Intelligence Context
                    </h2>

                    <p>
                      Available investigation signals
                    </p>
                  </div>

                  <Network
                    size={19}
                    className="stat-icon"
                  />

                </div>

                <div className="copilot-context-list">

                  <div className="copilot-context-row">

                    <div className="copilot-context-icon">
                      <Network size={16} />
                    </div>

                    <div>
                      <strong>
                        Network Graph
                      </strong>

                      <span>
                        {summary.total_relationships ?? 0}
                        {" "}relationships
                      </span>
                    </div>

                    <b>
                      {contextStatus}
                    </b>

                  </div>

                  <div className="copilot-context-row">

                    <div className="copilot-context-icon">
                      <ShieldAlert size={16} />
                    </div>

                    <div>
                      <strong>
                        Case Intelligence
                      </strong>

                      <span>
                        {summary.total_cases ?? 0}
                        {" "}investigations
                      </span>
                    </div>

                    <b>
                      {contextStatus}
                    </b>

                  </div>

                  <div className="copilot-context-row">

                    <div className="copilot-context-icon">
                      <Search size={16} />
                    </div>

                    <div>
                      <strong>
                        Evidence
                      </strong>

                      <span>
                        Investigation evidence signals
                      </span>
                    </div>

                    <b>
                      {contextStatus}
                    </b>

                  </div>

                  <div className="copilot-context-row">

                    <div className="copilot-context-icon">
                      <Clock3 size={16} />
                    </div>

                    <div>
                      <strong>
                        Timeline
                      </strong>

                      <span>
                        Temporal intelligence
                      </span>
                    </div>

                    <b>
                      {contextStatus}
                    </b>

                  </div>

                </div>

              </div>

              {/* =================================================
                  CAPABILITIES
              ================================================= */}

              <div className="panel copilot-capabilities-panel">

                <div className="panel-header">

                  <div>
                    <h2>
                      Copilot Capabilities
                    </h2>

                    <p>
                      Supported intelligence tasks
                    </p>
                  </div>

                </div>

                <div className="copilot-capabilities">

                  <div>
                    <Sparkles size={15} />
                    <span>
                      Cross-case analysis
                    </span>
                  </div>

                  <div>
                    <Network size={15} />
                    <span>
                      Relationship discovery
                    </span>
                  </div>

                  <div>
                    <ShieldAlert size={15} />
                    <span>
                      Risk indicators
                    </span>
                  </div>

                  <div>
                    <Clock3 size={15} />
                    <span>
                      Timeline analysis
                    </span>
                  </div>

                </div>

              </div>

              {/* =================================================
                  LIVE NETWORK STATS
              ================================================= */}

              {!loading && !error && (
                <div className="panel copilot-live-stats">

                  <div className="panel-header">

                    <div>
                      <h2>
                        Live Intelligence
                      </h2>

                      <p>
                        Current backend graph signals
                      </p>
                    </div>

                  </div>

                  <div className="dna-values">

                    <div>
                      <strong>
                        {summary.total_cases ?? 0}
                      </strong>

                      <span>
                        Cases
                      </span>
                    </div>

                    <div>
                      <strong>
                        {summary.unique_entities ?? 0}
                      </strong>

                      <span>
                        Entities
                      </span>
                    </div>

                    <div>
                      <strong>
                        {summary.total_relationships ?? 0}
                      </strong>

                      <span>
                        Relationships
                      </span>
                    </div>

                    <div>
                      <strong>
                        {summary.cross_case_entities ?? 0}
                      </strong>

                      <span>
                        Cross-case
                      </span>
                    </div>

                    <div>
                      <strong>
                        {summary.high_confidence_relationships ?? 0}
                      </strong>

                      <span>
                        High confidence
                      </span>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>
      </main>
    </div>
  );
}

export default Copilot;