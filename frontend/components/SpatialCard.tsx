"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";

interface SpatialCardProps {
  children: ReactNode;
  className?: string;
  tier?: 1 | 2 | 3 | 4;
  hoverGlow?: "emerald" | "blue" | "cyan" | "purple" | "none";
  delay?: number;
  style?: React.CSSProperties;
}

const glowColors = {
  emerald: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30",
  blue: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30",
  cyan: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/30",
  purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-purple-500/30",
  none: "",
};

export default function SpatialCard({
  children,
  className,
  tier = 2,
  hoverGlow = "none",
  delay = 0,
  style,
}: SpatialCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const liftAmount = tier === 3 ? -8 : -4;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay }}
      whileHover={{ y: liftAmount, transition: { type: "spring", stiffness: 300, damping: 24 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: tier > 1 ? rotateX : 0,
        rotateY: tier > 1 ? rotateY : 0,
        ...style,
      }}
      className={cn(
        `material-${tier} rounded-2xl p-6 transition-colors duration-300 transform-gpu`,
        glowColors[hoverGlow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
