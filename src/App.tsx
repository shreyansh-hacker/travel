import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import ImageEditor from "./pages/ImageEditor";
import Chatbot from "./components/Chatbot";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-navy)] text-zinc-50 font-sans selection:bg-[var(--color-teal)]/30 relative overflow-hidden">
        {/* Global Particle Background (simplified) */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-grad-1)] blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-teal)] blur-[120px] mix-blend-screen opacity-50" />
        </div>

        <Navbar />
        <main className="pt-20 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/editor" element={<ImageEditor />} />
          </Routes>
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}
