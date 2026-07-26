"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, TrendingUp, TrendingDown, Sparkles, Globe, ArrowUpRight, ArrowDownRight } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SpatialCard from "@/components/SpatialCard";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface NewsItem {
  title: string;
  description: string;
  source: string;
  published_date: string;
  url: string;
  thumbnail?: string;
}

interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change_percent: number;
}

interface NewsHubData {
  gainers: MarketMover[];
  losers: MarketMover[];
  news: NewsItem[];
  summary: string;
  sentiment?: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export default function NewsHubPage() {
  const [data, setData] = useState<NewsHubData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await api.market.newsHub();
      if (res.success) {
        setData(res.data as NewsHubData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Ambient Background Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen" />
      
      <PageTransition className="space-y-6">
        {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Globe className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Macro News Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm">Live market sentiment & top movers</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 h-32 animate-pulse" />
            <div className="glass rounded-2xl p-6 h-96 animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 h-64 animate-pulse" />
            <div className="glass rounded-2xl p-6 h-64 animate-pulse" />
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (Left: Summary & News Feed) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary */}
            <SpatialCard 
              tier={2} 
              hoverGlow={data.sentiment === "BULLISH" ? "emerald" : data.sentiment === "BEARISH" ? "rose" : "blue"}
            >
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                <Sparkles className={cn("w-5 h-5", 
                  data.sentiment === "BULLISH" ? "text-emerald-400" : 
                  data.sentiment === "BEARISH" ? "text-rose-400" : 
                  "text-blue-400"
                )} />
                <h2 className="text-lg font-bold">Daily Market Summary</h2>
                {data.sentiment && (
                  <span className={cn(
                    "ml-auto text-xs font-bold px-2 py-1 rounded-full",
                    data.sentiment === "BULLISH" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : 
                    data.sentiment === "BEARISH" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : 
                    "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  )}>
                    {data.sentiment}
                  </span>
                )}
              </div>
              <p className="text-base leading-relaxed text-slate-300 font-medium">
                {data.summary}
              </p>
            </SpatialCard>

            {/* News Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mt-4">
                <Newspaper className="w-5 h-5 text-muted-foreground" />
                Breaking News
              </h2>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                {data.news.map((n, i) => (
                  <motion.a 
                    key={i} 
                    href={n.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variants={staggerItem}
                    whileHover={{ scale: 1.01 }}
                    className="block material-1 rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span className="font-semibold text-blue-400">{n.source}</span>
                        <span>
                          {new Date(n.published_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 items-start mt-2">
                        {n.thumbnail && (
                          <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 rounded-lg overflow-hidden border border-white/10">
                            <img src={n.thumbnail} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors leading-tight">
                            {n.title}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                            {n.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Right Sidebar (Top Gainers / Losers) */}
          <div className="space-y-6">
            
            {/* Top Gainers */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Top Gainers
                </h3>
              </div>
              <div className="space-y-0">
                {data.gainers.map((g, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10">
                        {g.ticker[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{g.ticker}</span>
                        <span className="text-xs text-muted-foreground truncate w-24">{g.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold">₹{g.price?.toFixed(2)}</span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        +{g.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Top Losers
                </h3>
              </div>
              <div className="space-y-0">
                {data.losers.map((l, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs font-bold border border-white/10">
                        {l.ticker[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{l.ticker}</span>
                        <span className="text-xs text-muted-foreground truncate w-24">{l.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold">₹{l.price?.toFixed(2)}</span>
                      <span className="text-xs font-semibold text-red-400 flex items-center">
                        <ArrowDownRight className="w-3 h-3 mr-0.5" />
                        {l.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : null}
      </PageTransition>
    </div>
  );
}
