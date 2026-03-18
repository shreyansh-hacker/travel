import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Loader2, MapPin, Clock, IndianRupee, Briefcase, CloudSun } from "lucide-react";
import type { ActivityResult } from "../types";

export default function Activities() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(5);
  const [mood, setMood] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActivityResult | null>(null);

  const suggest = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/activity-suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, mood, budget: 50000 }),
      });
      if (!r.ok) throw new Error();
      setResult(await r.json());
    } catch { alert("Failed to get suggestions."); }
    finally { setLoading(false); }
  };

  const TYPE_COLORS: Record<string, string> = {
    cultural: "#8b5cf6", adventure: "#F97316", relaxation: "#06B6D4",
    nightlife: "#EC4899", nature: "#10B981", shopping: "#F59E0B",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
          Activity <span className="text-gradient">Planner</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Smart activity suggestions with packing list & weather awareness.</p>
      </motion.div>

      <div className="glass-card p-6 rounded-3xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
            <input value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="Destination" onKeyDown={e => e.key === "Enter" && suggest()}
              className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all"
            />
          </div>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))} min={1} max={30}
            className="md:w-24 bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all text-center"
            placeholder="Days"
          />
          <select value={mood} onChange={e => setMood(e.target.value)}
            className="md:w-36 bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all appearance-none"
          >
            {["balanced", "chill", "adventure", "cultural", "luxury", "backpacker"].map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
          <button onClick={suggest} disabled={loading || !destination.trim()}
            className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ticket className="w-5 h-5" />}
            {loading ? "Thinking…" : "Suggest"}
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Weather + Best Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <CloudSun className="w-8 h-8 text-[var(--color-warning)]" />
              <div>
                <p className="font-semibold text-sm">Weather Forecast</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{result.weatherForecast}</p>
              </div>
            </div>
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <Clock className="w-8 h-8 text-[var(--color-teal)]" />
              <div>
                <p className="font-semibold text-sm">Best Time to Visit</p>
                <p className="text-xs text-[var(--color-text-secondary)]">{result.bestTimeToVisit}</p>
              </div>
            </div>
          </div>

          {/* Activities Grid */}
          <div>
            <h2 className="text-2xl font-bold font-display mb-4">🎯 Suggested Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(result.activities || []).map((act, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{act.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: (TYPE_COLORS[act.type] || "#666") + "20", color: TYPE_COLORS[act.type] || "#aaa" }}
                    >{act.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mb-2">
                    <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" /> ₹{act.cost}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {act.duration}</span>
                    <span>⭐ {act.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] mb-2">
                    <span>Best: {act.bestTime}</span>
                    <span className={`px-1.5 py-0.5 rounded-full ${act.crowdLevel === "low" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : act.crowdLevel === "high" ? "bg-[var(--color-error)]/10 text-[var(--color-error)]" : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"}`}>
                      Crowd: {act.crowdLevel}
                    </span>
                    {act.weatherDependent && <span className="text-[var(--color-warning)]">🌧️ weather</span>}
                  </div>
                  {act.tip && <p className="text-[11px] text-[var(--color-text-secondary)] italic">💡 {act.tip}</p>}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Packing List */}
          {result.packingList && result.packingList.length > 0 && (
            <div className="glass-card p-6 rounded-3xl">
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[var(--color-teal)]" /> Smart Packing List
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {["clothes", "tech", "documents", "medicine", "misc"].map(cat => {
                  const items = result.packingList.filter(p => p.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat} className="bg-[var(--color-ocean)]/50 rounded-xl p-4 border border-[var(--color-border)]">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-teal)] mb-2">{cat}</h4>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={i} className={`text-xs flex items-center gap-1.5 ${item.essential ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.essential ? "bg-[var(--color-warning)]" : "bg-white/20"}`} />
                            {item.item} {item.essential && <span className="text-[var(--color-warning)] text-[9px]">★</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
