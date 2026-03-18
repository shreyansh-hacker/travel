import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Save, Loader2, Sun, Moon } from "lucide-react";
import { useAuthStore, useThemeStore } from "../store";
import type { TravelMood } from "../types";

const MOODS: TravelMood[] = ["chill", "adventure", "luxury", "backpacker", "cultural", "romantic"];
const BUDGET_STYLES = ["ultra-budget", "budget", "moderate", "premium", "luxury"];
const INTERESTS = ["beaches", "mountains", "history", "nightlife", "food", "art", "sports", "nature", "shopping", "temples"];

export default function Profile() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [defaultMood, setDefaultMood] = useState<TravelMood>("chill");
  const [budgetStyle, setBudgetStyle] = useState("moderate");
  const [dietary, setDietary] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [carbonConscious, setCarbonConscious] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/preferences", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.preferences) {
          const p = d.preferences;
          setDefaultMood(p.default_mood || "chill");
          setBudgetStyle(p.budget_style || "moderate");
          try { setDietary(JSON.parse(p.dietary_pref || "[]")); } catch { setDietary([]); }
          try { setInterests(JSON.parse(p.interests || "[]")); } catch { setInterests([]); }
          setCarbonConscious(!!p.carbon_conscious);
        }
      })
      .catch(() => {});
  }, []);

  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ defaultMood, budgetStyle, dietaryPref: dietary, interests, carbonConscious, theme }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert("Failed to save."); }
    finally { setSaving(false); }
  };

  const toggleInterest = (i: string) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="glass-card p-12 rounded-3xl max-w-md mx-auto">
          <User className="w-12 h-12 text-[var(--color-teal)] mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold font-display mb-2">Sign in to access Profile</h2>
          <p className="text-[var(--color-text-secondary)]">Personalize your travel experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-2">
          Your <span className="text-gradient">Profile</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">Personalize your AeroVoyage experience.</p>
      </motion.div>

      <div className="space-y-6">
        {/* User Info */}
        <div className="glass-card p-6 rounded-3xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-grad-1)] to-[var(--color-teal)] flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg font-display">{user.name}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>

        {/* Theme */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-semibold font-display mb-4">Appearance</h3>
          <button onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] hover:bg-white/5 transition-all w-full"
          >
            {theme === "dark" ? <Moon className="w-5 h-5 text-[var(--color-teal)]" /> : <Sun className="w-5 h-5 text-[var(--color-warning)]" />}
            <span className="font-medium text-sm">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            <span className="ml-auto text-xs text-[var(--color-text-secondary)]">Tap to switch</span>
          </button>
        </div>

        {/* Travel Mood */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-semibold font-display mb-4">Default Travel Mood</h3>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map(m => (
              <button key={m} type="button" onClick={() => setDefaultMood(m)}
                className={`p-3 rounded-xl text-sm font-medium capitalize transition-all border ${
                  defaultMood === m
                    ? "border-[var(--color-teal)] bg-[var(--color-teal)]/10 text-[var(--color-teal)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-white/20"
                }`}
              >{m}</button>
            ))}
          </div>
        </div>

        {/* Budget Style */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-semibold font-display mb-4">Budget Style</h3>
          <div className="flex flex-wrap gap-2">
            {BUDGET_STYLES.map(b => (
              <button key={b} type="button" onClick={() => setBudgetStyle(b)}
                className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all border ${
                  budgetStyle === b
                    ? "border-[var(--color-teal)] bg-[var(--color-teal)]/10 text-[var(--color-teal)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-white/20"
                }`}
              >{b}</button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="glass-card p-6 rounded-3xl">
          <h3 className="font-semibold font-display mb-4">Travel Interests</h3>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} type="button" onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all border ${
                  interests.includes(i)
                    ? "border-[var(--color-teal)] bg-[var(--color-teal)]/10 text-[var(--color-teal)]"
                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-white/20"
                }`}
              >{i}</button>
            ))}
          </div>
        </div>

        {/* Carbon */}
        <div className="glass-card p-6 rounded-3xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={carbonConscious} onChange={e => setCarbonConscious(e.target.checked)}
              className="w-5 h-5 rounded accent-[var(--color-teal)]"
            />
            <div>
              <span className="font-semibold text-sm">🌱 Carbon-Conscious Traveler</span>
              <p className="text-xs text-[var(--color-text-secondary)]">Prioritize eco-friendly options.</p>
            </div>
          </label>
        </div>

        {/* Save */}
        <button onClick={savePreferences} disabled={saving}
          className="w-full btn-primary py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 text-lg"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? "✅ Saved!" : <><Save className="w-5 h-5" /> Save Preferences</>}
        </button>
      </div>
    </div>
  );
}
