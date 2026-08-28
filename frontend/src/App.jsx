import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import Copilot from "./pages/Copilot";
import NetworkDNA from "./pages/NetworkDNA";
import Timeline from "./pages/Timeline";

function App() {
return ( <BrowserRouter> <Routes>
    <Route
      path="/"
      element={<Dashboard />}
    />

    <Route
      path="/cases"
      element={<Cases />}
    />

    <Route
      path="/cases/:caseId"
      element={<CaseDetails />}
    />

    <Route
      path="/copilot"
      element={<Copilot />}
    />

    <Route
      path="/network-dna"
      element={<NetworkDNA />}
    />

    <Route
      path="/timeline"
      element={<Timeline />}
    />

  </Routes>
</BrowserRouter>

);
}

export default App;