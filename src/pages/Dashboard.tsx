import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, MapPin, Plane, Loader2, Leaf, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store";
import type { SavedTrip } from "../types";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch("/api/trips", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setTrips(d.trips || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalCarbon = trips.reduce((a, t) => a + (t.carbonKg || 0), 0);
  const totalSpent = trips.reduce((a, t) => a + (t.budget || 0), 0);
  const avgScore = trips.length > 0 ? Math.round(trips.reduce((a, t) => a + (t.antigravityScore || 0), 0) / trips.length) : 0;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="glass-card p-12 rounded-3xl max-w-md mx-auto">
          <LayoutDashboard className="w-12 h-12 text-[var(--color-teal)] mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold font-display mb-2">Sign in to access Dashboard</h2>
          <p className="text-[var(--color-text-secondary)]">Save trips, track spending, and monitor your carbon footprint.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
          Welcome back, <span className="text-gradient">{user.name}</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Your travel command center.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Trips Planned", value: trips.length, icon: "🗺️" },
          { label: "Total Budget", value: `₹${totalSpent.toLocaleString()}`, icon: "💰" },
          { label: "Avg. AG Score", value: avgScore, icon: "⚡" },
          { label: "Carbon (kg)", value: totalCarbon.toFixed(1), icon: "🌱" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-5 rounded-2xl text-center"
          >
            <span className="text-2xl mb-2 block">{stat.icon}</span>
            <p className="text-2xl font-bold font-display text-[var(--color-text)]">{stat.value}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Plan New Trip", icon: Plane, path: "/planner", color: "var(--color-teal)" },
          { label: "Safety Check", icon: MapPin, path: "/safety", color: "var(--color-success)" },
          { label: "Discover Food", icon: TrendingDown, path: "/food", color: "#F97316" },
        ].map((action, i) => (
          <Link key={i} to={action.path}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color + "20" }}>
                <action.icon className="w-6 h-6" style={{ color: action.color }} />
              </div>
              <span className="font-semibold font-display">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Saved Trips */}
      <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-2">
        <Leaf className="w-5 h-5 text-[var(--color-teal)]" /> Your Trips
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-teal)]" />
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center">
          <p className="text-[var(--color-text-secondary)]">No trips saved yet. Plan your first trip!</p>
          <Link to="/planner" className="inline-flex items-center gap-2 mt-4 px-6 py-3 btn-primary rounded-full font-medium text-sm">
            <Plane className="w-4 h-4" /> Start Planning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, i) => (
            <motion.div key={trip.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold font-display text-lg">{trip.destination}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)] font-medium">
                  ⚡ {trip.antigravityScore}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                <span>{trip.days} days</span>
                <span>{trip.travelers} travelers</span>
                <span>₹{trip.budget?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px]">
                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-[var(--color-border)]">{trip.mood}</span>
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">🌱 {trip.carbonKg}kg</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-3">{new Date(trip.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
