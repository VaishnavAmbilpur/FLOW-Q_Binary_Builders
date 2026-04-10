"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import anime from "animejs";
import {
    BarChart3, Shield, Lock, Smartphone, ChevronDown, CheckCircle2,
    ChevronRight, Wifi, Battery, Layers, MapPin, Search,
    Cpu, Globe, Zap, Target, Gauge, Database, User, ShieldCheck
} from "lucide-react";

export default function ModernLanding() {
    useEffect(() => {
        const tl = anime.timeline({ easing: 'easeOutExpo' });

        tl.add({
            targets: '.animate-fade-up',
            translateY: [40, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            duration: 1000,
        }).add({
            targets: '.animate-scale-in',
            scale: [0.9, 1],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 800,
        }, '-=600');
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden relative selection:bg-brand-500/30">

            {/* Ambient Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[20%] bg-purple-600/10 blur-[150px] rounded-[100%] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            {/* Premium Navigation Header */}
            <nav className="relative z-50 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto animate-fade-up opacity-0">
                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform group-hover:rotate-6 transition-all duration-500">
                        <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={28}
                            height={28}
                            className="object-contain drop-shadow-lg"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter text-white uppercase italic">
                            FLOW-Q
                        </span>
                        <span className="text-[7px] font-black tracking-[0.4em] text-neutral-100 uppercase -mt-1">Smart Waiting System</span>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] p-1.5 rounded-[1.5rem] border border-white/5 backdrop-blur-xl">
                    {[
                        { name: "Landing Page", path: "/" },
                        { name: "API Docs", path: "/docs" }
                    ].map((item) => (
                        <Link 
                            key={item.name} 
                            href={item.path}
                            className="px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest text-neutral-100 hover:text-white hover:bg-white/5 cursor-pointer transition-all"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="px-8 py-3.5 rounded-[1.5rem] bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
                        Staff Login
                    </Link>
                    <Link href="/signup" className="px-8 py-3.5 rounded-[1.5rem] bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-brand-600/20 transition-all transform hover:-translate-y-0.5">
                        Start Now
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 w-full pt-16 pb-32">

                {/* Hero Command Section */}
                <div className="max-w-5xl mx-auto text-center px-8 animate-fade-up opacity-0">

                    {/* Synchronized Status Badge */}
                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-brand-500/10 border border-brand-500/20 rounded-[1.5rem] sm:rounded-full px-6 py-3 sm:py-2.5 mb-10 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                            <span className="text-[9px] font-black tracking-[0.3em] text-brand-400 uppercase">Pro Waiting Software</span>
                        </div>
                        <div className="hidden sm:block w-px h-3 bg-brand-500/20 mx-1" />
                        <span className="text-[9px] font-black text-brand-300 uppercase tracking-widest">Global Waitlist System v2.0</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 text-white leading-[0.9] uppercase italic">
                        The Future of <br />
                        <span className="bg-gradient-to-r from-brand-400 via-brand-600 to-emerald-400 bg-clip-text text-transparent px-2">Waiting.</span>
                    </h1>

                    <p className="text-base md:text-lg text-neutral-100 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
                        FLOW-Q makes waiting simple and organized. <br className="hidden md:block" />
                        A smart system for live waitlists and easy guest tracking.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                        <Link href="/signup" className="group relative px-10 py-4 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden">
                            <span className="relative z-10">Get Started</span>
                            <div className="absolute inset-0 bg-brand-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </Link>
                        <Link href="/login" className="px-10 py-4 rounded-[2rem] border border-white/10 hover:border-white/30 text-white font-black text-xs uppercase tracking-[0.2em] transition-all backdrop-blur-sm">
                            Staff Login
                        </Link>
                    </div>

                    {/* Matrix Load Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { label: "Active Hubs", val: "50+", icon: <Globe className="w-4 h-4" /> },
                            { label: "Deployment", val: "3m", icon: <Zap className="w-4 h-4" /> },
                            { label: "Throughput", val: "+40%", icon: <Gauge className="w-4 h-4" /> },
                            { label: "Latency", val: "<5ms", icon: <Cpu className="w-4 h-4" /> }
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/[0.04] transition-all group">
                                <div className="text-neutral-200 mb-3 group-hover:text-brand-400 transition-colors">{stat.icon}</div>
                                <div className="text-2xl font-black tracking-tighter mb-1 font-mono text-white">{stat.val}</div>
                                <div className="text-[8px] font-black text-neutral-200 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Visualization Stage */}
                <div className="relative mt-24 mb-28 h-[520px] w-full max-w-7xl mx-auto px-6 animate-scale-in opacity-0">

                    {/* Holographic Horizon */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center -mb-20">
                        <div className="w-[140%] h-[1px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
                        <div className="absolute w-full h-[400px] bg-brand-500/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
                    </div>

                    {/* Control Node Mockup */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[90%] md:w-[70%] h-full bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className="flex flex-col md:flex-row gap-10 h-full">
                            {/* Registry Input Node */}
                             <div className="w-full md:w-[320px] bg-black/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl transform group-hover:-translate-x-2 transition-transform duration-700">
                                <h3 className="text-lg font-black italic uppercase tracking-tight mb-8">Add to List</h3>
                                <div className="space-y-6">
                                     <div className="space-y-2">
                                        <div className="text-[8px] font-black text-neutral-200 uppercase tracking-widest ml-4">Guest Name</div>
                                        <div className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 flex items-center text-xs text-neutral-100 font-mono tracking-tighter italic">Type name here...</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-[8px] font-black text-neutral-200 uppercase tracking-widest ml-4">Visit Reason</div>
                                        <div className="w-full h-14 bg-white/[0.02] border border-white/5 rounded-2xl px-6 flex items-center justify-between text-xs text-neutral-100">
                                            Choose Reason <ChevronDown className="w-4 h-4 opacity-70" />
                                        </div>
                                    </div>
                                    <button className="w-full py-5 bg-brand-600 hover:bg-brand-500 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-600/30 transition-all active:scale-95">
                                        Add Guest
                                    </button>
                                </div>
                            </div>

                            {/* Global Queue View */}
                            <div className="flex-1 hidden md:flex flex-col justify-between py-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-10">
                                        <Database className="w-5 h-5 text-brand-400 opacity-80" />
                                        <span className="text-[10px] font-black text-neutral-100 uppercase tracking-[0.4em]">Live Waitlist Status</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        {[
                                            { label: "Operator A", color: "bg-danger-500" },
                                            { label: "Operator B", color: "bg-brand-500" },
                                            { label: "Operator C", color: "bg-success-500" }
                                        ].map((hub) => (
                                            <div key={hub.label} className="flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl">
                                                <div className={`w-3 h-3 rounded-full ${hub.color} animate-pulse`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-100">{hub.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-end gap-6 opacity-20 group-hover:opacity-60 transition-opacity duration-1000">
                                    <div className="w-10 h-32 bg-brand-500/20 rounded-t-full" />
                                    <div className="flex-1 h-px bg-neutral-800 mb-4" />
                                    <div className="w-14 h-48 bg-emerald-500/20 rounded-t-full" />
                                    <div className="w-10 h-24 bg-purple-500/20 rounded-t-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Neural Status Node (Mobile Mockup) */}
                    <div className="absolute z-30 right-[5%] md:right-[12%] -top-12 w-[280px] h-[560px] bg-[#050505] border-[8px] border-neutral-900 rounded-[3.5rem] shadow-2xl flex flex-col pt-8 pb-10 px-6 hidden lg:flex hover:-translate-y-6 transition-transform duration-700 cursor-none group/phone">
                        <div className="w-24 h-6 bg-neutral-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-[18px]" />

                        <div className="flex-1 flex flex-col animate-fade-in">
                            <div className="flex items-center justify-between mb-10 opacity-30">
                                <span className="text-[10px] font-black font-mono tracking-tighter">QUEUE_SYNC</span>
                                <div className="flex gap-2"><Wifi className="w-3 h-3" /><Battery className="w-3 h-3" /></div>
                            </div>

                             <h2 className="text-neutral-100 uppercase text-[10px] font-black tracking-[0.4em] mb-4 text-center">Live Tracking</h2>

                            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-brand-500/5 blur-[40px] pointer-events-none" />

                                <p className="text-[10px] font-black text-neutral-100 uppercase tracking-widest mb-2">Place in Line</p>
                                <span className="text-7xl font-black tracking-tighter text-white mb-6 font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">#03</span>

                                <div className="w-full h-px bg-white/5 my-6" />

                                <p className="text-[10px] font-black text-neutral-100 uppercase tracking-widest mb-2">Wait Time</p>
                                <span className="text-3xl font-black tracking-tight text-brand-400 font-mono italic">14<span className="text-[10px] ml-2 text-neutral-100">MINS</span></span>
                            </div>

                            <div className="mt-8 py-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                                <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Live Updates On</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Feature Matrix */}
                <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8 relative z-30 mb-32">
                     {[
                        { title: "Instant Sync", icon: <Globe className="w-6 h-6" />, desc: "Everything stays updated across all screens instantly.", color: "text-brand-400 border-brand-500/20" },
                        { title: "Smart Wait Times", icon: <Target className="w-6 h-6" />, desc: "High-accuracy system for live waitlists and easy guest tracking.", color: "text-emerald-400 border-emerald-500/20" },
                        { title: "Secure Data", icon: <Lock className="w-6 h-6" />, desc: "Everything is safe and only accessible to your staff.", color: "text-purple-400 border-purple-500/20" }
                    ].map((feature, i) => (
                        <div key={i} className={`group bg-white/[0.03] border rounded-[3rem] p-10 backdrop-blur-3xl transition-all duration-500 hover:bg-white/[0.05] hover:-translate-y-2 animate-fade-up opacity-0 shadow-2xl ${feature.color}`}>
                            <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-white/10 transition-all">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tight uppercase mb-4 text-white">{feature.title}</h3>
                            <p className="text-neutral-100 text-sm font-medium leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* API Architecture Segment */}
                <div className="max-w-7xl mx-auto px-8 mb-28 animate-fade-up opacity-0">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-14 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />
                        
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 leading-tight">Smart Waiting <br /> <span className="text-brand-400">System</span></h2>
                                <p className="text-neutral-100 text-base mb-10 leading-relaxed">
                                    Easily add a waitlist to any app or website. Our platform provides a simple hub for all your waiting guests. <br />
                                    Get alerts the moment a guest arrives or finishes.
                                </p>
                                 <div className="space-y-6">
                                    {[
                                        { title: "Universal SDK", desc: "Easily add the waitlist to any website or app." },
                                        { title: "Real-time updates", desc: "Guests see their place in line update instantly." },
                                        { title: "Smart Data", desc: "Accurate wait times based on live business activity." }
                                    ].map((spec) => (
                                        <div key={spec.title} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">{spec.title}</h4>
                                                <p className="text-xs text-neutral-200 uppercase tracking-widest font-bold leading-relaxed">{spec.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-black/60 border border-white/10 rounded-[3rem] p-8 font-mono text-[10px] text-brand-400 leading-6 shadow-2xl relative">
                                 <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                    <span className="ml-4 text-neutral-500 font-black tracking-widest uppercase">Waitlist.sync</span>
                                </div>
                                <div className="space-y-1">
                                    <p><span className="text-purple-400">POST</span> /api/v2/queue/sync</p>
                                    <p className="text-neutral-500">{"{"}</p>
                                    <p className="ml-4">"business_id": <span className="text-emerald-400">"ID-550-V"</span>,</p>
                                    <p className="ml-4">"action": <span className="text-emerald-400">"ADD_GUEST"</span>,</p>
                                    <p className="ml-4">"priority": <span className="text-emerald-400">"NORMAL"</span></p>
                                    <p className="text-neutral-500">{"}"}</p>
                                    <p className="mt-4 text-neutral-500">HTTP/1.1 <span className="text-brand-400">202 Accepted</span></p>
                                    <p className="text-white bg-brand-500/20 px-2 py-1 inline-block mt-2">UPDATING LIVE WAITLIST...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enterprise Solutions Matrix */}
                <div className="max-w-7xl mx-auto px-8 mb-28 animate-fade-up opacity-0">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Choose Your Plan</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-neutral-800" />
                            <span className="text-[10px] font-black text-neutral-200 uppercase tracking-[0.5em]">For Every Business</span>
                            <div className="h-px w-12 bg-neutral-800" />
                        </div>
                    </div>
                    
                     <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { type: "Startup", desc: "Perfect for single locations needing real-time waitlist updates.", icon: <User className="w-6 h-6" /> },
                            { type: "Business", desc: "Full sync across multiple floors or departments.", icon: <ShieldCheck className="w-6 h-6" /> },
                            { type: "Developer", desc: "Full API access for building custom waitlist features.", icon: <Cpu className="w-6 h-6" /> }
                        ].map((tier) => (
                            <div key={tier.type} className="bg-white/[0.03] border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.05] transition-all group">
                                <div className="w-14 h-14 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-400 mb-8">{tier.icon}</div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4 text-white">{tier.type}</h3>
                                <p className="text-neutral-100 text-sm leading-relaxed mb-8">{tier.desc}</p>
                                <Link href="/signup" className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-brand-400 hover:text-white transition-colors">
                                    View Plan <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Authority Dashboard Previews */}
                <div className="max-w-7xl mx-auto px-8 mb-28 animate-fade-up opacity-0">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Simple Dashboards</h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-12 bg-neutral-800" />
                            <span className="text-[10px] font-black text-neutral-200 uppercase tracking-[0.5em]">Tools for your staff</span>
                            <div className="h-px w-12 bg-neutral-800" />
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Hubian Interface */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-500/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <BarChart3 className="w-6 h-6 text-brand-400" />
                                    <h4 className="text-xl font-black uppercase italic tracking-tight">Staff Panel</h4>
                                </div>
                                <span className="px-5 py-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-full text-[8px] font-black uppercase tracking-widest">Live Screen</span>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { id: "Q_048", name: "Sarah Jenkins", status: "NEXT", active: true },
                                    { id: "Q_049", name: "John Weaver", status: "QUEUE", active: false },
                                    { id: "Q_050", name: "David Ledger", status: "QUEUE", active: false }
                                ].map((node) => (
                                    <div key={node.id} className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${node.active ? 'bg-brand-600 border-brand-500 text-white shadow-2xl' : 'bg-white/5 border-white/5 text-neutral-300 hover:border-white/10'}`}>
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-mono text-[10px] font-black tracking-tighter">{node.id}</div>
                                            <span className="text-sm font-black uppercase tracking-tight">{node.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest">{node.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Operator Architecture */}
                        <div className="bg-[#111111] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center justify-between mb-12">
                                <div className="flex items-center gap-4">
                                    <Layers className="w-6 h-6 text-emerald-400" />
                                    <h4 className="text-xl font-black uppercase italic tracking-tight">Operator Desk</h4>
                                </div>
                                <span className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest">Check-in Hub</span>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { action: "Add Person", color: "bg-emerald-600" },
                                    { action: "Sort List", color: "bg-white/5 border-white/10" },
                                    { action: "Finish Visit", color: "bg-danger-500/10 border-danger-500/20 text-danger-500" }
                                ].map((control) => (
                                    <div key={control.action} className={`w-full py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center border transition-all cursor-pointer hover:scale-[1.02] ${control.color}`}>
                                        {control.action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust & Security Panel */}
                <div className="max-w-7xl mx-auto px-8 mb-20 animate-fade-up opacity-0">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-10 md:p-14 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] pointer-events-none" />
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Security</h2>
                        <p className="text-[10px] font-black text-neutral-100 uppercase tracking-[0.6em] mb-12">GDPR • GDPR • ISO 27001 Compliant</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { title: "256-bit AES", label: "Encryption" },
                                { title: "Zero Knowledge", label: "Architecture" },
                                { title: "Multi-Factor", label: "Authentication" },
                                { title: "System Audit", label: "Logging" }
                            ].map((sec) => (
                                <div key={sec.title} className="p-6">
                                    <div className="text-lg font-black italic tracking-tight mb-1">{sec.title}</div>
                                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em]">{sec.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Global Command Footer */}
                <div className="relative z-20 border-t border-white/5 bg-white/[0.01] pt-20 pb-10">
                    <div className="max-w-7xl mx-auto px-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-32">
                            <div className="col-span-2">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
                                        <Image src="/logo.svg" alt="L" width={20} height={20} />
                                    </div>
                                    <span className="font-black text-xl italic tracking-tighter uppercase">FLOW-Q</span>
                                </div>
                                <p className="text-neutral-100 text-xs leading-relaxed font-medium max-w-xs mb-8">
                                    High-performance waiting list management. Simple tools for your business, powerful tech under the hood.
                                </p>
                                <div className="flex items-center gap-6">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-500 transition-colors cursor-pointer"><Globe className="w-4 h-4" /></div>
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-500 transition-colors cursor-pointer"><Cpu className="w-4 h-4" /></div>
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-500 transition-colors cursor-pointer"><Target className="w-4 h-4" /></div>
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">System Control</h4>
                                <div className="flex flex-col gap-5 text-[10px] font-black uppercase tracking-widest text-neutral-100">
                                    <Link href="/org-admin/dashboard" className="hover:text-brand-400 transition-colors">Admin Dashboard</Link>
                                    <Link href="/agent" className="hover:text-brand-400 transition-colors">Staff Portal</Link>
                                    <Link href="/operator" className="hover:text-brand-400 transition-colors">Front Desk</Link>
                                    <Link href="/kiosk" className="hover:text-brand-400 transition-colors">Check-in Kiosk</Link>
                                </div>
                            </div>                             
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">Protocols</h4>
                                <div className="flex flex-col gap-5 text-[10px] font-black uppercase tracking-widest text-neutral-100">
                                    <Link href="/docs" className="hover:text-brand-400 transition-colors">API Guide</Link>
                                    <Link href="/docs#playground" className="hover:text-brand-400 transition-colors">Examples</Link>
                                    <Link href="/docs" className="hover:text-brand-400 transition-colors">Webhooks</Link>
                                    <Link href="/docs" className="hover:text-brand-400 transition-colors">Architecture</Link>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">Authority</h4>
                                <div className="flex flex-col gap-5 text-[10px] font-black uppercase tracking-widest text-neutral-100">
                                    <Link href="/privacy" className="hover:text-brand-400 transition-colors">Privacy</Link>
                                    <Link href="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link>
                                    <Link href="/docs" className="hover:text-brand-400 transition-colors">Compliance</Link>
                                    <Link href="/docs" className="hover:text-brand-400 transition-colors">Security</Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between text-[8px] font-black text-neutral-500 uppercase tracking-[0.6em] border-t border-white/5 pt-10">
                            <p>© {new Date().getFullYear()} FLOW-Q QUEUE MANAGEMENT. ALL RIGHTS RESERVED. POWERED BY FLOW-Q.</p>
                            <p className="mt-4 md:mt-0">LATENCY: &lt;5MS • UPTIME: 99.9% • ENCRYPTION: AES-256</p>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
