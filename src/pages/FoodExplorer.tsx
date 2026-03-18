import React, { useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Loader2, MapPin, Star, Shield } from "lucide-react";
import type { FoodDiscoveryResult } from "../types";

const FoodCard: React.FC<{ item: any; highlight?: string }> = ({ item, highlight }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 rounded-2xl hover:border-[var(--color-teal)]/40"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm">{item.name}</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">{item.cuisine} • {item.location}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          highlight === "gem" ? "bg-purple-500/10 text-purple-400" :
          highlight === "budget" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" :
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
        }`}>{item.type}</span>
      </div>

      <div className="flex items-center gap-3 mb-3 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[var(--color-warning)]" /> ₹{item.avgCost} avg</span>
        <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-[var(--color-success)]" /> {item.safetyScore}/10</span>
      </div>

      {item.mustTry && item.mustTry.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {item.mustTry.map((dish: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)]">
              {dish}
            </span>
          ))}
        </div>
      )}
      {item.tip && <p className="text-xs text-[var(--color-text-secondary)] italic">💡 {item.tip}</p>}
    </motion.div>
  );
};

export default function FoodExplorer() {
  const [destination, setDestination] = useState("");
  const [dietary, setDietary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodDiscoveryResult | null>(null);

  const discover = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/food-discover", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, dietary, budget: "moderate" }),
      });
      if (!r.ok) throw new Error();
      setResult(await r.json());
    } catch { alert("Failed to discover food."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
          Food <span className="text-gradient">Explorer</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Discover hidden gems, street food, and famous restaurants with AI.</p>
      </motion.div>

      <div className="glass-card p-6 rounded-3xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
            <input value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="Destination (e.g., Jaipur, Tokyo, Rome)" onKeyDown={e => e.key === "Enter" && discover()}
              className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all"
            />
          </div>
          <input value={dietary} onChange={e => setDietary(e.target.value)} placeholder="Dietary (e.g., vegetarian)"
            className="md:w-48 bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all"
          />
          <button onClick={discover} disabled={loading || !destination.trim()}
            className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UtensilsCrossed className="w-5 h-5" />}
            {loading ? "Discovering…" : "Discover"}
          </button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
          {/* Water Safety + Dietary */}
          <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">💧 Water Safety:</span>
            <span className="text-[var(--color-text-secondary)]">{result.waterSafety}</span>
            {result.dietaryNotes?.map((n, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-[var(--color-teal)]/10 text-[var(--color-teal)]">{n}</span>
            ))}
          </div>

          {/* Hidden Gems */}
          {result.hiddenGems?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                <span>💎</span> Hidden Gems
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.hiddenGems.map((item, i) => <FoodCard key={i} item={item} highlight="gem" />)}
              </div>
            </div>
          )}

          {/* Budget Picks */}
          {result.budgetPicks?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                <span>🎯</span> Budget Picks
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.budgetPicks.map((item, i) => <FoodCard key={i} item={item} highlight="budget" />)}
              </div>
            </div>
          )}

          {/* Famous Spots */}
          {result.famousSpots?.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold font-display mb-4 flex items-center gap-2">
                <span>⭐</span> Famous Spots
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.famousSpots.map((item, i) => <FoodCard key={i} item={item} highlight="famous" />)}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
