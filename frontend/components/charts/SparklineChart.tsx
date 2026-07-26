"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

interface SparklineChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
}

export default function SparklineChart({
  data,
  color = "#10b981",
  height = 80,
}: SparklineChartProps) {
  if (!data || data.length === 0) return null;

  // Calculate min and max for the Y axis to make the sparkline dynamic
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || max * 0.05;
  const domain = [min - padding, max + padding];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={domain} hide />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${color.replace("#", "")})`}
          isAnimationActive={true}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
