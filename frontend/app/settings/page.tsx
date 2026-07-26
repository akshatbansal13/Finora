"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Globe, Info, Sparkles, Check, ExternalLink, Monitor, Moon, RefreshCw } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SpatialCard from "@/components/SpatialCard";
import { fadeUp } from "@/lib/animations";

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "preferences", label: "Preferences", icon: Monitor },
  { key: "api", label: "API", icon: Globe },
  { key: "about", label: "About", icon: Info },
];

const techStack = [
  "Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion",
  "FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Qdrant",
  "LangChain", "LangGraph", "HuggingFace", "PyPortfolioOpt",
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled} className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${checked ? "bg-emerald-500" : "bg-white/[0.1]"}`}>
      <motion.div layout className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm ${checked ? "left-5" : "left-0.5"}`} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({ notifications: true, autoRefresh: true, darkMode: true });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your preferences</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
        <div className="flex gap-1 p-1 rounded-xl glass w-fit">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="relative px-4 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer">
              {activeTab === tab.key && (
                <motion.div layoutId="settings-tab" className="absolute inset-0 bg-white/[0.08] rounded-lg" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${activeTab === tab.key ? "text-white" : "text-muted-foreground"}`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile */}
      {activeTab === "profile" && (
        <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <SpatialCard hoverGlow="blue">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">U</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">User</p>
                <p className="text-sm text-muted-foreground">Investor</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Name</label>
                <input defaultValue="User" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <input defaultValue="user@finora.ai" type="email" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold cursor-pointer">
                <span className="flex items-center gap-2">
                  {saved ? <Check className="w-4 h-4" /> : null}
                  {saved ? "Saved" : "Save Changes"}
                </span>
              </motion.button>
            </div>
          </SpatialCard>
        </motion.div>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && (
        <motion.div key="prefs" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SpatialCard hoverGlow="emerald">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium text-white">Notifications</p><p className="text-xs text-muted-foreground">Receive trade and analysis alerts</p></div>
                </div>
                <Toggle checked={prefs.notifications} onChange={() => setPrefs({...prefs, notifications: !prefs.notifications})} />
              </div>
              <div className="border-t border-white/[0.04]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium text-white">Dark Mode</p><p className="text-xs text-muted-foreground">Always enabled for optimal experience</p></div>
                </div>
                <Toggle checked={prefs.darkMode} onChange={() => {}} disabled />
              </div>
              <div className="border-t border-white/[0.04]" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-sm font-medium text-white">Auto-Refresh Data</p><p className="text-xs text-muted-foreground">Automatically update market data</p></div>
                </div>
                <Toggle checked={prefs.autoRefresh} onChange={() => setPrefs({...prefs, autoRefresh: !prefs.autoRefresh})} />
              </div>
            </div>
          </SpatialCard>
        </motion.div>
      )}

      {/* API */}
      {activeTab === "api" && (
        <motion.div key="api" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SpatialCard hoverGlow="cyan">
            <h3 className="text-sm font-semibold text-white mb-4">Backend Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">API Endpoint</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                  <code className="text-sm text-emerald-400 font-mono">http://localhost:8000</code>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-data-pulse" />
                    <span className="text-xs text-emerald-400">Connected</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">API Documentation</label>
                <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open Swagger UI
                </a>
              </div>
            </div>
          </SpatialCard>
        </motion.div>
      )}

      {/* About */}
      {activeTab === "about" && (
        <motion.div key="about" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <SpatialCard hoverGlow="purple">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">Finora</p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-white/60 mb-1 leading-relaxed">
              AI-powered multi-agent investment research platform combining quantitative finance, retrieval-augmented generation, and LangGraph orchestration.
            </p>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">Created by Akshat Bansal :)</p>
            <div>
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">Technology Stack</p>
              <div className="flex flex-wrap gap-2">
                {techStack.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium glass text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </SpatialCard>
        </motion.div>
      )}
    </PageTransition>
  );
}
