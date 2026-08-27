import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Copilot() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">
          <h1>Investigator Copilot</h1>
          <p>Ask questions about the investigation network.</p>
        </section>
      </main>
    </div>
  );
}

export default Copilot;