"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import anime from "animejs";
import { Gauge, Zap, Globe, Cpu, Power, MonitorSmartphone } from "lucide-react";

export default function MobileLanding() {
  useEffect(() => {
    const tl = anime.timeline({ easing: "easeOutExpo" });

    tl.add({
      targets: ".mobile-animate-up",
      translateY: [30, 0],
      opacity: [0, 1],
      delay: anime.stagger(80),
      duration: 800,
    });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden relative selection:bg-brand-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[-10%] w-[80%] h-[40%] bg-brand-600/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[70%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-6 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-xl backdrop-blur-xl transform rotate-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <span className="font-black text-xl tracking-tighter text-white uppercase italic">
            FLOW-Q
          </span>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-neutral-100"
        >
          <Power className="w-3.5 h-3.5" /> Login
        </Link>
      </header>

      <main className="relative z-10 px-6 pt-12 pb-24 flex flex-col items-center text-center">
        {/* Hero Badge */}
        <div className="mobile-animate-up inline-flex items-center gap-3 bg-brand-500/10 border border-brand-500/20 rounded-full px-5 py-2 mb-8 backdrop-blur-md opacity-0">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping" />
          <span className="text-[8px] font-black tracking-[0.2em] text-brand-400 uppercase leading-none">
            Live Status Active
          </span>
        </div>

        <h1 className="mobile-animate-up text-5xl font-black tracking-tighter mb-6 text-white leading-[0.85] uppercase italic opacity-0">
          Precision <br />
          <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent italic">
            Waiting.
          </span>
        </h1>

        <p className="mobile-animate-up text-sm text-neutral-100 font-medium mb-12 leading-relaxed px-4 opacity-0">
          FLOW-Q makes waiting simple and organized. Smart tech for live
          waitlists.
        </p>

        {/* Primary Actions */}
        <div className="mobile-animate-up w-full space-y-4 mb-16 opacity-0">
          <Link
            href="/signup"
            className="w-full h-16 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-600/30 transition-all active:scale-95"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full h-16 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md transition-all active:scale-95"
          >
            Staff Login
          </Link>
        </div>

        {/* Mobile Metrics Grid */}
        <div className="mobile-animate-up grid grid-cols-2 gap-3 w-full opacity-0">
          {[
            {
              label: "Throughput",
              val: "+40%",
              icon: <Gauge className="w-3.5 h-3.5" />,
            },
            {
              label: "Deployment",
              val: "3m",
              icon: <Zap className="w-3.5 h-3.5" />,
            },
            {
              label: "Latency",
              val: "<2ms",
              icon: <Cpu className="w-3.5 h-3.5" />,
            },
            {
              label: "Availability",
              val: "99.9%",
              icon: <Globe className="w-3.5 h-3.5" />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center backdrop-blur-sm transition-all active:bg-white/10"
            >
              <div className="text-neutral-100 mb-2">{s.icon}</div>
              <div className="text-xl font-black tracking-tight mb-0.5 font-mono text-white">
                {s.val}
              </div>
              <div className="text-[7px] font-black text-neutral-200 uppercase tracking-widest">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Scroll Hint */}
        <div className="mt-20 flex flex-col items-center gap-4 text-neutral-400">
          <div className="w-[1px] h-12 bg-gradient-to-b from-brand-500/50 to-transparent" />
          <span className="text-[7px] font-black uppercase tracking-[0.5em] rotate-180 [writing-mode:vertical-lr]">
            Scroll to Explore
          </span>
        </div>
      </main>

      {/* Mobile Command Footer */}
      <footer className="relative z-20 border-t border-white/5 bg-white/[0.01] pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-12 mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                  <Image src="/logo.svg" alt="L" width={20} height={20} />
                </div>
                <span className="font-black text-xl italic tracking-tighter uppercase text-white">
                  FLOW-Q
                </span>
              </div>
              <p className="text-neutral-100 text-[10px] leading-relaxed font-medium max-w-xs italic mb-8">
                High-performance waiting list management. Simple tools for your
                business.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                  System
                </h4>
                <div className="flex flex-col gap-4 text-[9px] font-black uppercase tracking-widest text-neutral-100">
                  <Link href="/login">Agents</Link>
                  <Link href="/login">Front Desk</Link>
                  <Link href="/login">Kiosk</Link>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                  Developer
                </h4>
                <div className="flex flex-col gap-4 text-[9px] font-black uppercase tracking-widest text-neutral-100">
                  <Link href="/docs">API Key</Link>
                  <Link href="/docs#playground">Guide</Link>
                  <Link href="/">Privacy</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 text-[7px] font-black text-neutral-400 uppercase tracking-[0.5em] border-t border-white/5 pt-10 text-center">
            <p>© {new Date().getFullYear()} FLOW-Q MANAGEMENT.</p>
            <p className="opacity-40">SPEED: &lt;2MS • UPTIME: 99.9%</p>
          </div>
        </div>
      </footer>

      {/* Sticky Footnav for Mobile UX */}
      <nav className="fixed bottom-6 inset-x-6 z-[100] flex justify-center pointer-events-none">
        <div className="bg-neutral-900 border border-white/10 rounded-[2rem] p-2 flex items-center shadow-2xl backdrop-blur-3xl pointer-events-auto">
          <button className="flex items-center justify-center w-12 h-12 rounded-[1.5rem] bg-brand-500 text-white shadow-xl shadow-brand-500/20">
            <MonitorSmartphone className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </div>
  );
}
