import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import NetworkDNA from "./pages/NetworkDNA";
import Timeline from "./pages/Timeline";
import Copilot from "./pages/Copilot";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/cases" element={<Cases />} />

        <Route path="/network-dna" element={<NetworkDNA />} />

        <Route path="/timeline" element={<Timeline />} />

        <Route path="/copilot" element={<Copilot />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;