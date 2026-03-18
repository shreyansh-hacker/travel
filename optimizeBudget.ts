import type { OptimizedTripPlan, BudgetWarning } from "./src/types.js";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Force a value to a finite number, falling back to 0. */
function safeNum(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

/** Ensure an array – returns [] if the input is not an array. */
function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : [];
}

// ─── Budget Optimizer ───────────────────────────────────────────────────────────

/**
 * Post-processes the raw AI response and enriches it with:
 *  - Budget overspend warnings
 *  - High-category-spend alerts (>40 % of budget)
 *  - Recommended cheapest transport (re-calculated)
 *  - Transport savings highlight
 *  - Additional cost-saving suggestions
 */
export function optimizeBudget(
  data: OptimizedTripPlan,
  userBudget: number
): OptimizedTripPlan {
  const warnings: BudgetWarning[] = [];
  const budget = safeNum(userBudget);

  // ── 1. Normalise numeric fields ───────────────────────────────────────────
  data.expenses = {
    transport: safeNum(data.expenses?.transport),
    hotel: {
      budget: safeNum(data.expenses?.hotel?.budget),
      premium: safeNum(data.expenses?.hotel?.premium),
    },
    food: {
      street: safeNum(data.expenses?.food?.street),
      restaurants: safeNum(data.expenses?.food?.restaurants),
    },
    entryFees: safeNum(data.expenses?.entryFees),
    activities: safeNum(data.expenses?.activities),
    total: 0, // will be recalculated below
  };

  // Recalculate total using the budget hotel option + street food for a "min" total
  const minTotal =
    data.expenses.transport +
    data.expenses.hotel.budget +
    data.expenses.food.street +
    data.expenses.entryFees +
    data.expenses.activities;

  // Recalculate total using premium hotel + restaurant food for a "max" total
  const maxTotal =
    data.expenses.transport +
    data.expenses.hotel.premium +
    data.expenses.food.restaurants +
    data.expenses.entryFees +
    data.expenses.activities;

  // Use the AI-provided total if reasonable, otherwise default to min total
  const aiTotal = safeNum(data.expenses.total);
  data.expenses.total = aiTotal > 0 ? aiTotal : minTotal;

  // ── 2. Route optimisation ─────────────────────────────────────────────────
  const alternatives = safeArray<{ type: string; cost: number }>(
    data.bestRoute?.alternatives
  ).map((a) => ({ ...a, cost: safeNum(a.cost) }));

  if (alternatives.length > 0) {
    // Sort by cost ascending
    alternatives.sort((a, b) => a.cost - b.cost);
    const cheapest = alternatives[0];
    const mostExpensive = alternatives[alternatives.length - 1];

    data.bestRoute = {
      recommended: cheapest.type,
      alternatives,
      savings: safeNum(mostExpensive.cost - cheapest.cost),
    };
  }

  // ── 3. Budget overspend warning ───────────────────────────────────────────
  if (budget > 0 && minTotal > budget) {
    const overBy = minTotal - budget;
    warnings.push({
      type: "overspend",
      message: `Your minimum estimated cost (₹${minTotal.toLocaleString()}) exceeds your budget by ₹${overBy.toLocaleString()}. Consider reducing hotel category or travel days.`,
      severity: "critical",
    });
  } else if (budget > 0 && maxTotal > budget) {
    warnings.push({
      type: "overspend",
      message: `Premium options (₹${maxTotal.toLocaleString()}) exceed your budget. Stick to budget hotels and street food to stay within ₹${budget.toLocaleString()}.`,
      severity: "warning",
    });
  }

  // ── 4. High-category alerts (>40 % of budget) ────────────────────────────
  if (budget > 0) {
    const threshold = budget * 0.4;
    const categories: { label: string; value: number }[] = [
      { label: "Transport", value: data.expenses.transport },
      { label: "Hotel (premium)", value: data.expenses.hotel.premium },
      { label: "Food (restaurants)", value: data.expenses.food.restaurants },
      { label: "Activities", value: data.expenses.activities },
    ];

    for (const cat of categories) {
      if (cat.value > threshold) {
        warnings.push({
          type: "high-category",
          message: `${cat.label} alone costs ₹${cat.value.toLocaleString()} — that's over 40% of your budget. Look for cheaper alternatives.`,
          severity: "warning",
        });
      }
    }
  }

  // ── 5. Extra savings tips ─────────────────────────────────────────────────
  const extraTips: string[] = [];

  if (data.expenses.hotel.premium > data.expenses.hotel.budget * 2) {
    extraTips.push(
      `Choosing budget accommodation saves you ₹${(data.expenses.hotel.premium - data.expenses.hotel.budget).toLocaleString()}.`
    );
  }

  if (data.expenses.food.restaurants > data.expenses.food.street * 2) {
    extraTips.push(
      `Eating street food instead of restaurants saves ₹${(data.expenses.food.restaurants - data.expenses.food.street).toLocaleString()}.`
    );
  }

  if (data.bestRoute?.savings && data.bestRoute.savings > 0) {
    extraTips.push(
      `Taking ${data.bestRoute.recommended} instead of the most expensive option saves ₹${data.bestRoute.savings.toLocaleString()}.`
    );
  }

  // Merge AI tips + our generated tips (deduplicate)
  const existingTips = safeArray<string>(data.tips);
  data.tips = [...new Set([...existingTips, ...extraTips])];

  // ── 6. Attach warnings ───────────────────────────────────────────────────
  data.warnings = [...safeArray<BudgetWarning>(data.warnings), ...warnings];

  // ── 7. Ensure arrays exist ────────────────────────────────────────────────
  data.itinerary = safeArray(data.itinerary);
  data.foodSuggestions = {
    budget: safeArray(data.foodSuggestions?.budget),
    famous: safeArray(data.foodSuggestions?.famous),
  };
  data.ecoImpact = data.ecoImpact || "";
  data.destination = data.destination || "Unknown";

  return data;
}
