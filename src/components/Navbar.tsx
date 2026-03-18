import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ImagePlus, Map, User, LogOut, LayoutDashboard, Shield, UtensilsCrossed, Sun, Moon, Ticket } from "lucide-react";
import AuthModal from "./AuthModal";
import { useAuthStore, useThemeStore } from "../store";

export default function Navbar() {
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, setUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.user) setUser(d.user); else localStorage.removeItem("token"); })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const links = [
    { name: "Home", path: "/", icon: Compass },
    { name: "Planner", path: "/planner", icon: Map },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Safety", path: "/safety", icon: Shield },
    { name: "Food", path: "/food", icon: UtensilsCrossed },
    { name: "Activities", path: "/activities", icon: Ticket },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight font-display">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-grad-1)] to-[var(--color-teal)] flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Compass className="w-5 h-5" />
            </div>
            <span>Aero<span className="text-gradient">Voyage</span></span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[var(--color-ocean)]/50 border border-[var(--color-border)] backdrop-blur-md">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}
                  className={`relative px-3 py-2 rounded-full text-xs font-medium transition-colors ${isActive ? "text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"}`}
                >
                  <span className="flex items-center gap-1.5 relative z-10">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--color-teal)]" : ""}`} />
                    {link.name}
                  </span>
                  {isActive && (
                    <motion.div layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme}
              className="p-2 rounded-full border border-[var(--color-border)] hover:bg-white/5 transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[var(--color-warning)]" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-sm text-[var(--color-text-secondary)] hidden md:block">
                  Hi, <span className="text-[var(--color-text)] font-medium">{user.name}</span>
                </Link>
                <button onClick={logout}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-error)]/20 hover:text-[var(--color-error)] hover:border-[var(--color-error)]/50 transition-colors text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:bg-white/5 transition-colors text-xs font-medium"
              >
                <User className="w-3.5 h-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={(u) => setUser(u)} />
    </>
  );
}
