// ─── AeroVoyage V2: Complete Type System ──────────────────────────────────────

// ── Antigravity Engine ────────────────────────────────────────────────────────

export interface AntigravityWeights {
  cost: number;      // 0–1
  time: number;      // 0–1
  comfort: number;   // 0–1
  experience: number;// 0–1
  safety: number;    // 0–1
  carbon: number;    // 0–1
}

export interface AntigravityScore {
  overall: number;   // 0–100
  cost: number;
  time: number;
  comfort: number;
  experience: number;
  safety: number;
  carbon: number;
  label: "Budget Saver" | "Speed King" | "Comfort Plus" | "Explorer" | "Eco Warrior" | "Balanced";
}

export interface RouteOption {
  type: string;
  cost: number;
  duration: string;
  comfort: number;    // 1–5
  carbonKg: number;
  antigravityScore?: AntigravityScore;
}

// ── Route & Transport ─────────────────────────────────────────────────────────

export interface RouteAlternative {
  type: string;
  cost: number;
  duration?: string;
}

export interface BestRoute {
  recommended: string;
  alternatives: RouteAlternative[];
  savings: number;
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export interface HotelCost {
  budget: number;
  premium: number;
}

export interface FoodCost {
  street: number;
  restaurants: number;
}

export interface Expenses {
  transport: number;
  hotel: HotelCost;
  food: FoodCost;
  entryFees: number;
  activities: number;
  total: number;
}

// ── Food ──────────────────────────────────────────────────────────────────────

export interface FoodItem {
  name: string;
  cost: number;
  location?: string;
}

export interface FoodSuggestions {
  budget: FoodItem[];
  famous: FoodItem[];
}

// ── Food Discovery (V2) ──────────────────────────────────────────────────────

export interface FoodDiscoveryItem {
  name: string;
  type: "street" | "cafe" | "restaurant" | "hidden-gem";
  cuisine: string;
  avgCost: number;
  location: string;
  safetyScore: number;    // 1–10
  mustTry: string[];
  tip: string;
}

export interface FoodDiscoveryResult {
  destination: string;
  hiddenGems: FoodDiscoveryItem[];
  budgetPicks: FoodDiscoveryItem[];
  famousSpots: FoodDiscoveryItem[];
  dietaryNotes: string[];
  waterSafety: string;
}

// ── Hotel Intelligence (V2) ──────────────────────────────────────────────────

export interface HotelOption {
  name: string;
  category: "budget" | "mid-range" | "premium" | "luxury";
  pricePerNight: number;
  safetyScore: number;   // 1–10
  cleanlinessScore: number;
  locationScore: number;
  noiseLevel: "quiet" | "moderate" | "noisy";
  nearbyLandmarks: string[];
  tip: string;
}

export interface HotelIntelligenceResult {
  destination: string;
  recommended: HotelOption;
  budgetOptions: HotelOption[];
  premiumOptions: HotelOption[];
  scamWarnings: string[];
  tips: string[];
}

// ── Safety System (V2) ───────────────────────────────────────────────────────

export interface SafetyScore {
  overall: number;         // 1–100
  crimeRisk: "low" | "moderate" | "high";
  scamRisk: "low" | "moderate" | "high";
  healthRisk: "low" | "moderate" | "high";
  transportSafety: "safe" | "moderate" | "risky";
  naturalDisaster: "low" | "moderate" | "high";
}

export interface SafetyResult {
  destination: string;
  score: SafetyScore;
  commonScams: { name: string; description: string; avoidTip: string }[];
  emergencyNumbers: { service: string; number: string }[];
  healthTips: string[];
  travelAdvisory: string;
  safeAreas: string[];
  avoidAreas: string[];
}

// ── Activity Planner (V2) ────────────────────────────────────────────────────

export interface Activity {
  name: string;
  type: "cultural" | "adventure" | "relaxation" | "nightlife" | "nature" | "shopping";
  cost: number;
  duration: string;
  bestTime: string;
  weatherDependent: boolean;
  crowdLevel: "low" | "moderate" | "high";
  rating: number;
  tip: string;
}

export interface PackingItem {
  item: string;
  category: "clothes" | "tech" | "documents" | "medicine" | "misc";
  essential: boolean;
}

export interface ActivityResult {
  destination: string;
  days: number;
  activities: Activity[];
  packingList: PackingItem[];
  weatherForecast: string;
  bestTimeToVisit: string;
}

// ── Itinerary ─────────────────────────────────────────────────────────────────

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

// ── Budget Warnings ───────────────────────────────────────────────────────────

export interface BudgetWarning {
  type: "overspend" | "high-category" | "savings-tip";
  message: string;
  severity: "info" | "warning" | "critical";
}

// ── Optimized Trip Plan (V2) ─────────────────────────────────────────────────

export type TravelMood = "chill" | "adventure" | "luxury" | "backpacker" | "cultural" | "romantic";

export interface TripCity {
  city: string;
  days: number;
}

export interface OptimizedTripPlan {
  destination: string;
  bestRoute: BestRoute;
  expenses: Expenses;
  foodSuggestions: FoodSuggestions;
  itinerary: ItineraryDay[];
  tips: string[];
  ecoImpact: string;
  hotelSuggestion?: string;
  warnings: BudgetWarning[];
  antigravityScore?: AntigravityScore;
  carbonKg?: number;
  mood?: TravelMood;
  cities?: TripCity[];
}

// ── Chat History ──────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "bot";
  content: string;
  timestamp: number;
}

// ── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  defaultMood: TravelMood;
  budgetStyle: "ultra-budget" | "budget" | "moderate" | "premium" | "luxury";
  dietaryPref: string[];
  interests: string[];
  carbonConscious: boolean;
  theme: "dark" | "light";
}

// ── Saved Trip ───────────────────────────────────────────────────────────────

export interface SavedTrip {
  id: number;
  userId: number;
  destination: string;
  cities: string;
  mood: TravelMood;
  budget: number;
  days: number;
  travelers: number;
  data: string;          // JSON of OptimizedTripPlan
  antigravityScore: number;
  carbonKg: number;
  createdAt: string;
}
