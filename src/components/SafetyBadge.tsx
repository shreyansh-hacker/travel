import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface SafetyBadgeProps {
  level: "low" | "moderate" | "high";
  label?: string;
  size?: "sm" | "md";
}

const CONFIG = {
  low: { icon: ShieldCheck, color: "var(--color-success)", bg: "rgba(16, 185, 129, 0.12)", text: "Low Risk" },
  moderate: { icon: ShieldAlert, color: "var(--color-warning)", bg: "rgba(245, 158, 11, 0.12)", text: "Moderate" },
  high: { icon: ShieldX, color: "var(--color-error)", bg: "rgba(239, 68, 68, 0.12)", text: "High Risk" },
};

export default function SafetyBadge({ level, label, size = "md" }: SafetyBadgeProps) {
  const cfg = CONFIG[level] || CONFIG.moderate;
  const Icon = cfg.icon;
  const sm = size === "sm";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${sm ? "px-2 py-0.5" : "px-3 py-1.5"}`}
      style={{ backgroundColor: cfg.bg, borderColor: cfg.color + "30", color: cfg.color }}
    >
      <Icon className={sm ? "w-3 h-3" : "w-4 h-4"} />
      <span className={`font-medium ${sm ? "text-[10px]" : "text-xs"}`}>{label || cfg.text}</span>
    </div>
  );
}
