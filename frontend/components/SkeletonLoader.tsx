"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/[0.03]",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="h-4 w-40 mb-6" />
      <Skeleton className="h-[200px] w-full rounded-xl" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass rounded-2xl p-6 space-y-3">
      <Skeleton className="h-4 w-40 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
