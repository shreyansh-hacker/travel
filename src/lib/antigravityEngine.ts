// ─── Antigravity Travel Intelligence Engine ──────────────────────────────────
// Custom optimization algorithm that scores travel options across 6 dimensions.
// Score = Σ(dimension_score × weight) normalized to 0–100.

import type { AntigravityWeights, AntigravityScore, RouteOption } from "../types";

// ── Default Weight Presets ─────────────────────────────────────────────────

export const WEIGHT_PRESETS: Record<string, AntigravityWeights> = {
  balanced:    { cost: 0.25, time: 0.20, comfort: 0.15, experience: 0.15, safety: 0.15, carbon: 0.10 },
  budget:      { cost: 0.45, time: 0.10, comfort: 0.05, experience: 0.15, safety: 0.15, carbon: 0.10 },
  speed:       { cost: 0.10, time: 0.45, comfort: 0.15, experience: 0.10, safety: 0.10, carbon: 0.10 },
  comfort:     { cost: 0.10, time: 0.10, comfort: 0.40, experience: 0.15, safety: 0.15, carbon: 0.10 },
  adventure:   { cost: 0.15, time: 0.10, comfort: 0.05, experience: 0.45, safety: 0.10, carbon: 0.15 },
  eco:         { cost: 0.15, time: 0.10, comfort: 0.10, experience: 0.15, safety: 0.10, carbon: 0.40 },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function normalize(val: number, min: number, max: number): number {
  if (max <= min) return 50;
  return clamp(((val - min) / (max - min)) * 100, 0, 100);
}

/** Invert score: lower raw value = higher score (used for cost, time, carbon). */
function invertNormalize(val: number, min: number, max: number): number {
  return 100 - normalize(val, min, max);
}

// ── Core Engine ───────────────────────────────────────────────────────────

/**
 * Calculate an Antigravity Score for a single route option.
 * Requires the full set of alternatives to compute relative rankings.
 */
export function calculateAntigravityScore(
  option: RouteOption,
  allOptions: RouteOption[],
  weights: AntigravityWeights = WEIGHT_PRESETS.balanced
): AntigravityScore {
  if (allOptions.length === 0) allOptions = [option];

  // Extract ranges for normalization
  const costs = allOptions.map(o => o.cost);
  const durations = allOptions.map(o => parseDuration(o.duration));
  const comforts = allOptions.map(o => o.comfort);
  const carbons = allOptions.map(o => o.carbonKg);

  const minCost = Math.min(...costs), maxCost = Math.max(...costs);
  const minDur = Math.min(...durations), maxDur = Math.max(...durations);
  const minComf = Math.min(...comforts), maxComf = Math.max(...comforts);
  const minCarb = Math.min(...carbons), maxCarb = Math.max(...carbons);

  // Score each dimension (0–100, higher is better)
  const costScore = invertNormalize(option.cost, minCost, maxCost);
  const timeScore = invertNormalize(parseDuration(option.duration), minDur, maxDur);
  const comfortScore = normalize(option.comfort, minComf, maxComf);
  const experienceScore = getExperienceScore(option.type);
  const safetyScore = getSafetyScoreForTransport(option.type);
  const carbonScore = invertNormalize(option.carbonKg, minCarb, maxCarb);

  // Weighted overall
  const overall = clamp(Math.round(
    costScore * weights.cost +
    timeScore * weights.time +
    comfortScore * weights.comfort +
    experienceScore * weights.experience +
    safetyScore * weights.safety +
    carbonScore * weights.carbon
  ), 0, 100);

  return {
    overall,
    cost: Math.round(costScore),
    time: Math.round(timeScore),
    comfort: Math.round(comfortScore),
    experience: Math.round(experienceScore),
    safety: Math.round(safetyScore),
    carbon: Math.round(carbonScore),
    label: getLabel(weights),
  };
}

/**
 * Rank all route options by Antigravity Score.
 */
export function rankAlternatives(
  options: RouteOption[],
  weights: AntigravityWeights = WEIGHT_PRESETS.balanced
): RouteOption[] {
  const scored = options.map(opt => ({
    ...opt,
    antigravityScore: calculateAntigravityScore(opt, options, weights),
  }));

  return scored.sort((a, b) =>
    (b.antigravityScore?.overall ?? 0) - (a.antigravityScore?.overall ?? 0)
  );
}

/**
 * Calculate a composite Antigravity Score for an entire trip plan.
 */
export function calculateTripScore(
  totalCost: number,
  budget: number,
  days: number,
  safetyRating: number,    // 0–100
  carbonKg: number,
  mood: string
): AntigravityScore {
  const costScore = budget > 0 ? clamp(((budget - totalCost) / budget) * 100 + 50, 0, 100) : 50;
  const timeScore = clamp(days <= 7 ? 80 : days <= 14 ? 60 : 40, 0, 100);
  const comfortScore = mood === "luxury" ? 90 : mood === "chill" ? 75 : mood === "backpacker" ? 30 : 60;
  const experienceScore = mood === "adventure" ? 90 : mood === "cultural" ? 85 : 60;
  const safetyScore = clamp(safetyRating, 0, 100);
  const carbonScore = clamp(100 - carbonKg / 5, 0, 100); // lower kg = higher score

  const weights = WEIGHT_PRESETS.balanced;
  const overall = clamp(Math.round(
    costScore * weights.cost +
    timeScore * weights.time +
    comfortScore * weights.comfort +
    experienceScore * weights.experience +
    safetyScore * weights.safety +
    carbonScore * weights.carbon
  ), 0, 100);

  return {
    overall,
    cost: Math.round(costScore),
    time: Math.round(timeScore),
    comfort: Math.round(comfortScore),
    experience: Math.round(experienceScore),
    safety: Math.round(safetyScore),
    carbon: Math.round(carbonScore),
    label: overall >= 80 ? "Explorer" : overall >= 60 ? "Balanced" : "Budget Saver",
  };
}

// ── Internal Utilities ─────────────────────────────────────────────────────

function parseDuration(dur: string): number {
  const h = dur.match(/(\d+)\s*h/i);
  const m = dur.match(/(\d+)\s*m/i);
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0) || 60;
}

function getExperienceScore(type: string): number {
  const scores: Record<string, number> = {
    train: 80, bus: 60, car: 70, flight: 50, bike: 90, walk: 95, ferry: 85,
  };
  return scores[type.toLowerCase()] ?? 60;
}

function getSafetyScoreForTransport(type: string): number {
  const scores: Record<string, number> = {
    flight: 95, train: 85, bus: 65, car: 70, bike: 40, walk: 50, ferry: 75,
  };
  return scores[type.toLowerCase()] ?? 60;
}

function getLabel(weights: AntigravityWeights): AntigravityScore["label"] {
  const max = Math.max(weights.cost, weights.time, weights.comfort, weights.experience, weights.safety, weights.carbon);
  if (max === weights.cost) return "Budget Saver";
  if (max === weights.time) return "Speed King";
  if (max === weights.comfort) return "Comfort Plus";
  if (max === weights.experience) return "Explorer";
  if (max === weights.carbon) return "Eco Warrior";
  return "Balanced";
}
