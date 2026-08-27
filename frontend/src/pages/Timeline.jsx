import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Timeline() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">
          <h1>Network Timeline</h1>
          <p>Temporal investigation intelligence.</p>
        </section>
      </main>
    </div>
  );
}

export default Timeline;