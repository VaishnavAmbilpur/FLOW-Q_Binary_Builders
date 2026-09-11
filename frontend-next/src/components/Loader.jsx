"use client";

import React from "react";
import { Activity } from "lucide-react";

export default function Loader({ message = "Loading Flow-Q..." }) {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md font-sans">
      <div className="relative flex flex-col items-center">
        {/* Obsidian Minimal Core */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-2xl border-2 border-slate-100" />
          <div className="absolute inset-0 rounded-2xl border-2 border-slate-900 border-t-transparent animate-spin" />
          <div className="absolute inset-3 bg-slate-50 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-slate-900 animate-pulse" />
          </div>
        </div>

        {/* Status Text */}
        <div className="flex flex-col items-center text-center">
          <span className="eyebrow-tag mb-1.5">
            ← FLOW-Q CORE ENGINE
          </span>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {message}
          </h3>
        </div>

        {/* Sleek Progress Indeterminate */}
        <div className="mt-5 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 w-1/3 rounded-full animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
