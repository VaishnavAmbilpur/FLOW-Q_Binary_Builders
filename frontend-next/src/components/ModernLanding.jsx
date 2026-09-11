"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import {
  BarChart3,
  Lock,
  ChevronRight,
  Wifi,
  Battery,
  Layers,
  Cpu,
  Globe,
  Zap,
  Target,
  Gauge,
  Database,
  User,
  ShieldCheck,
  Code,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  Users2,
  Building2,
  QrCode,
  Tv,
  Clock,
  PhoneCall,
  FileText,
  Laptop,
  Smartphone,
  Radio,
  RefreshCw,
  Share2,
  Bell,
  UserCheck,
  FileCheck2,
  Smile,
  TrendingUp,
  Coins,
  Star,
  Megaphone,
  Rocket,
  Menu,
  X,
} from "lucide-react";

export default function ModernLanding() {
  const [activeSection, setActiveSection] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const sectionIds = ["how-to-use", "why-choose", "features", "architecture"];
    const handleScroll = () => {
      const scrollY = window.scrollY + 180;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "How to Use", href: "#how-to-use", id: "how-to-use" },
    { label: "What You Get", href: "#why-choose", id: "why-choose" },
    { label: "Live Preview", href: "#features", id: "features" },
    { label: "Architecture", href: "#architecture", id: "architecture" },
    { label: "API Docs", href: "/api-docs", id: "api-docs" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Sleek Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                FLOW-Q
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
                Queue Matrix
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`transition-all duration-200 ${
                    isActive
                      ? "text-black font-extrabold border-b-2 border-black pb-0.5"
                      : "text-slate-500 font-medium hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex btn-secondary-white text-xs px-4 py-2.5 font-bold"
            >
              Staff &amp; Doctor Login
            </Link>
            <Link
              href="/signup"
              className="hidden md:inline-flex btn-primary-obsidian text-xs px-4 py-2.5 font-bold"
            >
              Register as Hospital Owner <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white text-black hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 text-sm font-bold flex items-center justify-between ${
                      isActive ? "text-black font-black" : "text-slate-600 hover:text-black"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-black" />}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary-white w-full py-3 text-xs font-bold justify-center flex items-center gap-2"
              >
                Staff &amp; Doctor Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary-obsidian w-full py-3 text-xs font-bold justify-center flex items-center gap-2"
              >
                Register as Hospital Owner <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="w-full">
        {/* HERO SECTION — Matching Reference Image Layout & Typography */}
        <section className="pt-20 pb-20 px-6 max-w-4xl mx-auto">
          <ScrollReveal direction="up" delay={50}>
            {/* Eyebrow / Category Tag */}
            <div className="mb-6">
              <span className="eyebrow-tag">
                ← REAL-TIME QUEUE &amp; CUSTOMER FLOW ENGINE
              </span>
            </div>

            {/* Massive Bold Headline matching reference */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-[-0.035em] leading-[1.08] mb-6">
              Hi, We&apos;re <br />
              <span className="text-slate-950">FLOW-Q System</span>
            </h1>

            {/* Subheading text */}
            <p className="text-xl sm:text-2xl font-medium text-slate-800 tracking-tight leading-snug mb-5">
              Building scalable waiting experiences &amp; solving real-time queue congestion.
            </p>

            {/* Body paragraph */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-10 font-normal">
              Cloud-native waiting room orchestrator and live status platform designed for high-concurrency clinics, hospitals, service desks, and modern businesses with instant QR check-in and sub-second updates.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Link href="/signup" className="btn-primary-obsidian text-sm px-6 py-3.5 font-bold">
                <span>Register as Hospital Owner</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="btn-secondary-white text-sm px-6 py-3.5 font-bold">
                <span>Staff &amp; Doctor Login</span>
              </Link>
              <Link href="#how-to-use" className="btn-secondary-white text-sm px-5 py-3.5 font-bold">
                <span>How to Use Guide</span>
              </Link>
              <Link href="#why-choose" className="btn-secondary-white text-sm px-5 py-3.5 font-bold">
                <span>What You Get</span>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* METRICS STRIP */}
        <section className="border-y border-slate-100 bg-slate-50/60 py-12 px-6">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal direction="up" delay={100}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Real-time Latency", val: "<5ms", icon: Cpu },
                  { label: "Patient Wait Drop", val: "-42%", icon: Gauge },
                  { label: "System Availability", val: "99.99%", icon: Zap },
                  { label: "Active Deployments", val: "50+ Clinics", icon: Globe },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {stat.label}
                        </span>
                        <Icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                        {stat.val}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 🏥 HOW TO USE THIS WEBSITE — CLINIC & HOSPITAL WORKFLOW GUIDE */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="how-to-use">
          <ScrollReveal direction="up" delay={100}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="eyebrow-tag mb-3">
                ← ROLE WORKFLOW &amp; MULTI-DEVICE GUIDE
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                How to Use This Website
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Connect Hospital Owners, Doctors, Receptionists, and Patients seamlessly across different devices with <strong>zero-refresh real-time updates</strong>.
              </p>
            </div>

            {/* ⭐ PROMINENT MULTI-DEVICE WORKFLOW HIGHLIGHT BANNER */}
            <div className="p-8 sm:p-10 rounded-3xl bg-black text-white mb-16 shadow-2xl border border-slate-800 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                      MULTI-DEVICE ARCHITECTURE &amp; INSTANT SYNC
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      How Doctors, Staff &amp; Owners Connect from Different Devices
                    </h3>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-bold font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Zero Page Refresh • 100% Live WebSockets
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-300">
                {/* Step 1: Owner */}
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                      <Laptop className="w-4 h-4 text-emerald-400" />
                      <span>1. Hospital Owner Setup</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-4">
                      The owner opens the website from their PC/Laptop, clicks the black <strong className="text-white">&quot;Get Started&quot;</strong> button, creates the hospital account, and adds Doctors &amp; Receptionists in the <strong className="text-white">Admin Dashboard</strong>.
                    </p>
                  </div>
                  <Link href="/signup" className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                    Click &quot;Get Started&quot; to Register →
                  </Link>
                </div>

                {/* Step 2: Staff */}
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <span>2. Doctor &amp; Staff Login</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-4">
                      Doctors and Receptionists open the website on their own phones, tablets, or PCs and click the top-right <strong className="text-white">&quot;Staff Login&quot;</strong> button. Doctors enter their Chamber Desk (<strong className="text-white">/agent</strong>), Receptionists enter Front Desk (<strong className="text-white">/operator</strong>).
                    </p>
                  </div>
                  <Link href="/login" className="text-sky-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]">
                    Click &quot;Staff Login&quot; to Access →
                  </Link>
                </div>

                {/* Step 3: Zero Refresh */}
                <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white font-bold text-sm mb-3">
                      <RefreshCw className="w-4 h-4 text-amber-400" />
                      <span>3. Zero-Refresh Live Sync</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed mb-4">
                      When a receptionist adds a patient or a patient scans a QR code, the patient appears on the doctor&apos;s screen <strong className="text-white">instantly without refreshing</strong>. When the doctor clicks &quot;Call Next&quot;, the TV display, receptionist screen, and patient pass update in <strong className="text-white">&lt;5ms</strong>.
                    </p>
                  </div>
                  <span className="text-amber-400 font-bold text-[11px]">
                    ⚡ Real-time Socket.IO Sync Active
                  </span>
                </div>
              </div>
            </div>

            {/* Role Terminology Key Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-100 text-black mb-12 flex flex-wrap items-center justify-between gap-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  Quick Role Glossary for Hospital Staff:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-black shadow-sm">
                  <strong className="text-emerald-700 font-black">AGENT</strong> = Doctor / Specialist Chamber
                </span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-black shadow-sm">
                  <strong className="text-sky-700 font-black">OPERATOR</strong> = Front Desk Receptionist
                </span>
                <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-black shadow-sm">
                  <strong className="text-amber-700 font-black">ORG ADMIN</strong> = Hospital Owner / Management
                </span>
              </div>
            </div>

            {/* 4-Step End-to-End Hospital Journey Pipeline */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 block mb-1">
                  PATIENT JOURNEY ARCHITECTURE
                </span>
                <h3 className="text-2xl font-black text-black tracking-tight">
                  How a Patient Moves Through the Clinic
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "01",
                    title: "Check-In & Token",
                    desc: "Patient arrives, scans entrance QR or is checked in by receptionist, receiving Token #A-105.",
                    icon: QrCode,
                  },
                  {
                    step: "02",
                    title: "Live Waiting Room",
                    desc: "Patient monitors queue position on mobile phone while Waiting Room TV announces live queue.",
                    icon: Tv,
                  },
                  {
                    step: "03",
                    title: "Doctor Consultation",
                    desc: "Doctor clicks 'Call Next' on /agent. TV rings chime 'Token A-105 to Room 1'.",
                    icon: Stethoscope,
                  },
                  {
                    step: "04",
                    title: "Visit Log & SLA",
                    desc: "Doctor marks visit complete, notes are saved, and management analytics update instantly.",
                    icon: FileText,
                  },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-xs font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                            STEP {s.step}
                          </span>
                          <Icon className="w-5 h-5 text-black" />
                        </div>
                        <h4 className="text-base font-bold text-black mb-2">
                          {s.title}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 🌟 WHAT YOU GET — WHY HOSPITALS CHOOSE FLOW-Q */}
        <section className="py-24 px-6 bg-slate-50/70 border-t border-slate-200" id="why-choose">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up" delay={100}>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="eyebrow-tag mb-3">
                  ← CLINICAL EXCELLENCE &amp; ROI
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                  Why Hospitals Choose FLOW-Q
                </h2>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Everything your hospital, clinic, and medical staff need to streamline patient intake, eliminate waiting room chaos, and operate with maximum efficiency.
                </p>
              </div>

              {/* 10 Value Proposition Points Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {[
                  {
                    title: "Digital Tokens & Live Queue",
                    desc: "Patients take digital tokens, track their position, and view the live queue from their smartphones without standing in crowded physical lines.",
                    icon: Smartphone,
                    highlight: "Zero Physical Lines",
                  },
                  {
                    title: "Smart Notifications",
                    desc: "Alert patients when their turn is approaching via web and SMS notifications, reducing lobby congestion and anxiety.",
                    icon: Bell,
                    highlight: "Proactive Alerts",
                  },
                  {
                    title: "Reduce Staff Workload",
                    desc: "Automate front-desk registration, triage tags, and counter routing so receptionists and nurses can focus on higher-value patient care.",
                    icon: UserCheck,
                    highlight: "50% Less Admin Time",
                  },
                  {
                    title: "Go 100% Paperless",
                    desc: "Replace physical token slips, thermal printers, paper registers, and logbooks with an automated cloud record.",
                    icon: FileCheck2,
                    highlight: "Eco-Friendly & Modern",
                  },
                  {
                    title: "Better Patient Experience",
                    desc: "Transparent wait times and clear room directions create greater comfort, dignity, and a positive clinical impression.",
                    icon: Smile,
                    highlight: "5-Star Patient NPS",
                  },
                  {
                    title: "Real-Time Analytics",
                    desc: "Executive dashboards track patient traffic, average wait durations, doctor consultation speed, and department efficiency.",
                    icon: BarChart3,
                    highlight: "Data-Driven Decisions",
                  },
                  {
                    title: "Optimize Operations",
                    desc: "Identify peak patient arrival hours, traffic bottlenecks, and allocate doctors and nursing staff at the ideal times.",
                    icon: Clock,
                    highlight: "Smart Staff Rosters",
                  },
                  {
                    title: "Improve Profitability",
                    desc: "Reduce operational overhead, eliminate lost walk-in consultations, improve throughput, and maximize daily doctor utilization.",
                    icon: Coins,
                    highlight: "Higher Daily Revenue",
                  },
                  {
                    title: "Patient Feedback & Reviews",
                    desc: "Collect real-time patient ratings and feedback post-consultation to resolve service issues and continuously improve care quality.",
                    icon: Star,
                    highlight: "Continuous Improvement",
                  },
                  {
                    title: "Online Presence & Promotion",
                    desc: "Maintain a modern digital presence for hospital departments and announce new specialty camps directly on live screens without costly paper posters.",
                    icon: Megaphone,
                    highlight: "Digital Outreach",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-400 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-black">
                            <Icon className="w-6 h-6 text-black" />
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                            {item.highlight}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-black tracking-tight mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🚀 Mission Statement Bottom Banner */}
              <div className="p-8 sm:p-10 rounded-3xl bg-black text-white text-center shadow-xl border border-slate-800">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest mb-4">
                  <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Automate • Analyze • Improve • Grow
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                  FLOW-Q: The Modern Operating System for Hospitals &amp; Clinics
                </h3>
                <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
                  A smarter queue system that reduces staff workload, improves patient experience, provides actionable hospital insights, and helps hospitals operate more efficiently and profitably.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link href="/signup" className="btn-secondary-white text-xs px-6 py-3 font-bold bg-white text-black hover:bg-slate-100">
                    Get Started Free <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/login" className="btn-primary-obsidian text-xs px-6 py-3 font-bold border border-slate-700">
                    Access Staff Portal
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* INTERACTIVE LIVE QUEUE & MOBILE TRACKER STAGE */}
        <section className="py-24 px-6 max-w-6xl mx-auto border-t border-slate-100" id="features">
          <ScrollReveal direction="up" delay={150}>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow-tag mb-3">
                ← LIVE EXPERIENCE MATRIX
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Designed for Staff and Customers
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Zero friction for guests scanning a QR code, paired with high-precision real-time control for desk operators.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Operator Command Console Mockup */}
              <div className="lg:col-span-7 surface-card p-8 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Main Reception Desk • Live Station
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    Queue: 4 Waiting
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { id: "A-102", name: "Sarah Jenkins", service: "General Consultation", status: "BEING SERVED", active: true },
                    { id: "A-103", name: "Michael Chen", service: "Document Verification", status: "NEXT IN LINE", active: false },
                    { id: "A-104", name: "Elena Rostova", service: "Account Inquiries", status: "WAITING", active: false },
                  ].map((row) => (
                    <div
                      key={row.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        row.active
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50/70 border-slate-200 text-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg ${
                          row.active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-900"
                        }`}>
                          {row.id}
                        </span>
                        <div>
                          <div className={`text-sm font-bold ${row.active ? "text-white" : "text-slate-900"}`}>
                            {row.name}
                          </div>
                          <div className={`text-xs ${row.active ? "text-slate-300" : "text-slate-500"}`}>
                            {row.service}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        row.active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link href="/agent" className="btn-primary-obsidian text-xs flex-1 py-3 text-center">
                    Call Next Guest
                  </Link>
                  <Link href="/operator" className="btn-secondary-white text-xs py-3 px-5 text-center">
                    Reception View
                  </Link>
                </div>
              </div>

              {/* Mobile Ticket Live Tracker Mockup */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-[320px] bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl border-4 border-slate-800">
                  <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-6" />

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-6 font-mono">
                    <span>FLOW-Q MOBILE</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-2xl p-6 text-center border border-slate-700/50 mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                      YOUR POSITION
                    </span>
                    <div className="text-6xl font-black font-mono tracking-tight text-white mb-3">
                      #02
                    </div>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Estimated Wait: ~6 mins
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Service</span>
                      <span className="font-semibold text-white">General Inquiry</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Station</span>
                      <span className="font-semibold text-white">Counter #01</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Notification</span>
                      <span className="font-semibold text-emerald-400">SMS &amp; Web Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* 3 CORE CAPABILITIES GRID */}
        <section className="py-20 px-6 bg-slate-50/70 border-t border-slate-100" id="architecture">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal direction="up" delay={100}>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="eyebrow-tag mb-3">
                  ← SYSTEM CAPABILITIES
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                  Built for Reliability &amp; Speed
                </h2>
                <p className="text-slate-600 text-base">
                  Engineered with atomic state synchronizations, encrypted customer records, and sub-100ms updates.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Sub-Second Sync",
                    desc: "Persistent WebSocket connection cluster guarantees immediate rank progression across all tablets and phones.",
                    icon: Zap,
                  },
                  {
                    title: "Encrypted PII Storage",
                    desc: "Sensitive phone numbers and personal identities are encrypted at rest with field-level cipher protection.",
                    icon: Lock,
                  },
                  {
                    title: "B2B QaaS API Suite",
                    desc: "Headless REST API with API keys, idempotency locks, and HMAC signature webhooks for backend integration.",
                    icon: Code,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-6">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* DEVELOPER API SHOWCASE */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <ScrollReveal direction="up" delay={150}>
            <div className="grid lg:grid-cols-2 gap-12 items-center bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                  ← HEADLESS INTEGRATION
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
                  Integrate Queues into Your Existing App
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-8">
                  Trigger queue joins, status reads, and automated callbacks with standard JSON payloads. Connect your CRM, mobile app, or internal ERP in minutes.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    "Idempotency protection against duplicate requests",
                    "HMAC-SHA256 signature verified webhooks",
                    "Real-time Socket.IO room subscriptions",
                  ].map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-200">{pt}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/api-docs"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors text-sm"
                >
                  Explore Swagger Docs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto shadow-inner">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4 text-slate-500">
                  <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="ml-2 text-[10px] uppercase font-bold tracking-wider">
                    POST /api/v2/queue/join
                  </span>
                </div>
                <pre className="text-slate-300 leading-relaxed">
{`curl -X POST http://localhost:5000/api/v2/queue \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clientName": "Jane Doe",
    "serviceId": "65f12a98b472e",
    "clientPhone": "+1 (555) 019-2831",
    "priority": "HIGH"
  }'`}
                </pre>
                <div className="mt-4 pt-4 border-t border-slate-800 text-emerald-400">
                  {`// Response 201 Created
{
  "tokenNumber": 1,
  "uniqueLinkId": "e7a65013-beae-4cee-9455-4a9387b2c4c1",
  "statusLink": "/v2/queue/e7a65013-beae-4cee-9455-4a9387b2c4c1",
  "estimatedWaitMins": 0
}`}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* CALL TO ACTION FOOTER BANNER */}
        <section className="py-20 px-6 bg-slate-50 border-t border-slate-100 text-center" id="pricing">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-3xl mx-auto">
              <span className="eyebrow-tag mb-4">
                ← GET STARTED WITH FLOW-Q
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Ready to Modernize Your Customer Flow?
              </h2>
              <p className="text-slate-600 text-base mb-8 max-w-xl mx-auto">
                Set up your organization dashboard in less than 3 minutes. No hardware dependencies or complex setups required.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/signup" className="btn-primary-obsidian text-sm px-7 py-3.5 font-bold">
                  Create Free Account
                </Link>
                <Link href="/login" className="btn-secondary-white text-sm px-7 py-3.5 font-bold">
                  Access Portal
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      {/* MINIMAL CLEAN FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">FLOW-Q Waiting System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Staff Portal
            </Link>
            <Link href="/operator" className="hover:text-slate-900 transition-colors">
              Operator Desk
            </Link>
            <Link href="/agent" className="hover:text-slate-900 transition-colors">
              Agent Counter
            </Link>
            <Link href="/api-docs" className="hover:text-slate-900 transition-colors">
              API Reference
            </Link>
          </div>

          <p>© {new Date().getFullYear()} FLOW-Q Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
