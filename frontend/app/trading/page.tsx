"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Search, Check, DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import MetricCard from "@/components/MetricCard";
import SpatialCard from "@/components/SpatialCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import { fadeUp } from "@/lib/animations";
import { api } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

const quickTickers = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL"];

interface Portfolio { id: number; name: string; }
interface Holding { ticker: string; quantity: number; average_buy_price: number; current_price?: number; }
interface Transaction { created_at?: string; date?: string; ticker: string; transaction_type?: string; type?: string; quantity: number; price: number; }
interface Performance { cash_balance: number; total_invested: number; total_market_value: number; total_return_pct: number; }
interface PriceData { current_price?: number; regularMarketPrice?: number; day_change_pct?: number; regularMarketChangePercent?: number; native_price?: number; native_currency?: string; }

export default function TradingPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [ticker, setTicker] = useState("AAPL");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [perf, setPerf] = useState<Performance | null>(null);
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchPortfolios = useCallback(async () => {
    const res = await api.portfolio.list();
    if (res.success && Array.isArray(res.data)) {
      setPortfolios(res.data as Portfolio[]);
      if (res.data.length > 0 && !selectedPid) setSelectedPid((res.data[0] as Portfolio).id);
    }
  }, [selectedPid]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const fetchPortfolioData = useCallback(async () => {
    if (!selectedPid) return;
    const [hRes, tRes, pRes] = await Promise.all([
      api.portfolio.holdings(selectedPid),
      api.trading.history(selectedPid),
      api.portfolio.performance(selectedPid),
    ]);
    if (hRes.success) setHoldings(Array.isArray(hRes.data) ? hRes.data as Holding[] : []);
    if (tRes.success) setTransactions(Array.isArray(tRes.data) ? tRes.data as Transaction[] : []);
    if (pRes.success) setPerf(pRes.data as Performance);
  }, [selectedPid]);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  const fetchPrice = useCallback(async () => {
    if (!ticker.trim()) return;
    setPriceLoading(true);
    const res = await api.market.price(ticker.trim());
    setPriceLoading(false);
    if (res.success) setPrice(res.data as PriceData);
  }, [ticker]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  useEffect(() => {
    const curr = price?.current_price || price?.regularMarketPrice;
    if (curr) {
      let val = curr * 0.98;
      const data = [];
      const now = new Date();
      for(let i = 40; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        data.push({
          time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          price: val
        });
        val = val + (Math.random() - 0.48) * (curr * 0.005);
      }
      data.push({
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        price: curr
      });
      setChartData(data);
    }
  }, [price, ticker]);

  async function handleTrade() {
    if (!selectedPid || !ticker.trim() || quantity <= 0) return;
    setExecuting(true);
    const res = tab === "buy"
      ? await api.trading.buy(selectedPid, ticker.trim(), quantity)
      : await api.trading.sell(selectedPid, ticker.trim(), quantity);
    setExecuting(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      fetchPortfolioData();
    }
  }

  const currentPrice = price?.current_price || price?.regularMarketPrice || 0;
  const dayChange = price?.day_change_pct || price?.regularMarketChangePercent || 0;
  const isPositive = dayChange >= 0;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">Execution Environment</p>
          <h1 className="text-4xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">Terminal</h1>
        </div>
        <div className="flex gap-2 items-center">
          <select value={selectedPid || ""} onChange={(e) => setSelectedPid(Number(e.target.value))} className="px-4 py-2 rounded-xl material-2 text-foreground text-sm font-medium focus:outline-none transition-all cursor-pointer">
            {portfolios.map((p) => <option key={p.id} value={p.id} className="bg-[#111] text-white">{p.name}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Main Terminal Layout - Dual Plane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Elevated Plane (Tier 3) - Chart & Metrics */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <SpatialCard tier={3} className="p-0 overflow-hidden flex flex-col h-[550px] relative">
            {/* Ticker Header overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Ticker" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} className="w-40 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground text-sm font-semibold focus:outline-none focus:border-white/30 transition-all uppercase placeholder:text-muted-foreground/50" />
                </div>
                <div className="flex gap-2">
                  {quickTickers.map((t) => (
                    <button key={t} onClick={() => setTicker(t)} className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-all transform-gpu hover:scale-105 active:scale-95", ticker === t ? "bg-white/15 text-white" : "material-1 text-muted-foreground hover:text-white")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                {priceLoading ? (
                  <div className="h-10 w-32 rounded-lg bg-white/5 animate-pulse ml-auto" />
                ) : (
                  <>
                    <AnimatedCounter value={currentPrice} prefix="$" decimals={2} className="text-4xl font-bold tracking-tight text-white block tabular-nums" />
                    <div className="flex justify-end gap-2 items-center mt-1">
                      {price?.native_currency && price.native_currency !== "USD" && (
                        <span className="text-sm font-semibold text-muted-foreground px-2 py-1 bg-white/5 rounded-md">
                          ({price.native_price?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {price.native_currency})
                        </span>
                      )}
                      <span className={cn("text-sm font-semibold px-2 py-1 rounded-md inline-block animate-data-pulse", isPositive ? "text-[#34C759] bg-[#34C759]/10" : "text-[#FF453A] bg-[#FF453A]/10")}>
                        {isPositive ? "+" : ""}{dayChange.toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recharts Area */}
            <div className="flex-1 mt-24 w-full pr-4 pb-4 relative z-0">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#34C759" : "#FF453A"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={isPositive ? "#34C759" : "#FF453A"} stopOpacity={0}/>
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 14, 18, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '13px', backdropFilter: 'blur(16px)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="price" stroke={isPositive ? "#34C759" : "#FF453A"} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" filter="url(#glow)" />
                    <ReferenceLine y={chartData[0]?.price} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </SpatialCard>

          {/* Portfolio Metrics - Compact trio style */}
          {perf && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard size="compact" title="Cash Balance" value={perf.cash_balance || 0} prefix="$" icon={Wallet} delay={0} />
              <MetricCard size="compact" title="Total Invested" value={perf.total_invested || 0} prefix="$" icon={DollarSign} delay={0.05} />
              <MetricCard size="compact" title="Current Holdings" value={perf.total_market_value || 0} prefix="$" icon={Activity} delay={0.1} />
              <MetricCard size="compact" title="Total Return" value={perf.total_return_pct || 0} suffix="%" decimals={2} icon={TrendingUp} delay={0.15} change={perf.total_return_pct} />
            </motion.div>
          )}
        </div>

        {/* Recessed Plane (Tier 2) - Order Entry & Holdings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Order Entry Panel */}
          <SpatialCard tier={2} delay={0.15} className="flex flex-col gap-6 border-t-4" style={{ borderTopColor: tab === "buy" ? "#34C759" : "#FF453A" }}>
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center justify-between">
              Order Entry
              <div className={cn("w-2 h-2 rounded-full animate-data-pulse", tab === "buy" ? "bg-[#34C759]" : "bg-[#FF453A]")} />
            </h2>
            
            <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/5">
              {(["buy", "sell"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className="relative flex-1 py-2 rounded-lg text-sm font-bold transition-colors">
                  {tab === t && (
                    <motion.div layoutId="order-tab" className="absolute inset-0 rounded-lg bg-white/10 shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <span className={cn("relative z-10", tab === t ? (t === "buy" ? "text-[#34C759]" : "text-[#FF453A]") : "text-muted-foreground hover:text-white")}>
                    {t.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Quantity</label>
                <div className="relative">
                  <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-full pl-4 pr-12 py-3 rounded-xl bg-black/40 border border-white/10 text-foreground text-lg focus:outline-none focus:border-white/30 transition-all font-mono shadow-inner" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground uppercase">{ticker}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-white/5">
                <span className="text-sm font-medium text-muted-foreground">Market Price</span>
                <span className="text-base font-mono font-semibold text-white tabular-nums">${currentPrice.toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col gap-2 py-4 border-t border-b border-white/5 bg-white/[0.02] -mx-6 px-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Estimated Total</span>
                  <AnimatedCounter value={currentPrice * quantity} prefix="$" decimals={2} className="text-2xl font-bold font-mono text-white tabular-nums" />
                </div>
                {tab === "buy" && perf && (currentPrice * quantity) > (perf.cash_balance || 0) && (
                  <div className="text-xs font-semibold text-[#FF453A] bg-[#FF453A]/10 px-3 py-2 rounded-lg mt-1 border border-[#FF453A]/20">
                    Insufficient funds. Available cash: ${(perf.cash_balance || 0).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleTrade} 
              disabled={executing || !selectedPid || (tab === "buy" && perf && (currentPrice * quantity) > (perf.cash_balance || 0))} 
              className={cn(
                "w-full py-4 rounded-xl text-base font-bold text-white disabled:opacity-50 transition-all transform-gpu active:scale-95 flex items-center justify-center gap-2",
                tab === "buy" ? "bg-[#34C759] hover:bg-[#34C759]/90 shadow-[0_0_20px_rgba(52,199,89,0.3)] disabled:bg-white/10 disabled:shadow-none" : "bg-[#FF453A] hover:bg-[#FF453A]/90 shadow-[0_0_20px_rgba(255,45,85,0.3)] disabled:bg-white/10 disabled:shadow-none"
              )}
            >
              {success ? <Check className="w-5 h-5" /> : tab === "buy" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {executing ? "Processing..." : success ? "Filled" : `${tab === "buy" ? "Buy" : "Sell"} ${ticker}`}
            </button>
          </SpatialCard>

          {/* Holdings Spatial List */}
          <SpatialCard tier={2} delay={0.2} className="flex-1 flex flex-col p-0 overflow-hidden min-h-[300px]">
            <div className="p-6 pb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Positions</h3>
            </div>
            {holdings.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm font-medium text-muted-foreground/50 pb-6">No active positions</div>
            ) : (
              <div className="overflow-y-auto flex-1 px-4 pb-4 custom-scrollbar space-y-2">
                {holdings.map((h, i) => {
                  const pl = ((h.current_price || h.average_buy_price) - h.average_buy_price) * h.quantity;
                  const isPlPositive = pl >= 0;
                  return (
                    <motion.div 
                      key={i} 
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      className="flex justify-between items-center p-3.5 rounded-xl material-1 hover:material-2 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-base text-white">{h.ticker}</div>
                        <div className="text-xs font-medium text-muted-foreground">{h.quantity} sh @ ${h.average_buy_price?.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-base text-white">${(h.current_price || h.average_buy_price)?.toFixed(2)}</div>
                        <div className={cn("text-xs font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block", isPlPositive ? "text-[#34C759] bg-[#34C759]/10" : "text-[#FF453A] bg-[#FF453A]/10")}>
                          {isPlPositive ? "+" : ""}{pl.toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </SpatialCard>

        </div>
      </div>
    </PageTransition>
  );
}
