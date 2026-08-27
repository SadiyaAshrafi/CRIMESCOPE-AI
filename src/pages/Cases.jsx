import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function Cases() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Header />

        <section className="dashboard">
          <h1>Cases</h1>
          <p>Investigation cases will appear here.</p>
        </section>
      </main>
    </div>
  );
}

export default Cases;