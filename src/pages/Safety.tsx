import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2, MapPin, AlertTriangle, Phone, Heart } from "lucide-react";
import SafetyBadge from "../components/SafetyBadge";
import type { SafetyResult } from "../types";

export default function Safety() {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);

  const analyze = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/safety-score", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination }),
      });
      if (!r.ok) throw new Error();
      setResult(await r.json());
    } catch { alert("Failed to analyze safety."); }
    finally { setLoading(false); }
  };

  const scoreColor = (s: number) => s >= 70 ? "var(--color-success)" : s >= 40 ? "var(--color-warning)" : "var(--color-error)";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
          Safety <span className="text-gradient">Hub</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">AI-powered destination safety analysis & scam detection.</p>
      </motion.div>

      {/* Search */}
      <div className="glass-card p-6 rounded-3xl mb-8 flex gap-4">
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
          <input value={destination} onChange={e => setDestination(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Enter destination (e.g., Bangkok, Cairo, Goa)"
            className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl pl-12 pr-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all"
          />
        </div>
        <button onClick={analyze} disabled={loading || !destination.trim()}
          className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Overall Score */}
          <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <motion.circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor(result.score.overall)}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${result.score.overall * 2.64} ${264 - result.score.overall * 2.64}`}
                  initial={{ strokeDasharray: "0 264" }}
                  animate={{ strokeDasharray: `${result.score.overall * 2.64} ${264 - result.score.overall * 2.64}` }}
                  transition={{ duration: 1.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-display" style={{ color: scoreColor(result.score.overall) }}>
                  {result.score.overall}
                </span>
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">Safety</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold font-display mb-4">{result.destination}</h2>
              <div className="flex flex-wrap gap-3">
                <SafetyBadge level={result.score.crimeRisk} label={`Crime: ${result.score.crimeRisk}`} />
                <SafetyBadge level={result.score.scamRisk} label={`Scam: ${result.score.scamRisk}`} />
                <SafetyBadge level={result.score.healthRisk} label={`Health: ${result.score.healthRisk}`} />
                <SafetyBadge level={result.score.naturalDisaster} label={`Disaster: ${result.score.naturalDisaster}`} />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-4">{result.travelAdvisory}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scams */}
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" /> Common Scams
              </h3>
              <div className="space-y-4">
                {(result.commonScams || []).map((scam, i) => (
                  <div key={i} className="bg-[var(--color-ocean)]/50 rounded-xl p-4 border border-[var(--color-border)]">
                    <h4 className="font-semibold text-sm text-[var(--color-warning)] mb-1">{scam.name}</h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2">{scam.description}</p>
                    <p className="text-xs text-[var(--color-success)]">💡 {scam.avoidTip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency + Health */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[var(--color-error)]" /> Emergency Numbers
                </h3>
                <div className="space-y-2">
                  {(result.emergencyNumbers || []).map((e, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                      <span className="text-sm text-[var(--color-text-secondary)]">{e.service}</span>
                      <span className="font-mono font-bold text-sm">{e.number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl">
                <h3 className="text-xl font-semibold font-display mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[var(--color-error)]" /> Health Tips
                </h3>
                <ul className="space-y-2">
                  {(result.healthTips || []).map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)] mt-1.5 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Safe / Avoid Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="font-semibold font-display mb-3 text-[var(--color-success)]">✅ Safe Areas</h3>
              <ul className="space-y-2">{(result.safeAreas || []).map((a, i) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-success)]" /> {a}
                </li>
              ))}</ul>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="font-semibold font-display mb-3 text-[var(--color-error)]">⚠️ Areas to Avoid</h3>
              <ul className="space-y-2">{(result.avoidAreas || []).map((a, i) => (
                <li key={i} className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-error)]" /> {a}
                </li>
              ))}</ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
