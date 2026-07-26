"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FileText, Sparkles, Copy, Check, Download, Search } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SpatialCard from "@/components/SpatialCard";
import InsightCard from "@/components/InsightCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import { api } from "@/lib/api";

interface ReportData {
  markdown_report?: string;
  report?: string;
  [key: string]: any;
}

export default function ReportsPage() {
  const [ticker, setTicker] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRecent() {
      const res = await api.analysis.recentReports();
      if (res.success) setRecentReports(res.data);
    }
    fetchRecent();
  }, []);

  async function handleGenerate() {
    if (!ticker.trim()) return;
    setLoading(true);
    setError("");
    setReport(null);
    const res = await api.analysis.report(ticker.trim(), query.trim() || `Full investment analysis for ${ticker}`);
    setLoading(false);
    if (res.success) {
      setReport(res.data as ReportData);
    } else {
      setError(res.message || "Failed to generate report");
    }
  }

  function handleCopy() {
    const content = report?.markdown_report || report?.report || (report ? JSON.stringify(report, null, 2) : "");
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const content = report?.markdown_report || report?.report || (report ? JSON.stringify(report, null, 2) : "");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finora-report-${ticker.toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleOpenRecent(r: any) {
    setTicker(r.company);
    setQuery("");
    setReport({
      company: r.company,
      recommendation: r.recommendation,
      confidence: r.confidence || 85,
      report: r.report
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const reportContent = report?.markdown_report || report?.report || (report ? JSON.stringify(report, null, 2) : "");

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold tracking-tight">Investment Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">AI-generated research reports</p>
      </motion.div>

      {/* Generator */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Ticker (e.g., AAPL)" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleGenerate()} className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all" />
          </div>
          <input type="text" placeholder="Custom query (optional)" value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/20 transition-all" />
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleGenerate} disabled={loading || !ticker.trim()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {loading ? "Generating..." : "Generate"}
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <div className="glass rounded-2xl p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-white/[0.03] animate-shimmer" style={{ width: `${70 + (i % 3) * 10}%`, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="glass rounded-2xl p-6 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Report */}
      {report && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Meta + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10"><FileText className="w-4 h-4 text-emerald-400" /></div>
              <div>
                <p className="text-sm font-semibold text-white">{ticker} Investment Report</p>
                <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium glass hover:bg-white/[0.06] transition-colors cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium glass hover:bg-white/[0.06] transition-colors cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Download
              </motion.button>
            </div>
          </div>

          {/* Markdown Content */}
          <div className="glass rounded-2xl p-8 sm:p-10">
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-8
              prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6
              prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4
              prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-4
              prose-li:text-white/70 prose-li:mb-1
              prose-strong:text-white
              prose-code:text-emerald-400 prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            ">
              <ReactMarkdown>{reportContent}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!report && !loading && !error && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-20 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
          </motion.div>
          <p className="text-muted-foreground text-sm">Enter a ticker to generate an AI investment report</p>
        </motion.div>
      )}

      {/* Recent Reports Generated */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="pt-4">
        <SpatialCard tier={3} hoverGlow="blue" delay={0.4}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#5E5CE6]/20 flex items-center justify-center border border-[#5E5CE6]/30">
              <Sparkles className="w-5 h-5 text-[#5E5CE6]" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight font-[family-name:var(--font-outfit)]">Recent Reports Generated</h3>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentReports.length > 0 ? recentReports.map((r: any, i: number) => (
              <InsightCard key={r.id || i} report={r} index={i} onClick={() => handleOpenRecent(r)} />
            )) : (
              <div className="col-span-3 text-center text-muted-foreground text-sm py-8">
                Generate a report above to see recent reports here.
              </div>
            )}
          </motion.div>
        </SpatialCard>
      </motion.div>
    </PageTransition>
  );
}
