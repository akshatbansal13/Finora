"use client";

import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";

interface InsightCardProps {
  report: {
    id?: number | string;
    company: string;
    recommendation?: string;
    report_content?: string;
    [key: string]: any;
  };
  index?: number;
  onClick?: () => void;
}

export default function InsightCard({ report, index = 0, onClick }: InsightCardProps) {
  const rec = report.recommendation?.toLowerCase() || "";
  const accent = rec.includes("buy") 
    ? "bg-[#34C759]" 
    : rec.includes("sell") 
      ? "bg-[#FF453A]" 
      : "bg-[#5E5CE6]";

  return (
    <motion.div
      key={report.id || index}
      variants={staggerItem}
      onClick={onClick}
      className={`material-1 p-5 rounded-2xl border border-white/5 relative overflow-hidden group ${onClick ? "cursor-pointer hover:border-emerald-500/30 transition-all" : ""}`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} opacity-50 group-hover:opacity-100 transition-opacity`} />
      <p className="text-sm text-muted-foreground font-semibold mb-1">{report.company}</p>
      <p className="text-xs text-foreground leading-relaxed pl-2 font-medium line-clamp-3">
        {report.report_content || `Recommendation: ${report.recommendation}`}
      </p>
    </motion.div>
  );
}
