"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import AnimatedCounter from "./AnimatedCounter";
import { LucideIcon } from "lucide-react";
import SpatialCard from "./SpatialCard";

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change?: number;
  icon: LucideIcon;
  accent?: "emerald" | "blue" | "cyan" | "purple";
  delay?: number;
  size?: "hero" | "compact";
}

const accentMap = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
  },
};

export default function MetricCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  change,
  icon: Icon,
  accent = "emerald",
  delay = 0,
  size = "compact",
}: MetricCardProps) {
  const colors = accentMap[accent];
  const isHero = size === "hero";

  return (
    <SpatialCard
      tier={isHero ? 3 : 2}
      hoverGlow={accent}
      delay={delay}
      className={cn(isHero ? "p-8" : "p-6")}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          className={cn(isHero ? "p-3" : "p-2", "rounded-xl", colors.bg)}
        >
          <Icon className={cn(isHero ? "w-6 h-6" : "w-4 h-4", colors.text)} />
        </motion.div>
      </div>
      <div className="space-y-2 mt-4">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className={cn(
            "tabular-nums text-foreground",
            isHero 
              ? "text-5xl md:text-[64px] leading-tight font-bold tracking-tight font-[family-name:var(--font-outfit)]" 
              : "text-2xl font-bold tracking-tight"
          )}
        />
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.4, type: "spring", stiffness: 300 }}
            className="flex items-center gap-2 mt-1"
          >
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded-md",
                change >= 0
                  ? "text-[#34C759] bg-[#34C759]/10"
                  : "text-[#FF453A] bg-[#FF453A]/10"
              )}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
            <span className="text-xs text-muted-foreground">vs prev. day</span>
          </motion.div>
        )}
      </div>
    </SpatialCard>
  );
}
