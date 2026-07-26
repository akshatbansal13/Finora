"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface ComparisonData {
  name: string;
  current: number;
  optimized: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title?: string;
  height?: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm space-y-1">
      <p className="text-white font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {(p.value * 100).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export default function ComparisonChart({
  data,
  title = "Current vs Optimized",
  height = 300,
}: ComparisonChartProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
      {title && <h3 className="text-sm font-medium text-muted-foreground mb-6">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#737373" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#737373" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="current"
            name="Current"
            fill="#737373"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Bar
            dataKey="optimized"
            name="Optimized"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
