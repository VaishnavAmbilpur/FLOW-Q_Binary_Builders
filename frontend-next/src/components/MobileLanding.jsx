"use client";

import React from "react";
import Link from "next/link";
import {
  Gauge,
  Zap,
  Globe,
  Cpu,
  Power,
  Layers,
  ArrowRight,
  Code,
  Stethoscope,
  Users2,
  Building2,
  Sparkles,
  QrCode,
  Tv,
  Laptop,
  Smartphone,
  Radio,
  RefreshCw,
  Bell,
  UserCheck,
  FileCheck2,
  Smile,
  BarChart3,
  Clock,
  Coins,
  Star,
  Megaphone,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function MobileLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { label: "How to Use", href: "#how-to-use" },
    { label: "What You Get", href: "#why-choose" },
    { label: "Developer APIs", href: "/api-docs" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              FLOW-Q
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="pt-4 mt-3 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-slate-700 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary-white w-full py-2.5 text-xs font-bold justify-center flex items-center gap-2"
              >
                Staff &amp; Doctor Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary-obsidian w-full py-2.5 text-xs font-bold justify-center flex items-center gap-2"
              >
                Register as Hospital Owner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="px-6 pt-12 pb-20 flex flex-col">
        {/* Eyebrow Tag */}
        <ScrollReveal direction="up" delay={50}>
          <div className="mb-4">
            <span className="eyebrow-tag">
              ← QUEUE &amp; FLOW PLATFORM
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-950 leading-[1.1] mb-4">
            Hi, We&apos;re <br />
            <span>FLOW-Q System</span>
          </h1>

          <p className="text-base font-medium text-slate-800 tracking-tight leading-snug mb-3">
            Building scalable waiting experiences &amp; solving queue congestion.
          </p>

          <p className="text-sm text-slate-600 leading-relaxed mb-8">
            Modern real-time queue platform with instant QR check-in, live status tracking, and multi-desk staff coordination.
          </p>

          {/* Primary Actions */}
          <div className="space-y-2.5 mb-10">
            <Link
              href="/signup"
              className="btn-primary-obsidian w-full py-3.5 text-xs font-bold shadow-md flex items-center justify-center gap-2"
            >
              Register as Hospital Owner <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="btn-secondary-white w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              Staff &amp; Doctor Login
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="#how-to-use"
                className="btn-secondary-white w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                How to Use
              </Link>
              <Link
                href="#why-choose"
                className="btn-secondary-white w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                What You Get
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Mobile Metrics Grid */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-2 gap-3 mb-14">
            {[
              { label: "Wait Drop", val: "-42%", icon: Gauge },
              { label: "Deployment", val: "3 mins", icon: Zap },
              { label: "Latency", val: "<5ms", icon: Cpu },
              { label: "Uptime", val: "99.99%", icon: Globe },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {s.label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-xl font-black font-mono text-slate-900">
                    {s.val}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* 🏥 HOW TO USE GUIDE (MOBILE) */}
        <ScrollReveal direction="up" delay={150}>
          <div className="mb-14" id="how-to-use">
            <span className="eyebrow-tag mb-2">
              ← CLINIC &amp; HOSPITAL GUIDE
            </span>
            <h2 className="text-2xl font-black text-black mb-3">
              How to Use This Website
            </h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Multi-device connectivity and role workflows for hospital owners, doctors, and receptionists.
            </p>

            {/* ⭐ Highlighted Multi-Device Flow Banner */}
            <div className="bg-black text-white p-5 rounded-2xl mb-8 space-y-4 border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Multi-Device &amp; Zero Refresh Flow
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-emerald-400" /> 1. Owner Setup (Device 1)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Owner clicks <strong>&quot;Get Started&quot;</strong>, creates the hospital account, and adds Doctors &amp; Receptionists in Admin.
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" /> 2. Doctor &amp; Staff Login (Device 2 &amp; 3)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Doctors &amp; Receptionists open the site on their phones/tablets and click <strong>&quot;Staff Login&quot;</strong> to access their desks.
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> 3. 100% Zero-Refresh Live Sync
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    When a receptionist adds a patient, the patient instantly pops up on the doctor&apos;s screen without any page reload.
                  </p>
                </div>
              </div>
            </div>

            {/* Glossary Banner */}
            <div className="bg-slate-100 text-black p-4 rounded-2xl mb-6 space-y-1.5 font-mono text-xs border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-black text-[11px] mb-2 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-black" /> Role Denotations:
              </div>
              <div>• <strong className="text-emerald-700">AGENT</strong> = Doctor / Specialist Chamber</div>
              <div>• <strong className="text-sky-700">OPERATOR</strong> = Receptionist / Triage</div>
              <div>• <strong className="text-amber-700">ORG ADMIN</strong> = Hospital Owner / Management</div>
            </div>
          </div>
        </ScrollReveal>

        {/* 🌟 WHAT YOU GET (MOBILE) */}
        <ScrollReveal direction="up" delay={150}>
          <div className="mb-14" id="why-choose">
            <span className="eyebrow-tag mb-2">
              ← CLINICAL ADVANTAGES
            </span>
            <h2 className="text-2xl font-black text-black mb-3">
              Why Hospitals Choose FLOW-Q
            </h2>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              10 core reasons hospitals and clinics upgrade to Flow-Q.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { title: "Digital Tokens & Live Queue", desc: "Take digital tokens & track queue live on phone.", icon: Smartphone },
                { title: "Smart Notifications", desc: "Alert patients when their turn approaches.", icon: Bell },
                { title: "Reduce Staff Workload", desc: "Automate triage & reception routing.", icon: UserCheck },
                { title: "Go 100% Paperless", desc: "Replace paper tokens with digital cloud logs.", icon: FileCheck2 },
                { title: "Better Patient Experience", desc: "Less waiting, zero confusion, 5-star care.", icon: Smile },
                { title: "Real-Time Analytics", desc: "Track patient traffic, doctor speed & SLAs.", icon: BarChart3 },
                { title: "Optimize Operations", desc: "Identify peak hours and staff rosters.", icon: Clock },
                { title: "Improve Profitability", desc: "Eliminate lost consultations & grow revenue.", icon: Coins },
                { title: "Patient Feedback", desc: "Collect post-visit reviews and ratings.", icon: Star },
                { title: "Digital Promotion", desc: "Broadcast announcements on live screen displays.", icon: Megaphone },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-black">{item.title}</h3>
                      <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Mission Card */}
            <div className="bg-black text-white p-6 rounded-2xl text-center border border-slate-800 shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
                <Rocket className="w-3 h-3 text-emerald-400" /> Automate • Analyze • Grow
              </div>
              <h3 className="text-base font-black text-white mb-2">
                Flow-Q: Smarter Hospital Operations
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Reduces workload, improves patient experience, and helps hospitals operate more profitably.
              </p>
              <Link href="/signup" className="btn-secondary-white w-full py-2.5 text-xs font-bold bg-white text-black">
                Get Started Free →
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </main>

      {/* Mobile Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-10 px-6 text-xs text-slate-500">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white">
              <Layers className="w-3 h-3" />
            </div>
            <span>FLOW-Q Queue System</span>
          </div>
          <div className="flex flex-wrap gap-4 font-semibold text-slate-600">
            <Link href="/login">Staff Portal</Link>
            <Link href="/operator">Operator</Link>
            <Link href="/agent">Agent</Link>
            <Link href="/api-docs">API Reference</Link>
          </div>
          <p>© {new Date().getFullYear()} FLOW-Q Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
