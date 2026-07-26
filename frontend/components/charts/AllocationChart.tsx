"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, TooltipProps } from "recharts";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

interface AllocationData {
  name: string;
  value: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  title?: string;
  height?: number;
}

const COLORS = ["#10b981", "#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#f97316"];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value?.toFixed(1)}%</p>
    </div>
  );
}

export default function AllocationChart({
  data,
  title = "Allocation",
  height = 300,
}: AllocationChartProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
      {title && <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
