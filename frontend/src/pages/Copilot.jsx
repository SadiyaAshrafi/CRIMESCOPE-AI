
import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Network,
  Search,
  ShieldAlert,
  Clock3,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Copilot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const suggestedQueries = [
    "Show connections between suspects across cases",
    "Who are the most connected entities?",
    "Find potential cross-case links",
    "Summarize the current investigation network",
  ];

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

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
          "I’m analyzing the investigation network. Real-time intelligence from the graph and evidence APIs will appear here once the backend is connected.",
      },
    ]);

    setQuery("");
  };

  const handleSuggestedQuery = (suggestion) => {
    setQuery(suggestion);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard copilot-page">
          {/* PAGE HEADER */}
          <div className="page-heading copilot-heading">
            <div>
              <div className="copilot-title">
                <div className="copilot-title-icon">
                  <Bot size={22} />
                </div>

                <div>
                  <h1>Investigator Copilot</h1>

                  <p>
                    AI-assisted intelligence for investigation and network
                    analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="copilot-status">
              <span className="status-dot" />
              INTELLIGENCE READY
            </div>
          </div>

          {/* MAIN COPILOT */}
          <div className="copilot-layout">
            {/* CHAT */}
            <div className="panel copilot-chat-panel">
              <div className="panel-header">
                <div>
                  <h2>Investigation Assistant</h2>

                  <p>
                    Ask natural-language questions about the intelligence
                    network
                  </p>
                </div>

                <Sparkles size={19} className="stat-icon" />
              </div>

              {/* EMPTY STATE */}
              {messages.length === 0 ? (
                <div className="copilot-empty">
                  <div className="copilot-empty-icon">
                    <Bot size={30} />
                  </div>

                  <h2>How can I help with your investigation?</h2>

                  <p>
                    Query relationships, entities, cases and cross-case
                    intelligence using natural language.
                  </p>

                  <div className="copilot-suggestions">
                    {suggestedQueries.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestedQuery(suggestion)}
                      >
                        <Search size={14} />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
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

                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT */}
              <form className="copilot-input-area" onSubmit={handleSubmit}>
                <div className="copilot-input-wrapper">
                  <Search size={17} />

                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ask Copilot about the investigation network..."
                    aria-label="Ask Investigator Copilot"
                  />

                  <button
                    type="submit"
                    className="copilot-send-button"
                    aria-label="Send query"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>

            {/* INTELLIGENCE SIDEBAR */}
            <div className="copilot-side-column">
              <div className="panel copilot-intelligence-panel">
                <div className="panel-header">
                  <div>
                    <h2>Intelligence Context</h2>

                    <p>Available investigation signals</p>
                  </div>

                  <Network size={19} className="stat-icon" />
                </div>

                <div className="copilot-context-list">
                  <div className="copilot-context-row">
                    <div className="copilot-context-icon">
                      <Network size={16} />
                    </div>

                    <div>
                      <strong>Network Graph</strong>
                      <span>Entity relationships</span>
                    </div>

                    <b>READY</b>
                  </div>

                  <div className="copilot-context-row">
                    <div className="copilot-context-icon">
                      <ShieldAlert size={16} />
                    </div>

                    <div>
                      <strong>Case Intelligence</strong>
                      <span>Investigation records</span>
                    </div>

                    <b>READY</b>
                  </div>

                  <div className="copilot-context-row">
                    <div className="copilot-context-icon">
                      <Search size={16} />
                    </div>

                    <div>
                      <strong>Evidence</strong>
                      <span>Evidence relationships</span>
                    </div>

                    <b>READY</b>
                  </div>

                  <div className="copilot-context-row">
                    <div className="copilot-context-icon">
                      <Clock3 size={16} />
                    </div>

                    <div>
                      <strong>Timeline</strong>
                      <span>Temporal intelligence</span>
                    </div>

                    <b>READY</b>
                  </div>
                </div>
              </div>

              <div className="panel copilot-capabilities-panel">
                <div className="panel-header">
                  <div>
                    <h2>Copilot Capabilities</h2>

                    <p>Supported intelligence tasks</p>
                  </div>
                </div>

                <div className="copilot-capabilities">
                  <div>
                    <Sparkles size={15} />
                    <span>Cross-case analysis</span>
                  </div>

                  <div>
                    <Network size={15} />
                    <span>Relationship discovery</span>
                  </div>

                  <div>
                    <ShieldAlert size={15} />
                    <span>Risk indicators</span>
                  </div>

                  <div>
                    <Clock3 size={15} />
                    <span>Timeline analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Copilot;
