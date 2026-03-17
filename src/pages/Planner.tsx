import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plane, MapPin, Calendar, Users, Wallet, Loader2, Navigation, Hotel, Utensils, Ticket, ShieldAlert, GripVertical } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const formSchema = z.object({
  budget: z.number().min(5000, "Minimum budget is ₹5000"),
  days: z.number().min(1).max(30),
  travelers: z.number().min(1).max(20),
  travelType: z.enum(["Luxury", "Budget", "Adventure", "Family"]),
  destination: z.string().min(3),
  transport: z.enum(["Flight", "Train", "Bus", "Car"]),
});

type FormData = z.infer<typeof formSchema>;

export default function Planner() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 150000,
      days: 7,
      travelers: 2,
      travelType: "Luxury",
      destination: "Maldives",
      transport: "Flight"
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/plan-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Failed to generate");
      
      const resData = await response.json();
      setResult(resData);
    } catch (error) {
      console.error(error);
      alert("Failed to generate trip plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const chartData = result ? [
    { name: "Hotel", value: result.expenses.hotelCost, color: "#06B6D4" },
    { name: "Food", value: result.expenses.foodCost, color: "#F97316" },
    { name: "Transport", value: result.expenses.transportCost, color: "#1E3A8A" },
    { name: "Sightseeing", value: result.expenses.sightseeingCost, color: "#8b5cf6" },
    { name: "Buffer", value: result.expenses.bufferCost, color: "#EF4444" },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center md:text-left"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 font-display">
          AI Trip <span className="text-gradient">Planner</span>
        </h1>
        <p className="text-zinc-400 text-lg">Enter your details and let our AI craft the perfect luxury itinerary.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 rounded-3xl space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--color-teal)]" /> Budget (₹)
              </label>
              <input
                type="number"
                {...register("budget", { valueAsNumber: true })}
                className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all"
              />
              {errors.budget && <p className="text-[var(--color-error)] text-xs">{errors.budget.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-teal)]" /> Days
                </label>
                <input
                  type="number"
                  {...register("days", { valueAsNumber: true })}
                  className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-teal)]" /> Travelers
                </label>
                <input
                  type="number"
                  {...register("travelers", { valueAsNumber: true })}
                  className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-teal)]" /> Destination
              </label>
              <input
                type="text"
                {...register("destination")}
                placeholder="e.g., Bali, Paris, Kyoto"
                className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Travel Type</label>
                <select
                  {...register("travelType")}
                  className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all appearance-none"
                >
                  <option value="Luxury">Luxury</option>
                  <option value="Budget">Budget</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Family">Family</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Transport</label>
                <select
                  {...register("transport")}
                  className="w-full bg-[var(--color-navy)]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)] transition-all appearance-none"
                >
                  <option value="Flight">Flight</option>
                  <option value="Train">Train</option>
                  <option value="Bus">Bus</option>
                  <option value="Car">Car</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="glow-button w-full bg-[var(--color-ocean)] text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--color-teal)]/30"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  Generate Itinerary
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!result && !isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-zinc-500 glass-card rounded-3xl"
              >
                <div className="w-20 h-20 rounded-full bg-[var(--color-ocean)] border border-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(30,58,138,0.3)]">
                  <MapPin className="w-8 h-8 text-[var(--color-teal)] opacity-50" />
                </div>
                <p className="text-lg font-light">Your AI-generated itinerary will appear here.</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center text-[var(--color-teal)] glass-card rounded-3xl"
              >
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-4 border-[var(--color-teal)]/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-[var(--color-teal)] rounded-full border-t-transparent animate-spin" />
                  <Plane className="absolute inset-0 m-auto w-10 h-10 animate-pulse text-[var(--color-cyan-glow)]" />
                </div>
                <p className="text-xl font-medium animate-pulse text-white font-display">Analyzing global destinations...</p>
                <p className="text-zinc-400 mt-2 text-sm">Optimizing budget and routes</p>
              </motion.div>
            )}

            {result && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Header Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-5 rounded-2xl">
                    <p className="text-zinc-400 text-sm mb-1">Destination</p>
                    <p className="font-semibold text-lg truncate text-white">{result.destination}</p>
                  </div>
                  <div className="glass-card p-5 rounded-2xl">
                    <p className="text-zinc-400 text-sm mb-1">Total Cost</p>
                    <p className="font-semibold text-lg text-[var(--color-success)]">₹{result.expenses.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-5 rounded-2xl">
                    <p className="text-zinc-400 text-sm mb-1">Balance</p>
                    <p className="font-semibold text-lg text-[var(--color-cyan-glow)]">₹{result.expenses.remainingBalance.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-5 rounded-2xl">
                    <p className="text-zinc-400 text-sm mb-1">Hotel</p>
                    <p className="font-semibold text-sm truncate text-white" title={result.hotelSuggestion}>{result.hotelSuggestion}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Chart */}
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 font-display">
                      <Wallet className="w-5 h-5 text-[var(--color-teal)]" /> Expense Analytics
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => `₹${value.toLocaleString()}`}
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="glass-card p-6 rounded-3xl overflow-hidden relative">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 relative z-10 font-display">
                      <Navigation className="w-5 h-5 text-[var(--color-teal)]" /> Location Overview
                    </h3>
                    <div className="absolute inset-0 top-16 rounded-b-3xl overflow-hidden border-t border-white/5">
                      <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={[20.5937, 78.9629]}>
                          <Popup>
                            {result.destination}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="glass-card p-8 rounded-3xl">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-semibold font-display">Day-by-Day Itinerary</h3>
                    <span className="text-sm text-zinc-400 flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                      <GripVertical className="w-4 h-4" /> Drag to reorder
                    </span>
                  </div>
                  <Reorder.Group 
                    axis="y" 
                    values={result.itinerary} 
                    onReorder={(newItinerary) => setResult({ ...result, itinerary: newItinerary })}
                    className="space-y-10 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-teal)] before:via-[var(--color-grad-1)] before:to-transparent"
                  >
                    {result.itinerary.map((day: any, index: number) => (
                      <Reorder.Item 
                        key={day.day} 
                        value={day}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-[var(--color-teal)] bg-[var(--color-navy)] text-[var(--color-cyan-glow)] font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10">
                          {index + 1}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-[var(--color-ocean)]/80 border border-white/5 hover:border-[var(--color-teal)]/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] hover:-translate-y-1">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-xl text-white font-display">{day.title}</h4>
                            <GripVertical className="w-5 h-5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <ul className="space-y-3">
                            {day.activities.map((activity: string, actIdx: number) => (
                              <li key={actIdx} className="flex items-start gap-3 text-zinc-300 text-sm leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>

                {/* Carbon Footprint & Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-display">
                      <span className="text-[var(--color-success)]">🌱</span> Eco-Impact
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {result.carbonFootprint}
                    </p>
                  </div>
                  <div className="glass-card p-6 rounded-3xl">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 font-display">
                      <span className="text-[var(--color-teal)]">💡</span> Travel Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-zinc-300 text-sm leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-cyan-glow)] mt-1.5 shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
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
