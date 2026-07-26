"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type EnvironmentMood = "growth" | "trading" | "intelligence" | "calm" | "cinematic";

interface EnvironmentBackgroundProps {
  mood?: EnvironmentMood;
}

export default function EnvironmentBackground({ mood = "calm" }: EnvironmentBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax mouse effect (ambient drift logic)
    // VisionOS uses subtle perspective shifts based on eye tracking; we simulate this with subtle mouse drift.
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      containerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Map moods to specific gradient mesh configurations
  const getMoodStyles = () => {
    switch (mood) {
      case "growth": // Dashboard / Portfolio
        return (
          <>
            <div 
              className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(52, 199, 89, 0.06) 0%, transparent 60%)",
                animation: "float 40s ease-in-out infinite alternate"
              }}
            />
            <div 
              className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(0, 113, 227, 0.05) 0%, transparent 60%)",
                animation: "float 45s ease-in-out infinite alternate-reverse"
              }}
            />
          </>
        );
      case "trading": // Trading
        return (
          <>
            <div 
              className="absolute top-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255, 149, 0, 0.04) 0%, transparent 50%)",
                animation: "float 35s ease-in-out infinite alternate"
              }}
            />
            <div 
              className="absolute bottom-[20%] left-[5%] w-[40vw] h-[40vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(255, 69, 58, 0.02) 0%, transparent 50%)",
                animation: "float 50s ease-in-out infinite alternate-reverse"
              }}
            />
          </>
        );
      case "intelligence": // Optimization
        return (
          <>
            <div 
              className="absolute top-[20%] left-[30%] w-[60vw] h-[60vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(94, 92, 230, 0.06) 90deg, transparent 180deg)",
                animation: "orbit 45s linear infinite"
              }}
            />
            <div 
              className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(0, 113, 227, 0.04) 0%, transparent 60%)",
                animation: "float 30s ease-in-out infinite alternate"
              }}
            />
          </>
        );
      case "cinematic": // Landing Page Hero
        return (
          <>
            <div 
              className="absolute top-[-20%] right-[-20%] w-[70vw] h-[70vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(52, 199, 89, 0.08) 0%, transparent 60%)",
                animation: "float 45s ease-in-out infinite alternate"
              }}
            />
            <div 
              className="absolute bottom-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full mix-blend-screen pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(0, 50, 150, 0.06) 0%, transparent 60%)",
                animation: "float 55s ease-in-out infinite alternate-reverse"
              }}
            />
          </>
        );
      case "calm": // Settings and default
      default:
        return (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02) 0%, transparent 50%)"
            }}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-background">
      {/* 
        Premium Noise overlay to avoid banding in gradients and give a physical texture
      */}
      <div className="absolute inset-0 premium-noise z-10 pointer-events-none mix-blend-overlay opacity-30" />
      
      {/* Ambient Depth Layer (Tier 0) */}
      <div className="absolute inset-0 bg-background-deep opacity-40 mix-blend-multiply" />
      
      <div 
        ref={containerRef}
        className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] transition-transform duration-1000 ease-out will-change-transform"
      >
        {getMoodStyles()}
      </div>
    </div>
  );
}
