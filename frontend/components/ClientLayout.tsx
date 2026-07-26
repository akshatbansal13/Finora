"use client";

import { usePathname } from "next/navigation";
import TopBar from "@/components/TopBar";
import Dock from "@/components/Dock";
import EnvironmentBackground from "@/components/EnvironmentBackground";

type Mood = "growth" | "trading" | "intelligence" | "calm" | "cinematic";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  // Determine environment mood based on route
  let mood: Mood = "calm";
  if (isLanding) mood = "cinematic";
  else if (pathname === "/dashboard" || pathname === "/portfolio") mood = "growth";
  else if (pathname === "/trading") mood = "trading";
  else if (pathname === "/optimization") mood = "intelligence";

  return (
    <>
      <EnvironmentBackground mood={mood} />
      
      {!isLanding && <TopBar />}
      
      <main className={isLanding ? "" : "pt-24 pb-32 px-6 max-w-[1440px] mx-auto relative z-10"}>
        {children}
      </main>

      {!isLanding && <Dock />}
    </>
  );
}
