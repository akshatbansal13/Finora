"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, Briefcase, LineChart,
  Sparkles, FileText, Upload, Globe
} from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const dockItems = [
  { name: "Portfolio", href: "/portfolio" },
  { name: "Trading", href: "/trading" },
  { name: "Optimization", href: "/optimization" },
  { name: "Reports", href: "/reports" },
  { name: "News", href: "/news" },
  { name: "Documents", href: "/documents" },
];

function getIconFor(name: string) {
  switch (name) {
    case "Dashboard": return <LayoutDashboard className="w-5 h-5" />;
    case "Analysis": return <TrendingUp className="w-5 h-5" />;
    case "Portfolio": return <Briefcase className="w-5 h-5" />;
    case "Trading": return <LineChart className="w-5 h-5" />;
    case "Optimization": return <Sparkles className="w-5 h-5" />;
    case "Reports": return <FileText className="w-5 h-5" />;
    case "News": return <Globe className="w-5 h-5" />;
    case "Documents": return <Upload className="w-5 h-5" />;
    default: return <div className="w-5 h-5 bg-red-500 rounded-full" />;
  }
}

function DockIcon({ item, isActive, mouseX }: { item: any, isActive: boolean, mouseX: any }) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 60, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link href={item.href}>
      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="relative flex items-center justify-center rounded-full transition-colors group"
      >
        {/* Hover background */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity" />
        
        {isActive && (
          <motion.div
            layoutId="dock-active"
            className="absolute inset-0 bg-white/10 rounded-full"
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          />
        )}
        
        {/* Icon */}
        <div className={cn("absolute inset-0 z-10 transition-colors duration-200 flex items-center justify-center", isActive ? "text-accent-blue" : "text-muted-foreground group-hover:text-white")}>
          {getIconFor(item.name)}
        </div>
        
        {/* Tooltip */}
        <div className="absolute top-[-40px] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 pointer-events-none px-3 py-1.5 rounded-lg material-4 text-xs font-medium text-white shadow-xl">
          {item.name}
        </div>
        
        {/* Active dot indicator */}
        {isActive && (
          <motion.div 
            layoutId="dock-active-dot"
            className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-accent-blue"
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          />
        )}
      </motion.div>
    </Link>
  );
}

export default function Dock() {
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.2 }}
        className="material-4 px-3 py-2 rounded-[999px] flex items-end gap-3"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {dockItems.map((item) => (
          <DockIcon 
            key={item.name} 
            item={item} 
            isActive={pathname === item.href} 
            mouseX={mouseX} 
          />
        ))}
      </motion.div>
    </div>
  );
}
