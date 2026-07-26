"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface PerformanceChartProps {
  data: { date: string; value: number }[];
  title?: string;
  color?: string;
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">${payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

export default function PerformanceChart({
  data,
  title = "Performance",
  color = "#10b981",
  height = 300,
}: PerformanceChartProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
      {title && <h3 className="text-sm font-medium text-muted-foreground mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#737373" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#737373" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${color.replace("#", "")})`}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
