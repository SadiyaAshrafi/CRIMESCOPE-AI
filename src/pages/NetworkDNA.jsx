import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function NetworkDNA() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">
          <h1>Network DNA</h1>
          <p>Network intelligence overview.</p>
        </section>
      </main>
    </div>
  );
}

export default NetworkDNA;