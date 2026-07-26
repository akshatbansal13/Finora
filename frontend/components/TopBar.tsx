"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Settings, Bell } from "lucide-react";

export default function TopBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
    >
      {/* Left: Logo */}
      <Link href="/">
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
              <img src="/logo1.png" alt="Finora Logo" className="w-7 h-7 object-contain" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-white/20 blur-xl opacity-50 animate-glow-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white font-[family-name:var(--font-outfit)] drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">Finora</span>
        </motion.div>
      </Link>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link href="/settings">
          <motion.div 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full material-1 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
          </motion.div>
        </Link>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center cursor-pointer shadow-sm overflow-hidden"
        >
          <span className="text-[11px] font-bold text-white">AB</span>
        </motion.div>
      </div>
    </motion.header>
  );
}
