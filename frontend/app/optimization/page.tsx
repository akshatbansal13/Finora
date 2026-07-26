"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SpatialCard from "@/components/SpatialCard";
import ComparisonChart from "@/components/charts/ComparisonChart";
import { SkeletonCard, SkeletonChart } from "@/components/SkeletonLoader";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import { api } from "@/lib/api";

const strategies = [
  { key: "max_sharpe", label: "Max Sharpe", desc: "Highest risk-adjusted return" },
  { key: "min_volatility", label: "Min Volatility", desc: "Lowest portfolio risk" },
  { key: "efficient_return", label: "Efficient Return", desc: "Target return constraint" },
  { key: "efficient_risk", label: "Efficient Risk", desc: "Target risk constraint" },
  { key: "equal_weight", label: "Equal Weight", desc: "Uniform distribution" },
];

interface Portfolio {
  id: number;
  name: string;
}

interface PortfolioMetrics {
  expected_annual_return?: number;
  annual_volatility?: number;
  sharpe_ratio?: number;
}

interface Recommendation {
  ticker?: string;
  recommendation?: string;
  current_weight?: number;
  optimized_weight?: number;
}

interface OptimizationResult {
  current_portfolio?: {
    weights?: Record<string, number>;
    metrics?: PortfolioMetrics;
  };
  optimized_portfolio?: {
    weights?: Record<string, number>;
    metrics?: PortfolioMetrics;
  };
  performance?: {
    return_improvement?: number;
    volatility_reduction?: number;
    sharpe_improvement?: number;
  };
  recommendations?: Recommendation[];
}

export default function OptimizationPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [strategy, setStrategy] = useState("max_sharpe");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await api.portfolio.list();
      if (res.success && Array.isArray(res.data)) {
        setPortfolios(res.data);
        if (res.data.length > 0) setSelectedPid(res.data[0].id);
      }
    })();
  }, []);

  async function handleOptimize() {
    if (!selectedPid) return;
    setLoading(true);
    setError("");
    setResult(null);
    const res = await api.portfolio.optimize(selectedPid, strategy);
    setLoading(false);
    if (res.success) {
      setResult(res.data as OptimizationResult);
    } else {
      setError(res.message || "Optimization failed");
    }
  }

  const compData = result
    ? Object.keys(result.optimized_portfolio?.weights || {}).map((t) => ({
        name: t,
        current: result.current_portfolio?.weights?.[t] || 0,
        optimized: result.optimized_portfolio?.weights?.[t] || 0,
      }))
    : [];

  const curr = result?.current_portfolio?.metrics;
  const opt = result?.optimized_portfolio?.metrics;
  const perf = result?.performance;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Optimization</h1>
        <p className="text-muted-foreground mt-1 text-sm">Modern Portfolio Theory — Efficient Frontier analysis</p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 space-y-5">
        {/* Portfolio Selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Select Portfolio</label>
          <select value={selectedPid || ""} onChange={(e) => setSelectedPid(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all cursor-pointer">
            {portfolios.map((p: Portfolio) => <option key={p.id} value={p.id} className="bg-[#111]">{p.name}</option>)}
          </select>
        </div>

        {/* Strategy Selector */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Optimization Strategy</label>
          <div className="flex flex-wrap gap-2">
            {strategies.map((s) => (
              <motion.button key={s.key} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setStrategy(s.key)} className="relative px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer">
                {strategy === s.key && (
                  <motion.div layoutId="opt-strategy" className="absolute inset-0 bg-white/[0.08] rounded-xl border border-emerald-500/20" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className={`relative z-10 ${strategy === s.key ? "text-emerald-400" : "text-muted-foreground"}`}>{s.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Optimize Button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleOptimize} disabled={loading || !selectedPid} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {loading ? "Optimizing..." : "Run Optimization"}
          </span>
        </motion.button>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          <SkeletonChart />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Current vs Optimized Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpatialCard hoverGlow="none" className="border-white/[0.04]">
                <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">Current Portfolio</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Expected Return</span><span className="text-sm font-semibold text-white">{((curr?.expected_annual_return || 0) * 100).toFixed(2)}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Volatility</span><span className="text-sm font-semibold text-white">{((curr?.annual_volatility || 0) * 100).toFixed(2)}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Sharpe Ratio</span><span className="text-sm font-semibold text-white">{(curr?.sharpe_ratio || 0).toFixed(3)}</span></div>
                </div>
              </SpatialCard>
              <SpatialCard hoverGlow="emerald" className="border-emerald-500/10">
                <p className="text-xs text-emerald-400 mb-4 font-medium uppercase tracking-wider">Optimized Portfolio</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expected Return</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{((opt?.expected_annual_return || 0) * 100).toFixed(2)}%</span>
                      {(perf?.return_improvement ?? 0) > 0 && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{((perf?.return_improvement ?? 0) * 100).toFixed(2)}%</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Volatility</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{((opt?.annual_volatility || 0) * 100).toFixed(2)}%</span>
                      {(perf?.volatility_reduction ?? 0) > 0 && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />-{((perf?.volatility_reduction ?? 0) * 100).toFixed(2)}%</span>}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{(opt?.sharpe_ratio || 0).toFixed(3)}</span>
                      {(perf?.sharpe_improvement ?? 0) > 0 && <span className="text-xs text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{(perf?.sharpe_improvement ?? 0).toFixed(3)}</span>}
                    </div>
                  </div>
                </div>
              </SpatialCard>
            </div>

            {/* Comparison Chart */}
            {compData.length > 0 && <ComparisonChart data={compData} title="Weight Allocation: Current vs Optimized" />}

            {/* Rebalancing Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">Rebalancing Recommendations</h3>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                  {result.recommendations?.map((r: Recommendation, i: number) => (
                    <motion.div key={i} variants={staggerItem} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${r.recommendation?.includes("Buy") ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                          {r.recommendation?.includes("Buy") ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{r.ticker}</p>
                          <p className="text-xs text-muted-foreground">{r.recommendation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{((r.current_weight ?? 0) * 100).toFixed(1)}% → {((r.optimized_weight ?? 0) * 100).toFixed(1)}%</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!result && !loading && !error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-muted-foreground" />
            </div>
          </motion.div>
          <p className="text-muted-foreground text-sm">Select a portfolio and strategy, then run optimization</p>
        </motion.div>
      )}
    </PageTransition>
  );
}
