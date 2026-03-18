import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Compass, Shield, UtensilsCrossed, Ticket, Map, LayoutDashboard, Zap,
  Leaf, ArrowRight, Sparkles, Star, Heart,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Static Data ──────────────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Map, title: "Smart Planner", desc: "Multi-city AI trip planning with Antigravity scoring", path: "/planner", color: "#06B6D4" },
  { icon: Shield, title: "Safety Hub", desc: "Scam detection, risk analysis & emergency info", path: "/safety", color: "#10B981" },
  { icon: UtensilsCrossed, title: "Food Explorer", desc: "Discover hidden gems & local street food", path: "/food", color: "#F97316" },
  { icon: Ticket, title: "Activity Planner", desc: "Weather-aware activities & smart packing list", path: "/activities", color: "#8b5cf6" },
  { icon: LayoutDashboard, title: "Dashboard", desc: "Track trips, spending & carbon footprint", path: "/dashboard", color: "#0EA5E9" },
  { icon: Leaf, title: "Eco Tracker", desc: "Carbon footprint analysis for every trip", path: "/planner", color: "#22D3EE" },
];

const DESTINATIONS = [
  { name: "Santorini, Greece", price: "₹1,20,000", rating: 4.9, image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop" },
  { name: "Kyoto, Japan", price: "₹95,000", rating: 4.8, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" },
  { name: "Swiss Alps", price: "₹1,50,000", rating: 5.0, image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop" },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);

  /* Framer-Motion parallax for hero image */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  /* GSAP scroll-triggered animations */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feature-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
      });

      gsap.from(".dest-card", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top 75%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* ── Cinematic Hero ──────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative w-full h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Dark overlay for dark mode, lighter overlay for light mode */}
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>

        <motion.div style={{ opacity, y: y2 }} className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--color-teal)]/30 text-[var(--color-cyan-glow)] text-sm font-medium mb-8 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen AI Travel Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-display leading-tight hero-heading"
          >
            Design your <br />
            <span className="text-gradient">dream journey.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Experience the future of travel planning. Our AI instantly generates personalized
            itineraries, calculates exact budgets, and curates luxury experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/planner"
              className="glow-button group relative inline-flex items-center justify-center gap-2 px-8 py-4 btn-primary rounded-full font-semibold text-lg transition-transform hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Plan My Trip <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            {[
              { label: "AI Models", value: "3" },
              { label: "Score Dimensions", value: "6" },
              { label: "Systems", value: "10+" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-bold font-display text-gradient">{s.value}</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Feature Grid (GSAP scroll-triggered) ─────────────────────────────── */}
      <div ref={featuresRef} className="features-section relative z-10 w-full max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Everything You <span className="text-gradient">Need</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto">
            One platform for every aspect of your journey — powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <Link to={feat.path} key={i} className="block h-full feature-card">
                <div className="glass-card h-full p-8 rounded-3xl group cursor-pointer">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    style={{ backgroundColor: feat.color + "15" }}
                  >
                    <Icon className="w-7 h-7" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-xl font-bold font-display mb-2">{feat.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feat.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium" style={{ color: feat.color }}>
                    Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Trending Destinations (GSAP scroll-triggered) ────────────────────── */}
      <div ref={showcaseRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Trending <span className="text-gradient">Destinations</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            Discover the most sought-after locations curated by our AI intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DESTINATIONS.map((dest, i) => (
            <div key={i} className="dest-card group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {/* Dark gradient overlay always — keeps text readable on the image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors z-20 border border-white/10">
                <Heart className="w-5 h-5 text-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold font-display text-white">{dest.name}</h3>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/30 backdrop-blur-md text-sm font-medium text-emerald-400 border border-white/10">
                    <Star className="w-4 h-4 fill-current" /> {dest.rating}
                  </div>
                </div>
                <p className="text-cyan-300 font-semibold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  Est. {dest.price} / person
                </p>
                <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-[var(--color-teal)] text-white font-medium backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 delay-200">
                  Explore Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Antigravity Engine Section ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="glass-card rounded-3xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-teal)]/10 border border-[var(--color-teal)]/30 mb-6">
                <Zap className="w-4 h-4 text-[var(--color-teal)]" />
                <span className="text-xs font-semibold text-[var(--color-teal)] uppercase tracking-wider">Core Technology</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Antigravity <span className="text-gradient">Engine</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                Our proprietary 6-dimension scoring algorithm evaluates every travel option across
                cost, time, comfort, experience, safety, and carbon impact — giving you a single
                intelligence score to make the best decision.
              </p>
              <Link to="/planner" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-full font-semibold">
                Try It Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Cost", score: 87, color: "#06B6D4" },
                { label: "Time", score: 72, color: "#0EA5E9" },
                { label: "Comfort", score: 91, color: "#8b5cf6" },
                { label: "Experience", score: 95, color: "#F97316" },
                { label: "Safety", score: 88, color: "#10B981" },
                { label: "Carbon", score: 76, color: "#22D3EE" },
              ].map((d, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass p-4 rounded-2xl text-center"
                >
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" className="stroke-[rgba(255,255,255,0.05)] [data-theme=light]:stroke-[rgba(0,0,0,0.06)]" strokeWidth="6" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke={d.color}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={`${d.score * 2.51} ${251 - d.score * 2.51}`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: d.color }}>
                      {d.score}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-secondary)]">{d.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">
            Ready to <span className="text-gradient">Fly Smart</span>?
          </h2>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xl mx-auto">
            Join the future of AI-powered travel. Plan, optimize, and explore like never before.
          </p>
          <Link to="/planner"
            className="inline-flex items-center gap-2 px-10 py-5 btn-primary rounded-full font-semibold text-lg"
          >
            <Compass className="w-6 h-6" /> Launch Planner <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
