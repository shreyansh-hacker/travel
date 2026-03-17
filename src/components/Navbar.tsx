import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ImagePlus, Map, User, LogOut } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuthStore } from "../store";

export default function Navbar() {
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, setUser, logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // In a real app, verify token with backend. For now, we'll just mock it or decode it.
      // Since we don't have a /me route yet, we'll just assume they are logged in if token exists.
      // Actually, let's just clear it if no user object is in state for simplicity, or add a quick fetch.
    }
  }, []);

  const links = [
    { name: "Home", path: "/", icon: Compass },
    { name: "AI Planner", path: "/planner", icon: Map },
    { name: "Image Editor", path: "/editor", icon: ImagePlus },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold tracking-tight font-display">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-grad-1)] to-[var(--color-teal)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Compass className="w-6 h-6" />
              <div className="absolute inset-0 rounded-xl border border-white/20" />
            </div>
            <span>Aero<span className="text-gradient">Voyage</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-[var(--color-ocean)]/50 border border-white/5 backdrop-blur-md">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 relative z-10">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[var(--color-teal)]" : ""}`} />
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-300 hidden md:block">Hi, <span className="text-white font-medium">{user.name}</span></span>
                <button 
                  onClick={logout}
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)] hover:border-[var(--color-error)]/50 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(userData) => setUser(userData)}
      />
    </>
  );
}
