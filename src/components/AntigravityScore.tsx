import { motion } from "framer-motion";
import type { AntigravityScore as ScoreType } from "../types";

const DIMENSIONS = [
  { key: "cost", label: "Cost", color: "#06B6D4" },
  { key: "time", label: "Time", color: "#0EA5E9" },
  { key: "comfort", label: "Comfort", color: "#8b5cf6" },
  { key: "experience", label: "Experience", color: "#F97316" },
  { key: "safety", label: "Safety", color: "#10B981" },
  { key: "carbon", label: "Carbon", color: "#22D3EE" },
] as const;

function getScoreColor(score: number) {
  if (score >= 80) return "var(--color-success)";
  if (score >= 60) return "var(--color-teal)";
  if (score >= 40) return "var(--color-warning)";
  return "var(--color-error)";
}

export default function AntigravityScore({ score, compact = false }: { score: ScoreType; compact?: boolean }) {
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-[var(--color-teal)]/30"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
          style={{ borderColor: getScoreColor(score.overall), color: getScoreColor(score.overall) }}
        >
          {score.overall}
        </div>
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">{score.label}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold font-display flex items-center gap-2">
          <span className="text-[var(--color-teal)]">⚡</span> Antigravity Score
        </h3>
        <span className="text-xs px-3 py-1 rounded-full border font-medium"
          style={{ borderColor: getScoreColor(score.overall), color: getScoreColor(score.overall) }}
        >
          {score.label}
        </span>
      </div>

      {/* Main Score Ring */}
      <div className="flex items-center gap-8 mb-8">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none"
              stroke={getScoreColor(score.overall)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score.overall * 2.64} ${264 - score.overall * 2.64}`}
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${score.overall * 2.64} ${264 - score.overall * 2.64}` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold font-display"
              style={{ color: getScoreColor(score.overall) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score.overall}
            </motion.span>
            <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {DIMENSIONS.map((dim, i) => (
            <div key={dim.key} className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-secondary)] w-20">{dim.label}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: dim.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score[dim.key]}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right" style={{ color: dim.color }}>
                {score[dim.key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
