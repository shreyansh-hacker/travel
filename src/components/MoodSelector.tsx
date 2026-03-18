import { motion } from "framer-motion";
import { Palmtree, Mountain, Gem, Backpack, Landmark, Heart } from "lucide-react";
import type { TravelMood } from "../types";

const MOODS: { value: TravelMood; label: string; icon: typeof Palmtree; emoji: string; desc: string }[] = [
  { value: "chill", label: "Chill", icon: Palmtree, emoji: "🏖️", desc: "Relaxation & beaches" },
  { value: "adventure", label: "Adventure", icon: Mountain, emoji: "🏔️", desc: "Trekking & thrills" },
  { value: "luxury", label: "Luxury", icon: Gem, emoji: "✨", desc: "Premium experiences" },
  { value: "backpacker", label: "Backpacker", icon: Backpack, emoji: "🎒", desc: "Budget & explore" },
  { value: "cultural", label: "Cultural", icon: Landmark, emoji: "🏛️", desc: "History & heritage" },
  { value: "romantic", label: "Romantic", icon: Heart, emoji: "💕", desc: "Couples getaway" },
];

export default function MoodSelector({ value, onChange }: { value: TravelMood; onChange: (m: TravelMood) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--color-text-secondary)]">Travel Mood</label>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => {
          const isActive = value === mood.value;
          return (
            <motion.button
              key={mood.value}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(mood.value)}
              className={`relative p-3 rounded-xl text-center transition-all border ${
                isActive
                  ? "border-[var(--color-teal)] bg-[var(--color-teal)]/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "border-[var(--color-border)] bg-[var(--color-ocean)]/30 hover:border-white/20"
              }`}
            >
              <span className="text-xl mb-1 block">{mood.emoji}</span>
              <span className={`text-xs font-medium block ${isActive ? "text-[var(--color-teal)]" : "text-[var(--color-text-secondary)]"}`}>
                {mood.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
