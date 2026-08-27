"use client";

import React from "react";
import { Activity } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-neutral-950 font-sans selection:bg-brand-500/30">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-brand-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Neural Node Core */}
        <div className="relative w-24 h-24 mb-10 group">
          {/* Pulsing Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 animate-[ping_2s_infinite]" />
          <div className="absolute inset-2 rounded-full border border-brand-400/30 animate-[ping_3s_infinite]" />

          {/* Spinning Matrix Ring */}
          <div className="absolute inset-0 rounded-full border-y-2 border-brand-500 border-x-transparent animate-spin-slow shadow-[0_0_20px_rgba(59,130,246,0.5)]" />

          {/* Static Inner Core */}
          <div className="absolute inset-6 bg-brand-500/10 backdrop-blur-xl border border-brand-500/30 rounded-full flex items-center justify-center shadow-inner">
            <Activity className="w-8 h-8 text-brand-400 animate-pulse" />
          </div>
        </div>

        {/* Status Informatics */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">
            Synchronizing System
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-brand-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em]">
              Queue System Active
            </p>
          </div>
        </div>

        {/* Progress Bar (Indeterminate) */}
        <div className="mt-8 w-40 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-brand-500 w-1/3 animate-[shimmer_1.5s_infinite] shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
