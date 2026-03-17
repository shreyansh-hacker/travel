import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin, Plane, Sparkles, ImagePlus, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Feature cards animation
      gsap.from(".feature-card", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features-section",
          start: "top 80%",
        }
      });

      // Destination cards animation
      gsap.from(".dest-card", {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top 75%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const destinations = [
    { name: "Santorini, Greece", price: "₹1,20,000", rating: 4.9, image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop" },
    { name: "Kyoto, Japan", price: "₹95,000", rating: 4.8, image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" },
    { name: "Swiss Alps", price: "₹1,50,000", rating: 5.0, image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-hidden">
      {/* Cinematic Hero */}
      <div ref={heroRef} className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/80 via-transparent to-[var(--color-navy)]" />
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
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-display leading-tight"
          >
            Design your <br />
            <span className="text-gradient">dream journey.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Experience the future of travel planning. Our AI instantly generates personalized itineraries, calculates exact budgets, and curates luxury experiences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/planner"
              className="glow-button group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-ocean)] text-white rounded-full font-semibold text-lg transition-transform hover:scale-105 active:scale-95 overflow-hidden border border-white/10"
            >
              <span className="relative z-10 flex items-center gap-2">
                Plan My Trip <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Grid */}
      <div className="features-section relative z-10 w-full max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: MapPin,
            title: "Smart Itineraries",
            desc: "AI-generated day-by-day plans tailored to your exact budget and luxury preferences.",
          },
          {
            icon: Plane,
            title: "Expense Analytics",
            desc: "Precise calculations for hotels, food, transport, with visual breakdown charts.",
          },
          {
            icon: ImagePlus,
            title: "Cinematic Memories",
            desc: "Enhance your travel photos instantly using advanced AI image editing.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="feature-card glass-card p-8 rounded-3xl group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-grad-1)] to-[var(--color-teal)] flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-110 transition-transform duration-500">
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 font-display">{feature.title}</h3>
            <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Destination Showcase */}
      <div ref={showcaseRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">Trending <span className="text-gradient">Destinations</span></h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">Discover the most sought-after locations curated by our AI intelligence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, i) => (
            <div key={i} className="dest-card group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)] via-[var(--color-navy)]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors z-20">
                <Heart className="w-5 h-5 text-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold font-display text-white">{dest.name}</h3>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg glass text-sm font-medium text-[var(--color-success)]">
                    <Star className="w-4 h-4 fill-current" /> {dest.rating}
                  </div>
                </div>
                <p className="text-[var(--color-cyan-glow)] font-semibold mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">Est. {dest.price} / person</p>
                <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-[var(--color-teal)] text-white font-medium backdrop-blur-md border border-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100 delay-200">
                  Explore Itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
