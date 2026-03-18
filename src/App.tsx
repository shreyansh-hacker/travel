import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Dashboard from "./pages/Dashboard";
import Safety from "./pages/Safety";
import FoodExplorer from "./pages/FoodExplorer";
import Activities from "./pages/Activities";
import Profile from "./pages/Profile";
import ImageEditor from "./pages/ImageEditor";
import Chatbot from "./components/Chatbot";
import { useThemeStore } from "./store";

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-navy)] text-[var(--color-text)] font-sans selection:bg-[var(--color-teal)]/30 relative overflow-hidden transition-colors duration-300">
        {/* Global Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-grad-1)] blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-teal)] blur-[120px] mix-blend-screen opacity-50" />
          <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] rounded-full bg-[var(--color-grad-3)] blur-[100px] mix-blend-screen opacity-20" />
        </div>

        <Navbar />
        <main className="pt-20 relative z-10">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/food" element={<FoodExplorer />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/editor" element={<ImageEditor />} />
            </Routes>
          </PageTransition>
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}
