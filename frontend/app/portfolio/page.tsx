"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Trash2, X, Wallet, TrendingUp, Brain, DollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Activity, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import PageTransition from "@/components/PageTransition";
import MetricCard from "@/components/MetricCard";
import SpatialCard from "@/components/SpatialCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { fadeUp, staggerContainer, staggerItem, tableRow } from "@/lib/animations";
import { api } from "@/lib/api";

const AllocationChart = dynamic(() => import("@/components/charts/AllocationChart"), { ssr: false });
const SparklineChart = dynamic(() => import("@/components/charts/SparklineChart"), { ssr: false });

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  
  // Dashboard states for selected portfolio
  const [perf, setPerf] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [holdings, setHoldings] = useState<any[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", initial_balance: 100000 });

  // Quick Trade State
  const [tradeForm, setTradeForm] = useState({ ticker: "", qty: 1 });
  const [trading, setTrading] = useState(false);
  const [tradeError, setTradeError] = useState("");



  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    const res = await api.portfolio.list();
    if (res.success && res.data) setPortfolios(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Load Full Dashboard Data for Selected Portfolio
  async function selectPortfolio(p: any) {
    setSelected(p);
    setLoadingDetail(true);
    try {
      const [pRes, hRes, rRes] = await Promise.all([
        api.portfolio.performance(p.id),
        api.trading.history(p.id),
        api.analysis.recentReports()
      ]);

      if (pRes.success) {
        const pd = pRes.data;
        setPerf(pd);
        setHoldings(pd.diversification || []);
        
        const hist = hRes.success ? hRes.data : [];
        setHistory(hist.slice(0, 10)); // Top 10 recent
        
        if (rRes.success) {
          setReports(rRes.data || []);
        }

        // Generate Performance Chart Data
        const initialBal = p.initial_balance || 100000;
        let cData = [];
        if (hist.length > 0) {
          const sortedHist = [...hist].sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
          cData.push({ date: "Start", value: initialBal });
          let runningBal = initialBal;
          sortedHist.forEach(t => {
            const dt = new Date(t.transaction_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            cData.push({ date: dt, value: runningBal });
          });
          cData.push({ date: "Today", value: pd.current_portfolio_value });
        } else {
          cData = [
            { date: "Start", value: initialBal },
            { date: "Today", value: pd.current_portfolio_value }
          ];
        }
        setChartData(cData);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingDetail(false);
  }

  // Reload details after a trade or rebalance
  async function refreshSelected() {
    if (selected) await selectPortfolio(selected);
    await fetchPortfolios();
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    const res = await api.portfolio.create(form.name, form.description, form.initial_balance);
    setCreating(false);
    if (res.success) {
      setShowCreate(false);
      setForm({ name: "", description: "", initial_balance: 100000 });
      fetchPortfolios();
    }
  }

  async function handleDelete(id: number) {
    await api.portfolio.delete(id);
    if (selected?.id === id) {
      setSelected(null);
      setPerf(null);
    }
    fetchPortfolios();
  }

  async function executeTrade(type: "BUY" | "SELL") {
    if (!selected || !tradeForm.ticker || tradeForm.qty <= 0) return;
    setTrading(true);
    setTradeError("");
    try {
      const res = type === "BUY" 
        ? await api.trading.buy(selected.id, tradeForm.ticker, tradeForm.qty)
        : await api.trading.sell(selected.id, tradeForm.ticker, tradeForm.qty);
        
      if (res.success) {
        setTradeForm({ ticker: "", qty: 1 });
        await refreshSelected();
      } else {
        setTradeError(res.message || "Trade failed");
      }
    } catch (err: any) {
      setTradeError(err.message || "An error occurred");
    }
    setTrading(false);
  }



  const allocData = holdings.map((h: any) => ({ name: h.ticker, value: h.weight_pct }));

  return (
    <PageTransition className="space-y-6 pb-20">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolios</h1>
          <p className="text-muted-foreground mt-1 text-sm">Select a portfolio to view its dashboard</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Plus className="w-4 h-4" /> Create
        </motion.button>
      </motion.div>

      {/* Loading List */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Portfolio List */}
      {!loading && portfolios.length > 0 && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((p: any) => (
            <motion.div key={p.id} variants={staggerItem}>
              <SpatialCard hoverGlow={selected?.id === p.id ? "emerald" : "blue"} className={`cursor-pointer ${selected?.id === p.id ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : ""}`}>
                <div onClick={() => selectPortfolio(p)}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                    </motion.button>
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground mb-3">{p.description}</p>}
                  <p className="text-lg font-bold text-white">${(p.current_balance || p.initial_balance || 0).toLocaleString()}</p>
                </div>
              </SpatialCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Dashboard View for Selected Portfolio */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-8 mt-8 border-t border-white/5 space-y-8">
            
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-1">Dashboard</p>
                <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-white">{selected.name}</h2>
              </div>

            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
            ) : perf ? (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 flex flex-col h-full">
                    <SpatialCard tier={2} delay={0} className="h-full flex flex-col justify-between p-8 border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
                      
                      <div className="flex flex-col h-full w-full">
                        {/* Top Area: Value */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Portfolio Value (Cash + Equity)</h3>
                            <div className="flex items-end gap-3 mt-1">
                              <p className="text-5xl font-bold tracking-tight font-[family-name:var(--font-outfit)] text-white">
                                ${perf.current_portfolio_value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </p>
                              <div className={`flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${perf.total_return_pct >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                {perf.total_return_pct >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(perf.total_return_pct || 0).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle Area: Sparkline & Allocation Bar filling the empty space */}
                        <div className="flex-1 flex flex-col justify-center min-h-[120px] mb-8">
                          <div className="flex-1 w-full opacity-80 min-h-[80px]">
                            {chartData.length > 0 && <SparklineChart data={chartData} color={perf.total_return_pct >= 0 ? "#10b981" : "#ef4444"} />}
                          </div>
                          
                          <div className="w-full mt-4">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                              <span className="text-cyan-500">Cash ({(perf.cash_balance / perf.current_portfolio_value * 100 || 0).toFixed(1)}%)</span>
                              <span className="text-emerald-500">Equities ({(perf.total_invested / perf.current_portfolio_value * 100 || 0).toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-white/5 flex overflow-hidden">
                              <div className="h-full bg-cyan-500" style={{ width: `${(perf.cash_balance / perf.current_portfolio_value * 100) || 0}%` }} />
                              <div className="h-full bg-emerald-500" style={{ width: `${(perf.total_invested / perf.current_portfolio_value * 100) || 0}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Bottom Area: Details */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5 mt-auto">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Initial Balance</p>
                          <p className="text-xl font-medium text-white">${selected.initial_balance?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Total Invested</p>
                          <p className="text-xl font-medium text-white">${perf.total_invested?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Net P&L</p>
                          <p className={`text-xl font-medium ${perf.total_profit_loss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {perf.total_profit_loss >= 0 ? "+" : ""}${perf.total_profit_loss?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </p>
                        </div>
                      </div>
                      </div>
                    </SpatialCard>
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <MetricCard size="compact" title="Total Return" value={perf.total_return_pct} suffix="%" decimals={2} icon={TrendingUp} accent="blue" delay={0.1} change={perf.total_return_pct} />
                    <MetricCard size="compact" title="Cash Balance" value={perf.cash_balance} prefix="$" icon={DollarSign} accent="cyan" delay={0.2} />
                    
                    {/* Quick Trade Widget */}
                    <SpatialCard tier={2} delay={0.3} className="p-4 flex-1 flex flex-col justify-center border-emerald-500/10">
                      <h3 className="text-sm font-semibold text-white mb-3">Quick Trade</h3>
                      <div className="flex gap-2 mb-2">
                        <input placeholder="Ticker" value={tradeForm.ticker} onChange={e => setTradeForm({...tradeForm, ticker: e.target.value.toUpperCase()})} className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30" />
                        <input type="number" min="1" value={tradeForm.qty} onChange={e => setTradeForm({...tradeForm, qty: parseInt(e.target.value) || 1})} className="w-20 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => executeTrade("BUY")} disabled={trading} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer">BUY</button>
                        <button onClick={() => executeTrade("SELL")} disabled={trading} className="flex-1 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer">SELL</button>
                      </div>
                      {tradeError && <p className="text-[10px] text-red-400 mt-2">{tradeError}</p>}
                    </SpatialCard>
                  </div>
                </div>

                {/* P&L Statement Table */}
                <SpatialCard tier={2} delay={0.4} className="p-0 overflow-hidden">
                  <div className="p-6 pb-2">
                    <h3 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-outfit)]">Detailed P&L Statement</h3>
                  </div>
                  <div className="overflow-x-auto p-6 pt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b border-white/[0.06]">
                          <th className="pb-3 font-semibold uppercase tracking-wider">Asset</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider text-right">Qty</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider text-right">Avg Buy</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider text-right">Current Price</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider text-right">Market Value</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider text-right">Unrealized P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.length > 0 ? holdings.map((h: any, i: number) => {
                          const pl = (h.current_price - h.average_buy_price) * h.quantity;
                          const plPct = h.average_buy_price > 0 ? (pl / (h.average_buy_price * h.quantity)) * 100 : 0;
                          return (
                            <motion.tr key={i} custom={i} variants={tableRow} initial="hidden" animate="visible" className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 font-bold text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px]">{h.ticker.substring(0, 1)}</div>
                                {h.ticker}
                              </td>
                              <td className="py-3 text-right text-muted-foreground">{h.quantity.toLocaleString()}</td>
                              <td className="py-3 text-right text-muted-foreground">${h.average_buy_price?.toFixed(2)}</td>
                              <td className="py-3 text-right text-muted-foreground">${h.current_price?.toFixed(2)}</td>
                              <td className="py-3 text-right font-medium text-white">${h.market_value?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              <td className={`py-3 text-right font-bold ${pl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {pl >= 0 ? "+" : ""}${pl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} 
                                <span className="text-[10px] ml-1 opacity-70">({plPct >= 0 ? "+" : ""}{plPct.toFixed(2)}%)</span>
                              </td>
                            </motion.tr>
                          );
                        }) : (
                          <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No open positions.</td></tr>
                        )}
                        <tr className="border-t border-white/10 bg-white/[0.01]">
                          <td className="py-4 font-bold text-white" colSpan={4}>NET PNL</td>
                          <td className={`py-4 text-right font-bold ${perf.total_profit_loss >= 0 ? "text-emerald-400" : "text-red-400"}`} colSpan={2}>
                            {perf.total_profit_loss >= 0 ? "+" : ""}${perf.total_profit_loss?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </SpatialCard>

                {/* Two Column: Allocation + Recent Trades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SpatialCard tier={2} delay={0.5}>
                    <h3 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-outfit)] mb-6">Asset Allocation</h3>
                    {allocData.length > 0 ? (
                      <AllocationChart data={allocData} title="" />
                    ) : (
                      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No assets in portfolio.</div>
                    )}
                  </SpatialCard>

                  <SpatialCard tier={2} delay={0.6} className="flex flex-col">
                    <h3 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-outfit)] mb-6">Recent Activity</h3>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                      {history.length > 0 ? history.map((t: any, i: number) => (
                        <motion.div key={t.id || i} custom={i} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between p-4 rounded-2xl material-1 hover:material-2 hover:-translate-y-1 transition-all duration-300 group">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.transaction_type === "BUY" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF453A]/10 text-[#FF453A]"}`}>
                              {t.transaction_type === "BUY" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">{t.ticker}</p>
                              <p className="text-xs text-muted-foreground">{t.transaction_type} • {new Date(t.transaction_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground text-sm tabular-nums">${Number(t.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{t.quantity} shares</p>
                          </div>
                        </motion.div>
                      )) : <div className="text-center text-muted-foreground text-sm mt-10">No recent trades found.</div>}
                    </div>
                  </SpatialCard>
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()} className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create Portfolio</h3>
                <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <input placeholder="Portfolio Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all" />
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all resize-none" />
              <input type="number" placeholder="Initial Balance" value={form.initial_balance} onChange={(e) => setForm({...form, initial_balance: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all" />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={creating} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer">
                {creating ? "Creating..." : "Create Portfolio"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </PageTransition>
  );
}
