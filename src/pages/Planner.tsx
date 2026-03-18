import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plane, MapPin, Calendar, Users, Wallet, Loader2, Navigation,
  Hotel, Utensils, Ticket, GripVertical, TrendingDown, AlertTriangle,
  Lightbulb, Leaf, BadgeIndianRupee, ArrowRightLeft, UtensilsCrossed, Save, Check
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { OptimizedTripPlan, TravelMood } from "../types";
import AntigravityScoreCard from "../components/AntigravityScore";
import MoodSelector from "../components/MoodSelector";
import { calculateTripScore } from "../lib/antigravityEngine";
import { useAuthStore } from "../store";

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const formSchema = z.object({
  budget: z.number().min(5000, "Minimum ₹5,000"),
  days: z.number().min(1).max(30),
  travelers: z.number().min(1).max(20),
  travelType: z.enum(["Luxury", "Budget", "Adventure", "Family"]),
  destination: z.string().min(3),
  transport: z.enum(["Flight", "Train", "Bus", "Car"]),
});

type FormData = z.infer<typeof formSchema>;
const CHART_COLORS = ["#06B6D4", "#F97316", "#1E3A8A", "#8b5cf6", "#EF4444", "#10B981"];

export default function Planner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<OptimizedTripPlan | null>(null);
  const [mood, setMood] = useState<TravelMood>("chill");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { budget: 50000, days: 5, travelers: 2, travelType: "Budget", destination: "Goa", transport: "Train" },
  });

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setSaved(false);
    try {
      const r = await fetch("/api/plan-trip", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, mood }),
      });
      if (!r.ok) throw new Error();
      const res = await r.json();

      // Compute Antigravity Score on client
      const agScore = calculateTripScore(
        res.expenses?.total || 0, data.budget, data.days,
        70, res.carbonKg || 150, mood
      );
      res.antigravityScore = agScore;
      setResult(res);
    } catch { alert("Failed to generate trip plan."); }
    finally { setIsGenerating(false); }
  };

  const saveTrip = async () => {
    if (!result || !user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSaving(true);
    try {
      const vals = getValues();
      await fetch("/api/trips", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          destination: result.destination, mood, budget: vals.budget, days: vals.days,
          travelers: vals.travelers, data: result,
          antigravityScore: result.antigravityScore?.overall || 0, carbonKg: result.carbonKg || 0,
        }),
      });
      setSaved(true);
    } catch { alert("Failed to save trip."); }
    finally { setSaving(false); }
  };

  const pieData = result ? [
    { name: "Transport", value: result.expenses.transport },
    { name: "Hotel", value: result.expenses.hotel.budget },
    { name: "Food", value: result.expenses.food.street },
    { name: "Entry Fees", value: result.expenses.entryFees },
    { name: "Activities", value: result.expenses.activities },
  ].filter(d => d.value > 0) : [];

  const barData = result ? [
    { name: "Transport", budget: result.expenses.transport, premium: result.expenses.transport },
    { name: "Hotel", budget: result.expenses.hotel.budget, premium: result.expenses.hotel.premium },
    { name: "Food", budget: result.expenses.food.street, premium: result.expenses.food.restaurants },
    { name: "Entry", budget: result.expenses.entryFees, premium: result.expenses.entryFees },
    { name: "Activities", budget: result.expenses.activities, premium: result.expenses.activities },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 font-display">
          Smart Budget <span className="text-gradient">Optimizer</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">AI-powered trip planning with Antigravity Intelligence Engine.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Form ──────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 rounded-3xl space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--color-teal)]" /> Budget (₹)
              </label>
              <input type="number" {...register("budget", { valueAsNumber: true })}
                className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all" />
              {errors.budget && <p className="text-[var(--color-error)] text-xs">{errors.budget.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-teal)]" /> Days
                </label>
                <input type="number" {...register("days", { valueAsNumber: true })}
                  className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-teal)]" /> Travelers
                </label>
                <input type="number" {...register("travelers", { valueAsNumber: true })}
                  className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-teal)]" /> Destination
              </label>
              <input type="text" {...register("destination")} placeholder="e.g., Goa, Manali, Jaipur"
                className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Travel Type</label>
                <select {...register("travelType")}
                  className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all appearance-none">
                  {["Luxury", "Budget", "Adventure", "Family"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--color-text-secondary)]">Transport</label>
                <select {...register("transport")}
                  className="w-full bg-[var(--color-navy)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:border-[var(--color-teal)] transition-all appearance-none">
                  {["Flight", "Train", "Bus", "Car"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <MoodSelector value={mood} onChange={setMood} />

            <button type="submit" disabled={isGenerating}
              className="glow-button w-full bg-[var(--color-ocean)] text-[var(--color-text)] font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 border border-[var(--color-teal)]/30">
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Optimizing…</> : <><Plane className="w-5 h-5" /> Generate Smart Plan</>}
            </button>
          </form>
        </motion.div>

        {/* ── Results ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && !isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center glass-card rounded-3xl">
                <div className="w-20 h-20 rounded-full bg-[var(--color-ocean)] border border-[var(--color-border)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                  <MapPin className="w-8 h-8 text-[var(--color-teal)] opacity-50" />
                </div>
                <p className="text-lg font-light text-[var(--color-text-secondary)]">Your AI-optimized travel plan will appear here.</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center glass-card rounded-3xl">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-[var(--color-teal)]/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-[var(--color-teal)] rounded-full border-t-transparent animate-spin" />
                  <Plane className="absolute inset-0 m-auto w-10 h-10 animate-pulse text-[var(--color-cyan-glow)]" />
                </div>
                <p className="text-xl font-medium animate-pulse font-display">Antigravity Engine Working...</p>
                <p className="text-[var(--color-text-secondary)] mt-2 text-sm">Analyzing routes, costs, safety & carbon impact</p>
              </motion.div>
            )}

            {result && !isGenerating && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Warnings */}
                {result.warnings?.length > 0 && (
                  <div className="space-y-3">
                    {result.warnings.map((w, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-2xl border flex items-start gap-3 text-sm ${
                          w.severity === "critical" ? "bg-[var(--color-error)]/10 border-[var(--color-error)]/30 text-[var(--color-error)]" :
                          w.severity === "warning" ? "bg-[var(--color-warning)]/10 border-[var(--color-warning)]/30 text-[var(--color-warning)]" :
                          "bg-[var(--color-teal)]/10 border-[var(--color-teal)]/30 text-[var(--color-teal)]"
                        }`}>
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{w.message}</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Antigravity Score Card */}
                {result.antigravityScore && <AntigravityScoreCard score={result.antigravityScore} />}

                {/* Header Stats + Save */}
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div className="glass-card p-4 rounded-2xl">
                      <p className="text-[var(--color-text-secondary)] text-xs mb-1">Destination</p>
                      <p className="font-semibold text-sm truncate">{result.destination}</p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl">
                      <p className="text-[var(--color-text-secondary)] text-xs mb-1">Min. Cost</p>
                      <p className="font-semibold text-sm text-[var(--color-success)]">₹{result.expenses.total.toLocaleString()}</p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl">
                      <p className="text-[var(--color-text-secondary)] text-xs mb-1">Savings</p>
                      <p className="font-semibold text-sm text-[var(--color-cyan-glow)]">
                        {result.bestRoute?.savings ? `₹${result.bestRoute.savings.toLocaleString()}` : "—"}
                      </p>
                    </div>
                    <div className="glass-card p-4 rounded-2xl flex items-center justify-center">
                      {user ? (
                        <button onClick={saveTrip} disabled={saving || saved}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-medium disabled:opacity-60 w-full justify-center">
                          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Trip</>}
                        </button>
                      ) : (
                        <p className="text-[10px] text-[var(--color-text-secondary)] text-center">Sign in to save</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route Optimization */}
                {result.bestRoute && result.bestRoute.alternatives.length > 0 && (
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-display">
                      <ArrowRightLeft className="w-5 h-5 text-[var(--color-teal)]" /> Route Optimization
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 bg-[var(--color-teal)]/10 border border-[var(--color-teal)]/30 rounded-2xl p-5 text-center">
                        <p className="text-xs uppercase tracking-wider text-[var(--color-teal)] mb-2 font-semibold">Recommended</p>
                        <p className="text-3xl font-bold capitalize font-display">{result.bestRoute.recommended}</p>
                        {result.bestRoute.savings > 0 && (
                          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-success)]/20 border border-[var(--color-success)]/30 rounded-full text-[var(--color-success)] text-sm font-medium">
                            <TrendingDown className="w-4 h-4" /> Save ₹{result.bestRoute.savings.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <table className="w-full text-sm">
                          <thead><tr className="text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                            <th className="text-left py-3 font-medium">Transport</th>
                            <th className="text-right py-3 font-medium">Cost</th>
                            <th className="text-right py-3 font-medium">Duration</th>
                          </tr></thead>
                          <tbody>
                            {result.bestRoute.alternatives.map((alt, i) => (
                              <tr key={i} className={`border-b border-[var(--color-border)]/50 ${alt.type === result.bestRoute.recommended ? "text-[var(--color-teal)]" : ""}`}>
                                <td className="py-3 capitalize flex items-center gap-2">
                                  {alt.type === result.bestRoute.recommended && <span className="w-2 h-2 rounded-full bg-[var(--color-teal)]" />}
                                  {alt.type}
                                </td>
                                <td className="py-3 text-right font-medium">₹{alt.cost.toLocaleString()}</td>
                                <td className="py-3 text-right text-[var(--color-text-secondary)]">{alt.duration || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-display">
                      <Wallet className="w-5 h-5 text-[var(--color-teal)]" /> Budget Breakdown
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((_e, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip formatter={(v: number) => `₹${v.toLocaleString()}`}
                            contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-display">
                      <BadgeIndianRupee className="w-5 h-5 text-[var(--color-teal)]" /> Budget vs Premium
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} />
                          <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                          <RechartsTooltip formatter={(v: number) => `₹${v.toLocaleString()}`}
                            contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                          <Bar dataKey="budget" name="Budget" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="premium" name="Premium" fill="#F97316" radius={[4, 4, 0, 0]} />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Expense Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { icon: Plane, label: "Transport", value: result.expenses.transport, color: "var(--color-teal)" },
                    { icon: Hotel, label: "Hotel", value: result.expenses.hotel.budget, sub: `Premium: ₹${result.expenses.hotel.premium.toLocaleString()}`, color: "#F97316" },
                    { icon: Utensils, label: "Food", value: result.expenses.food.street, sub: `Restaurant: ₹${result.expenses.food.restaurants.toLocaleString()}`, color: "#8b5cf6" },
                    { icon: Ticket, label: "Entry Fees", value: result.expenses.entryFees, color: "#1E3A8A" },
                    { icon: MapPin, label: "Activities", value: result.expenses.activities, color: "var(--color-success)" },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass-card p-4 rounded-2xl">
                      <item.icon className="w-5 h-5 mb-2" style={{ color: item.color }} />
                      <p className="text-[var(--color-text-secondary)] text-xs">{item.label}</p>
                      <p className="font-bold text-lg">₹{item.value.toLocaleString()}</p>
                      {item.sub && <p className="text-[var(--color-text-secondary)] text-[11px] mt-1">{item.sub}</p>}
                    </motion.div>
                  ))}
                </div>

                {/* Food Suggestions */}
                {result.foodSuggestions && (result.foodSuggestions.budget.length > 0 || result.foodSuggestions.famous.length > 0) && (
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-display">
                      <UtensilsCrossed className="w-5 h-5 text-[var(--color-teal)]" /> Food Recommendations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-teal)] uppercase tracking-wider mb-4">🎯 Budget Street Food</h4>
                        <ul className="space-y-3">
                          {result.foodSuggestions.budget.map((f, i) => (
                            <li key={i} className="flex items-center justify-between bg-[var(--color-ocean)]/60 rounded-xl px-4 py-3 border border-[var(--color-border)]">
                              <div>
                                <p className="font-medium text-sm">{f.name}</p>
                                {f.location && <p className="text-[var(--color-text-secondary)] text-xs">{f.location}</p>}
                              </div>
                              <span className="text-[var(--color-success)] font-semibold text-sm">₹{f.cost}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F97316] uppercase tracking-wider mb-4">⭐ Famous Restaurants</h4>
                        <ul className="space-y-3">
                          {result.foodSuggestions.famous.map((f, i) => (
                            <li key={i} className="flex items-center justify-between bg-[var(--color-ocean)]/60 rounded-xl px-4 py-3 border border-[var(--color-border)]">
                              <div>
                                <p className="font-medium text-sm">{f.name}</p>
                                {f.location && <p className="text-[var(--color-text-secondary)] text-xs">{f.location}</p>}
                              </div>
                              <span className="text-[#F97316] font-semibold text-sm">₹{f.cost}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map */}
                <div className="glass-card p-6 rounded-3xl overflow-hidden relative h-[320px]">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 relative z-10 font-display">
                    <Navigation className="w-5 h-5 text-[var(--color-teal)]" /> Location
                  </h3>
                  <div className="absolute inset-0 top-16 rounded-b-3xl overflow-hidden border-t border-[var(--color-border)]">
                    <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; OSM contributors' />
                      <Marker position={[20.5937, 78.9629]}><Popup>{result.destination}</Popup></Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Itinerary */}
                {result.itinerary?.length > 0 && (
                  <div className="glass-card p-8 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-semibold font-display">Day-by-Day Itinerary</h3>
                      <span className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-[var(--color-border)]">
                        <GripVertical className="w-4 h-4" /> Reorder
                      </span>
                    </div>
                    <Reorder.Group axis="y" values={result.itinerary} onReorder={(ni) => setResult({ ...result, itinerary: ni })}
                      className="space-y-6">
                      {result.itinerary.map((day, index) => (
                        <Reorder.Item key={day.day} value={day} className="cursor-grab active:cursor-grabbing">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-[var(--color-teal)] bg-[var(--color-navy)] text-[var(--color-cyan-glow)] font-bold flex items-center justify-center shrink-0 text-sm shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                              {index + 1}
                            </div>
                            <div className="flex-1 p-5 rounded-2xl bg-[var(--color-ocean)]/80 border border-[var(--color-border)] hover:border-[var(--color-teal)]/30 transition-all">
                              <h4 className="font-bold text-lg mb-3 font-display">{day.title}</h4>
                              <ul className="space-y-2">
                                {day.activities.map((act, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)] mt-1.5 shrink-0" /> {act}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                )}

                {/* Tips + Eco */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-display">
                      <Lightbulb className="w-5 h-5 text-[var(--color-warning)]" /> Cost-Saving Tips
                    </h3>
                    <ul className="space-y-3">
                      {(result.tips || []).map((tip, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-ocean)]/50 rounded-xl px-4 py-3 border border-[var(--color-border)]">
                          <TrendingDown className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-display">
                      <Leaf className="w-5 h-5 text-[var(--color-success)]" /> Eco Impact
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                      {result.ecoImpact || "No eco data available."}
                    </p>
                    {result.carbonKg && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-[var(--color-success)] text-sm font-medium">
                        🌱 {result.carbonKg} kg CO₂ estimated
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
