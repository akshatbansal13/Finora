"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  Brain,
  GitBranch,
  Database,
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  ShieldAlert,
  Cpu,
  Network,
  Zap,
  Globe2,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Shield,
} from "lucide-react";

import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

import AnimatedCounter from "@/components/AnimatedCounter";
import {
  wordReveal,
  wordRevealChild,
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

/* ================================================================
   DATA
   ================================================================ */

const heroHeading = "AI-Powered Investment Intelligence";

const tickerData = [
  { symbol: "AAPL", price: "192.53", change: "+1.23%" },
  { symbol: "MSFT", price: "415.10", change: "+0.85%" },
  { symbol: "NVDA", price: "875.30", change: "+2.41%" },
  { symbol: "TSLA", price: "175.22", change: "-1.12%" },
  { symbol: "AMZN", price: "178.15", change: "+0.45%" },
  { symbol: "META", price: "485.58", change: "+1.78%" },
  { symbol: "GOOGL", price: "155.45", change: "-0.22%" },
  { symbol: "NFLX", price: "612.30", change: "+2.11%" },
];

const features = [
  {
    icon: Brain,
    title: "Agentic AI",
    description: "6 specialized AI agents working in concert — each trained for a distinct investment research domain, from macro analysis to sentiment decoding.",
    glow: "emerald",
    gradient: "from-emerald-500 to-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    icon: GitBranch,
    title: "Multi-Agent Workflow",
    description: "LangGraph-powered orchestration routes tasks intelligently across agents, enabling parallel analysis and consensus-driven insights.",
    glow: "blue",
    gradient: "from-blue-500 to-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Database,
    title: "RAG Pipeline",
    description: "Context-aware document analysis ingests SEC filings, earnings transcripts, and research papers for grounded, citation-backed responses.",
    glow: "cyan",
    gradient: "from-cyan-500 to-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    icon: Target,
    title: "Portfolio Optimization",
    description: "Modern Portfolio Theory meets AI — optimize allocation across assets for maximum risk-adjusted returns on the efficient frontier.",
    glow: "emerald",
    gradient: "from-emerald-500 to-teal-400",
    iconBg: "bg-emerald-500/10",
  },
];

const stats = [
  { value: 6, suffix: "", label: "AI Agents", prefix: "" },
  { value: 5, suffix: "", label: "Strategies", prefix: "" },
  { value: 24, suffix: "/7", label: "Real-Time Market Data", prefix: "" },
  { value: 100, suffix: "%", label: "Paper Trading", prefix: "" },
];

/* ================================================================
   COMPONENTS
   ================================================================ */

function TickerTape() {
  return (
    <div className="w-full overflow-hidden bg-black/30 border-y border-white/5 py-2 z-50 fixed top-[60px] backdrop-blur-xl">
      <div className="flex w-[200%] animate-ticker hover:[animation-play-state:paused]">
        {[...tickerData, ...tickerData].map((stock, i) => {
          const isPositive = stock.change.startsWith("+");
          return (
            <div key={i} className="flex-1 flex items-center justify-center gap-3 px-8 border-r border-white/5">
              <span className="text-xs font-bold text-white/80 tracking-wider">{stock.symbol}</span>
              <span className="text-xs font-medium text-white">${stock.price}</span>
              <span className={`flex items-center text-xs font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {stock.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] mix-blend-screen animate-pulse duration-[12s] delay-1000" />
      <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px] mix-blend-screen animate-pulse duration-[8s] delay-500" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
    </div>
  );
}

/* ================================================================
   SCROLLYTELLING SECTIONS
   ================================================================ */

function ScrollytellingFeatures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      const newIndex = Math.min(Math.floor(latest * features.length), features.length - 1);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    });
  }, [smoothProgress, activeIndex]);

  const bgRotate = useTransform(smoothProgress, [0, 1], [0, 90]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.5]);

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        <motion.div
          style={{ rotate: bgRotate, scale: bgScale }}
          className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-30"
        >
          <div className="w-[800px] h-[800px] border border-white/5 rounded-full border-dashed animate-spin-slow" />
          <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full border-dashed animate-spin-reverse-slow" />
        </motion.div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 w-max shadow-xl"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium tracking-wide text-white/80 uppercase">How It Works</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-8 font-[family-name:var(--font-outfit)] text-white">
              Symphony of <span className="text-gradient">Agents</span>
            </h2>

            <div className="space-y-6 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10">
                <motion.div
                  className="w-full bg-emerald-500"
                  style={{ 
                    height: useTransform(smoothProgress, [0, 1], ["0%", "100%"]),
                    boxShadow: "0 0 10px #10b981"
                  }}
                />
              </div>

              {features.map((feature, i) => (
                <div key={i} className="pl-12 relative">
                  <div
                    className={`absolute left-[11px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 transition-all duration-500 ${
                      i === activeIndex
                        ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_#10b981] scale-150"
                        : i < activeIndex
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-black border-white/30"
                    }`}
                  />
                  <h3
                    className={`text-xl md:text-2xl font-bold transition-all duration-500 ${
                      i === activeIndex ? "text-white" : "text-white/30"
                    }`}
                  >
                    {feature.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative h-[500px] w-full flex items-center justify-center" style={{ perspective: 2000 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, rotateX: 45, rotateY: 20, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, rotateX: 0, rotateY: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, rotateX: -45, rotateY: -20, y: -50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="absolute w-full max-w-md transform-gpu"
              >
                <div className="material-2 rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`w-20 h-20 rounded-2xl ${features[activeIndex].iconBg} flex items-center justify-center mb-8 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`}>
                    {(() => {
                      const ActiveIcon = features[activeIndex].icon;
                      return (
                        <ActiveIcon
                          className={`w-10 h-10 bg-gradient-to-br ${features[activeIndex].gradient} bg-clip-text`}
                          style={{
                            color:
                              features[activeIndex].glow === "emerald"
                                ? "#10b981"
                                : features[activeIndex].glow === "blue"
                                ? "#3b82f6"
                                : features[activeIndex].glow === "cyan"
                                ? "#06b6d4"
                                : "#8b5cf6",
                          }}
                        />
                      );
                    })()}
                  </div>
                  
                  <h4 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-outfit)]">
                    {features[activeIndex].title}
                  </h4>
                  <p className="text-slate-300 text-lg leading-relaxed font-light">
                    {features[activeIndex].description}
                  </p>
                  
                  <div className="mt-8 flex gap-3 opacity-50">
                    <div className="h-1.5 w-12 rounded-full bg-white/20" />
                    <div className="h-1.5 w-6 rounded-full bg-white/10" />
                    <div className="h-1.5 w-6 rounded-full bg-white/10" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}

const initialMarkets = [
  { id: "NY", name: "NYSE", val: 7457.69, change: 1.24, coords: [-74.006, 40.7128] as [number, number], status: "OPEN" },
  { id: "TSX", name: "TSX", val: 22800.50, change: 0.15, coords: [-79.3832, 43.6532] as [number, number], status: "OPEN" },
  { id: "B3", name: "B3", val: 128500.00, change: -0.80, coords: [-46.6333, -23.5505] as [number, number], status: "OPEN" },
  { id: "LDN", name: "LSE", val: 10600.37, change: -0.41, coords: [-0.1276, 51.5072] as [number, number], status: "CLOSED" },
  { id: "FRA", name: "DAX", val: 24823.50, change: 0.85, coords: [8.6821, 50.1109] as [number, number], status: "CLOSED" },
  { id: "JSE", name: "JSE", val: 82500.20, change: 0.45, coords: [28.0473, -26.2041] as [number, number], status: "CLOSED" },
  { id: "BOM", name: "NSE", val: 24216.80, change: -0.40, coords: [72.8777, 19.0760] as [number, number], status: "OPEN" },
  { id: "SGX", name: "SGX", val: 3450.10, change: 0.20, coords: [103.8198, 1.3521] as [number, number], status: "OPEN" },
  { id: "HKG", name: "HKEX", val: 25016.00, change: -1.10, coords: [114.1694, 22.3193] as [number, number], status: "OPEN" },
  { id: "TKY", name: "TSE", val: 64141.12, change: 2.18, coords: [139.6917, 35.6895] as [number, number], status: "OPEN" },
  { id: "SYD", name: "ASX", val: 8796.70, change: 0.32, coords: [151.2093, -33.8688] as [number, number], status: "OPEN" },
];

const isVisible = (coords: [number, number], rotation: number) => {
  const centerLon = -rotation;
  const centerLat = 15; // Camera is pitched -15, so we look at lat +15
  const lon1 = (coords[0] * Math.PI) / 180;
  const lat1 = (coords[1] * Math.PI) / 180;
  const lon2 = (centerLon * Math.PI) / 180;
  const lat2 = (centerLat * Math.PI) / 180;
  const a =
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lon2 - lon1) / 2) ** 2;
  const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return distance < Math.PI / 2 - 0.2; // Hide before it hits the absolute edge
};

function EarthGlobe() {
  const [isMounted, setIsMounted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [markets, setMarkets] = useState(initialMarkets);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Dynamic price simulation loop
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        if (m.status === "CLOSED") return m; // Don't update closed markets
        
        // Randomly fluctuate between -0.15% and +0.15% of the value
        const fluctuation = m.val * (Math.random() * 0.003 - 0.0015);
        const newVal = m.val + fluctuation;
        
        // Calculate new percentage change
        const changeDiff = (fluctuation / m.val) * 100;
        const newChange = m.change + changeDiff;

        return { ...m, val: newVal, change: newChange };
      }));
    }, 1500); // update every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let currentRotation = 0;
    
    const animate = () => {
      currentRotation -= 2.0; // Smooth rotation
      setRotation(currentRotation);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[450px] bg-black/40 relative flex items-center justify-center rounded-b-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        <div className="relative w-[420px] h-[420px] flex items-center justify-center transform-gpu mt-4">
           <div className="absolute inset-0 rounded-full bg-black/90 blur-sm z-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] bg-black/40 relative flex items-center justify-center rounded-b-3xl overflow-hidden">
      {/* Background Subtle White Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      
      {/* High-Tech Glowing Core with SVG Continents */}
      <div className="relative w-[420px] h-[420px] flex items-center justify-center transform-gpu mt-4">
        
        {/* Core solid dark background behind map */}
        <div className="absolute inset-0 rounded-full bg-black/90 blur-sm z-0" />
        
        {/* The SVG Map Globe with Pulsing Red/Green Glow */}
        <motion.div 
          animate={{ 
            boxShadow: [
              "inset 0 0 70px rgba(239,68,68,0.5), 0 0 50px rgba(239,68,68,0.3)",  // Red glow
              "inset 0 0 70px rgba(16,185,129,0.5), 0 0 50px rgba(16,185,129,0.3)", // Green glow
              "inset 0 0 70px rgba(239,68,68,0.5), 0 0 50px rgba(239,68,68,0.3)"   // Back to Red
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full overflow-hidden z-10 flex items-center justify-center"
        >
          <ComposableMap
            width={420}
            height={420}
            projection="geoOrthographic"
            projectionConfig={{
              scale: 210, // Must match half the width/height to fill it
              center: [0, 0],
              rotate: [rotation, -15, 0] 
            }}
            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(255, 255, 255, 0.9)" // Bright white continents
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#ffffff" },
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Rotating SVG Markers with Dynamic Values */}
            {markets.map((market) => {
              const visible = isVisible(market.coords, rotation);
              if (!visible) return null;

              const isPositive = market.change >= 0;
              const changeStr = `${isPositive ? '+' : ''}${market.change.toFixed(2)}%`;
              const valStr = market.val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const color = isPositive ? '#34d399' : '#f87171'; // Green or Red

              return (
                <Marker key={market.id} coordinates={market.coords}>
                  {/* Pinpoint Circle colored by market performance */}
                  <circle r={4} fill={color} />
                  
                  {/* Floating Data Card */}
                  <g transform="translate(12, -22)">
                    {/* SVG Rect Card */}
                    <rect x="0" y="0" width="85" height="42" fill="rgba(0,0,0,0.85)" rx="5" stroke="rgba(255,255,255,0.15)"/>
                    {/* Title */}
                    <text x="8" y="14" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="system-ui">{market.name}</text>
                    {/* Value */}
                    <text x="8" y="26" fill="#cbd5e1" fontSize="9" fontFamily="system-ui">{valStr}</text>
                    {/* Price Change */}
                    <text x="8" y="38" fill={color} fontSize="9" fontWeight="bold" fontFamily="system-ui">{changeStr}</text>
                    {/* Status Dot (Open/Closed indicator) */}
                    <circle cx="73" cy="12" r="3" fill={market.status === 'OPEN' ? '#10b981' : '#64748b'} />
                  </g>
                </Marker>
              );
            })}
          </ComposableMap>
        </motion.div>

        {/* Orbital Rings */}
        <motion.div
          animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] rounded-full border-2 border-dashed border-white/20 transform-gpu preserve-3d pointer-events-none z-20"
          style={{ transformStyle: 'preserve-3d' }}
        />
        <motion.div
          animate={{ rotateX: [360, 0], rotateZ: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] rounded-full border border-white/10 transform-gpu preserve-3d pointer-events-none z-20"
          style={{ transformStyle: 'preserve-3d' }}
        />
      </div>
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.85]);
  const heroY = useTransform(heroScroll, [0, 1], [0, 150]);
  const heroRotateX = useTransform(heroScroll, [0, 1], [0, 15]);

  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <main className="relative min-h-screen bg-black overflow-clip font-sans selection:bg-emerald-500/30 text-white">
      <AmbientBackground />
      <TickerTape />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[110vh] flex items-center justify-center pt-32" style={{ perspective: 1000 }}>
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center transform-gpu origin-top"
        >
          <motion.h1
            variants={wordReveal}
            initial="hidden"
            animate="visible"
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter leading-[1.05] mb-8 font-[family-name:var(--font-outfit)]"
          >
            {heroHeading.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={wordRevealChild}
                className="inline-block mr-[0.25em]"
                style={{
                  backgroundImage:
                    i >= 0 && i <= 1
                      ? "linear-gradient(135deg, #ffffff, #a1a1aa)"
                      : i === 2
                      ? "linear-gradient(135deg, #f4f4f5, #71717a)"
                      : undefined,
                  WebkitBackgroundClip: i <= 2 ? "text" : undefined,
                  WebkitTextFillColor: i <= 2 ? "transparent" : undefined,
                  backgroundClip: i <= 2 ? "text" : undefined,
                  color: i > 2 ? "#ffffff" : undefined,
                  textShadow: i <= 2 ? "0 0 40px rgba(255, 255, 255, 0.15)" : "none"
                }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            Harness a multi-agent AI platform that researches, analyzes, and optimizes your
            investment portfolio — with full explainability and zero guesswork.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/portfolio">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-lg tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:bg-white/15 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" />
                  Launch Platform
                </span>
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 150, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl mx-auto mt-24 relative pointer-events-none"
            style={{ perspective: 2000 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 rounded-3xl" />
            
            <div 
              className="relative rounded-3xl material-3 shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10"
            >
              <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-white/[0.03] rounded-t-3xl">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-6 w-48 bg-white/5 rounded-md" />
                </div>
              </div>
              <EarthGlobe />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── SCROLLYTELLING PINNED SECTION ────────────────── */}
      <ScrollytellingFeatures />

      {/* ─── STATS ────────────────────────────────────────── */}
      <section ref={statsRef} className="relative z-20 py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="material-2 rounded-[2.5rem] p-12 sm:p-16 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden"
          >
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-emerald-500/10 via-transparent to-transparent opacity-50" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="text-center relative group"
                >
                  {i > 0 && (
                    <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 hidden md:block w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                  )}
                  <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4 font-[family-name:var(--font-outfit)] tracking-tighter drop-shadow-lg">
                    {statsInView ? (
                      <AnimatedCounter
                        value={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals || 0}
                        duration={2.5}
                      />
                    ) : (
                      <span className="opacity-0">0</span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-slate-400 font-medium tracking-widest uppercase transition-colors group-hover:text-emerald-400">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────── */}
      <section className="relative z-20 py-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="relative z-10"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter mb-8 font-[family-name:var(--font-outfit)]">
              Ready to Invest <span className="text-gradient">Smarter</span>?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-xl sm:text-2xl mb-14 font-light leading-relaxed">
              Experience the future of financial research with multi-agent AI.
            </p>
            <Link href="/portfolio">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-5 rounded-3xl bg-white text-black font-bold text-xl tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300 cursor-pointer overflow-hidden border border-transparent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  Enter Platform
                  <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 overflow-hidden bg-white">
                <img src="/logo1.png" alt="Finora Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">Finora</span>
            </div>

            <nav className="flex items-center gap-10 text-base font-medium text-slate-400">
              <Link href="/portfolio" className="hover:text-white transition-colors">
                Portfolio
              </Link>
              <span className="hover:text-white transition-colors cursor-pointer">Docs</span>
              <a href="https://github.com/akshatbansal13" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/akshat13bansal/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer">
                LinkedIn
              </a>
            </nav>

            <p className="text-sm text-slate-500 font-medium tracking-wide">
              © {new Date().getFullYear()} Finora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
