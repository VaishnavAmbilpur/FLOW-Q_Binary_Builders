"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Key, Zap, RefreshCw, Activity, ShieldCheck,
    CheckCircle2, Copy, Loader2, Globe, Server, Code2,
    Terminal, Search, ChevronRight, BookOpen, Layers,
    ExternalLink, Smartphone, LayoutDashboard, Cpu,
    Database, Lock, FileJson, Info, AlertTriangle, PlayCircle
} from 'lucide-react';

const sections = [
    { id: 'introduction', label: 'Introduction', icon: <Globe className="w-4 h-4" /> },
    { id: 'auth', label: 'Authentication', icon: <Lock className="w-4 h-4" /> },
    { id: 'discovery', label: 'I. Discovery', icon: <Search className="w-4 h-4" /> },
    { id: 'scheduling', label: 'II. Scheduling', icon: <Zap className="w-4 h-4" /> },
    { id: 'orchestration', label: 'III. Orchestration', icon: <Cpu className="w-4 h-4" /> },
    { id: 'lifecycle', label: 'IV. Lifecycle', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'intelligence', label: 'V. Intelligence', icon: <Activity className="w-4 h-4" /> },
    { id: 'errors', label: 'VI. Fault Matrix', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'playground', label: 'VII. API Playground', icon: <Terminal className="w-4 h-4" /> },
];

export default function DocsPage() {
    const [mounted, setMounted] = useState(false);
    const [provisionResult, setProvisionResult] = useState<{ apiKey: string; orgName: string; orgId: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('javascript');
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSection, setActiveSection] = useState('introduction');

    useEffect(() => {
        setMounted(true);
    }, []);

    const provisionApiKey = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/v2/demo/provision`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setProvisionResult({
                    apiKey: data.apiKey,
                    orgName: data.organizationName,
                    orgId: data.organizationId
                });
            } else {
                setError(data.message || "Failed to provision sandbox");
            }
        } catch (err) {
            setError(`Could not connect to backend at ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (!mounted) return;

        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -80% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [mounted]);

    const filteredSections = sections.filter(s =>
        s.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/20 selection:text-blue-100 antialiased">
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            {/* Nav */}
            <nav className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100] px-8">
                <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-cyan-600/90 rounded-lg flex items-center justify-center text-white transition-all group-hover:bg-cyan-500 shadow-lg shadow-cyan-500/20">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xs font-black tracking-tight text-white mb-0.5 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Flow-Q <span className="opacity-40 font-medium">B2B Core</span>
                                    <span className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] rounded uppercase">v2.0</span>
                                </h1>
                                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] leading-none">Enterprise Protocol</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={provisionApiKey}
                            disabled={loading}
                            className="px-5 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 inline" /> : <Zap className="w-3.5 h-3.5 mr-2 inline text-cyan-400" />}
                            Spin Up Sandbox
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-[1400px] mx-auto flex">

                {/* Sidebar */}
                <aside className="w-80 h-[calc(100vh-64px)] sticky top-16 hidden md:block border-r border-white/5 p-12 overflow-y-auto bg-slate-950/50">
                    <div className="mb-14">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                            <input
                                type="text"
                                placeholder="Search the protocol..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-2xl text-[11px] font-medium text-white focus:outline-none focus:border-cyan-500/30 transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <nav className="space-y-12">
                        {filteredSections.map((section) => (
                            <div key={section.id} className="relative">
                                {activeSection === section.id && (
                                    <div className="absolute -left-12 top-0 bottom-4 w-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] rounded-r-full animate-in fade-in slide-in-from-left-2 duration-500" />
                                )}
                                <a
                                    href={`#${section.id}`}
                                    className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all mb-4 group ${activeSection === section.id ? 'text-cyan-400' : 'text-slate-600 hover:text-white'}`}
                                >
                                    <span className={`transition-all duration-500 ${activeSection === section.id ? 'opacity-100 scale-110 text-cyan-500' : 'opacity-20 group-hover:opacity-100 text-slate-500 group-hover:text-cyan-500'}`}>{section.icon}</span>
                                    {section.label}
                                </a>
                                {['discovery', 'scheduling', 'orchestration', 'lifecycle', 'intelligence'].includes(section.id) && (
                                    <ul className="space-y-3.5 ml-7 border-l border-white/5 pl-6">
                                        {section.id === 'discovery' && (
                                            <>
                                                <li><a href="#discovery" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /info</a></li>
                                                <li><a href="#get-services" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /services</a></li>
                                                <li><a href="#get-agents" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /agents</a></li>
                                            </>
                                        )}
                                        {section.id === 'scheduling' && (
                                            <>
                                                <li><a href="#scheduling" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /slots</a></li>
                                                <li><a href="#scheduling" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">POST /book</a></li>
                                            </>
                                        )}
                                        {section.id === 'orchestration' && (
                                            <>
                                                <li><a href="#post-queue" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">POST /queue</a></li>
                                                <li><a href="#post-queue" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">PUT /priority</a></li>
                                                <li><a href="#patch-action" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">PATCH /action</a></li>
                                            </>
                                        )}
                                        {section.id === 'intelligence' && (
                                            <>
                                                <li><a href="#intelligence" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /stats</a></li>
                                                <li><a href="#intelligence" className="text-[10px] text-slate-600 hover:text-cyan-400 transition-colors block font-mono">GET /summary</a></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 px-12 lg:px-24 py-24 max-w-5xl scroll-smooth overflow-x-hidden">

                    {/* Introduction */}
                    <header id="introduction" className="mb-32">
                        <div className="inline-flex items-center gap-3 px-3 py-1 bg-cyan-500/5 border border-cyan-500/10 rounded-full text-cyan-500 font-bold text-[9px] uppercase tracking-widest mb-12">
                            <Activity className="w-3 h-3" /> System Specification v2.0
                        </div>
                        <h1 className="text-7xl font-black text-white tracking-tighter leading-[1] mb-12">
                            The Headless <br />
                            <span className="text-slate-700 italic">Merchant Engine.</span>
                        </h1>
                        <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-20">
                            The definitive protocol for synchronizing high-traffic physical storefronts. Build your own kiosks, tracking apps, and staff dashboards powered by our real-time state mesh.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-10">
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:bg-white/[0.04] transition-all cursor-default">
                                <div className="w-14 h-14 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:text-cyan-400 transition-all">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">Enterprise Privacy</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">All personal identifiers are encrypted at rest. Public interactions utilize secure, single-use UUID tokens.</p>
                            </div>
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:bg-white/[0.04] transition-all cursor-default">
                                <div className="w-14 h-14 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:text-cyan-400 transition-all">
                                    <Layers className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">Stateless Actuators</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">Headless by nature. We handle the complex queue logic; you control the terminal branding and user journey.</p>
                            </div>
                        </div>
                    </header>

                    {/* Authentication */}
                    <section id="auth" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Protocol Auth</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-5xl font-black text-white mb-10 tracking-tighter">Bearer Handshake</h2>

                        <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl">
                            Flow-Q utilizes header-based authentication. Every request to the <code className="bg-slate-900 px-3 py-1 rounded-lg text-cyan-400 text-sm font-mono border border-white/5 mx-2">v2.0</code> protocol must include your Organization API Key passed as X-API-KEY.
                        </p>

                        {/* Sandbox Provisioner */}
                        <div className="bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/10 rounded-[3.5rem] p-12 text-white relative overflow-hidden group mb-16 backdrop-blur-xl shadow-2xl shadow-cyan-500/5">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />
                            
                            <div className="flex items-center justify-between mb-20">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(8,145,178,0.3)] rotate-3">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white leading-none mb-1.5">Sandbox Provisioner</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Live Deployment Simulator</p>
                                    </div>
                                </div>
                            </div>

                            {!provisionResult ? (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-black/20 group-hover:border-cyan-500/20 transition-all">
                                    <h3 className="text-3xl font-black text-white mb-10 tracking-tight italic">Initialize Developer Sandbox</h3>
                                    <button
                                        onClick={provisionApiKey}
                                        disabled={loading}
                                        className="px-16 py-5 bg-white text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all hover:bg-cyan-500 hover:text-white active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/10"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3 inline" /> : <PlayCircle className="w-5 h-5 mr-3 inline" />}
                                        Generate New Org Context
                                    </button>
                                    {error && <p className="text-rose-500 mt-10 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">{error}</p>}
                                </div>
                            ) : (
                                <div className="animate-in fade-in zoom-in-95 duration-1000 space-y-16">
                                    <div className="grid md:grid-cols-2 gap-16 border-b border-white/5 pb-12">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-3">Merchant ID</span>
                                            <p className="text-xl font-bold text-white tracking-tight">"{provisionResult.orgName}"</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-3">System Identifier</span>
                                            <p className="text-sm font-mono text-cyan-500/60 break-all">{provisionResult.orgId}</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/60 p-12 rounded-[2.5rem] border border-white/10 relative group/key overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8">
                                            {copied ? <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce" /> : <ShieldCheck className="w-6 h-6 text-slate-800" />}
                                        </div>
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Secret Merchant Key</span>
                                            {copied && <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Saved to clipboard</span>}
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex-1 px-8 py-5 bg-black border border-white/5 rounded-2xl font-mono text-sm text-cyan-400 break-all leading-relaxed shadow-inner">
                                                {provisionResult.apiKey}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(provisionResult.apiKey)}
                                                className="p-6 bg-white hover:bg-cyan-500 text-black hover:text-white rounded-2xl transition-all active:scale-90 shadow-xl"
                                            >
                                                <Copy className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <div className="mt-10 p-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl text-cyan-500/70 text-[11px] font-bold uppercase tracking-widest leading-relaxed flex items-center gap-4">
                                            <Info className="w-5 h-5 flex-shrink-0" />
                                            Warning: This key is valid for the demo sandbox only. Do not use in production environments.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* I. Discovery */}
                    <section id="discovery" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase I: Discovery</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-black border border-white/10 rounded-[2rem] flex items-center justify-center text-cyan-500 shadow-2xl shadow-cyan-500/10">
                                <Search className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Inventory Discovery</h2>
                        </div>

                        <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl">
                            Before managing customer ingress, your system must map the merchant landscape. These endpoints provide real-time availability of service desks, staff statuses, and bookable time windows.
                        </p>

                        <div className="space-y-32">
                            {/* GET /services */}
                            <div id="get-services" className="scroll-mt-40 group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">GET</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/services</code>
                                </div>
                                <p className="text-base text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Retrieves the full catalog of merchant services. Use this to populate booking menus, price lists, or kiosk selection screens.
                                </p>

                                <div className="bg-black border border-white/10 rounded-[2.5rem] overflow-hidden group/code transition-all duration-700">
                                    <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileJson className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Response Schema</span>
                                        </div>
                                    </div>
                                    <pre className="p-10 text-xs font-mono whitespace-pre-wrap leading-relaxed text-cyan-200/60 selection:bg-cyan-500/30">
                                        {`{
  "success": true,
  "data": [
    {
      "id": "svc_81v92",
      "name": "Standard Consultation",
      "durationMins": 30,
      "estimatedWaitMins": 12,
      "activeCustomers": 3,
      "status": "active"
    }
  ]
}`}
                                    </pre>
                                </div>
                            </div>

                            {/* GET /agents */}
                            <div id="get-agents" className="scroll-mt-40 group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">GET</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/agents</code>
                                </div>
                                <p className="text-base text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Lists all active service agents (staff members) currently on the floor. Crucial for systems that allow customers to "Prefer a Specific Merchant."
                                </p>
                                <div className="grid md:grid-cols-2 gap-10 p-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem]">
                                    <div>
                                        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-4">Real-time Props</h5>
                                        <ul className="space-y-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">
                                            <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3 text-cyan-500" /> Current Service Load</li>
                                            <li className="flex items-center gap-3"><CheckCircle2 className="w-3 h-3 text-cyan-500" /> Presence Status</li>
                                        </ul>
                                    </div>
                                    <div className="flex items-center justify-center p-8 bg-black/40 border border-white/5 rounded-2xl">
                                        <Activity className="w-10 h-10 text-cyan-500/20 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* II. Scheduling */}
                    <section id="scheduling" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase II: Scheduling</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-black border border-white/10 rounded-[2rem] flex items-center justify-center text-cyan-500 shadow-2xl shadow-cyan-500/10">
                                <Zap className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Scheduling Core</h2>
                        </div>

                        <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl">
                            Bridge the gap between digital intent and physical presence. Use these endpoints to manage appointments, discover open windows, and handle pre-arrival logic.
                        </p>

                        <div className="space-y-32">
                            {/* GET /services/:id/slots */}
                            <div className="scroll-mt-40 group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">GET</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/services/:id/slots</code>
                                </div>
                                <p className="text-base text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Retrieves 15-minute appointment windows for a specific service and date. Essential for populating time-picker UI components.
                                </p>
                            </div>

                            {/* POST /appointments/book */}
                            <div className="scroll-mt-40 group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-[11px] font-black uppercase tracking-[0.2em]">POST</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/appointments/book</code>
                                </div>
                                <div className="bg-black border border-white/10 rounded-[2.5rem] overflow-hidden">
                                     <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <FileJson className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Booking Payload</span>
                                        </div>
                                    </div>
                                    <pre className="p-10 text-xs font-mono whitespace-pre-wrap leading-relaxed text-cyan-200/60 selection:bg-cyan-500/30">
                                        {`{
  "serviceId": "svc_81v92",
  "name": "Julian Mars",
  "number": "+1555000111",
  "appointmentDate": "2026-12-01",
  "appointmentTime": "14:30"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* III. Live Orchestration */}
                    <section id="orchestration" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase III: Orchestration</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-black border border-white/10 rounded-[2rem] flex items-center justify-center text-cyan-500 shadow-2xl shadow-cyan-500/10">
                                <Cpu className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Actuator Core</h2>
                        </div>

                        <p className="text-xl text-slate-400 mb-20 leading-relaxed max-w-3xl font-medium italic">
                            The mission-critical logic for managing live customer flow. These endpoints power the Storefront Dashboard and Customer Ingress tablets.
                        </p>

                        <div className="space-y-32">

                            {/* POST /queue */}
                            <div id="post-queue" className="scroll-mt-40 group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-[11px] font-black uppercase tracking-[0.2em]">POST</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/queue</code>
                                </div>
                                <div className="p-10 bg-black border border-white/10 rounded-[3rem] mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="w-24 h-24 text-cyan-500" /></div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-4 italic">Instant Ingress (Walk-ins)</h4>
                                    <p className="text-sm text-slate-500 italic max-w-xl leading-relaxed mb-10">
                                        Adds a customer directly to the waiting mesh. Perfect for front-desk iPads or self-service lobby kiosks.
                                    </p>
                                    <div className="bg-black/80 p-8 border border-white/5 rounded-2xl">
                                        <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] mb-6">Request Payload</h5>
                                        <pre className="text-xs font-mono leading-relaxed text-cyan-300/70">
                                            {`{
  "name": "Alex Riviera",
  "number": "+1888444222",
  "serviceId": "svc_81v92",
  "priority": "NORMAL",
  "notes": "Premium member walk-in"
}`}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                             {/* PUT /priority */}
                             <div className="scroll-mt-40 group mb-24">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 text-[11px] font-black uppercase tracking-[0.2em]">PUT</div>
                                    <code className="text-2xl font-mono text-white tracking-tighter">/priority</code>
                                </div>
                                <p className="text-base text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Escalate or de-escalate a customer's position in the live mesh. Supports <code className="text-cyan-400">NORMAL</code>, <code className="text-cyan-400">URGENT</code>, and <code className="text-cyan-400">EMERGENCY</code> tiers.
                                </p>
                             </div>

                            {/* PATCH /queue/:uniqueLinkId/action */}
                            <div id="patch-action" className="scroll-mt-40 group">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 text-[11px] font-black uppercase tracking-[0.2em]">PATCH</div>
                                        <code className="text-2xl font-mono text-white tracking-tighter">/action</code>
                                    </div>
                                    <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[9px] font-black uppercase tracking-[0.3em]">Lifecycle Actuator</div>
                                </div>
                                <p className="text-lg text-slate-500 mb-12 italic max-w-2xl leading-relaxed">
                                    Triggers state transitions for a customer in the queue. This is the heartbeat of your agent dashboard.
                                </p>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {[
                                        { action: 'call', desc: 'Starts the service. Notifies the customer via SMS/Push.' },
                                        { action: 'complete', desc: 'Ends the session. Moves record to historical archives.' },
                                        { action: 'cancel', desc: 'Voids the session. Logged as administrative termination.' }
                                    ].map(act => (
                                        <div key={act.action} className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] hover:bg-white/[0.04] transition-all group/card">
                                            <code className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] block mb-4 italic group-hover/card:text-white transition-colors">"{act.action}"</code>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-widest italic">{act.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* IV. Lifecycle */}
                    <section id="lifecycle" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase IV: Lifecycle</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 bg-black border border-white/10 rounded-[2rem] flex items-center justify-center text-cyan-500 shadow-2xl shadow-cyan-500/10">
                                <RefreshCw className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tighter">Identity Pipeline</h2>
                        </div>

                        <div className="p-16 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-[4rem] mb-20 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                                <ShieldCheck className="w-64 h-64 text-white" />
                            </div>
                            <h4 className="text-2xl font-black text-white mb-8">The "Arrived" State Lock</h4>
                            <p className="text-lg text-slate-400 italic leading-relaxed max-w-2xl mb-16">
                                Customers booked via the <code className="bg-black/40 px-3 py-1 rounded text-cyan-400">/book</code> endpoint remain in a <b>Tentative State</b>. They only enter the live merchant board upon a successful <code className="bg-black/40 px-3 py-1 rounded text-cyan-400">/arrive</code> handshake.
                            </p>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
                                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-slate-800" /> Reservation (API Hook)</div>
                                <ChevronRight className="w-4 h-4 text-slate-800 hidden md:block" />
                                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-slate-800" /> Arrival (Physical Check-in)</div>
                                <ChevronRight className="w-4 h-4 text-slate-800 hidden md:block" />
                                <div className="flex items-center gap-3 text-cyan-500 animate-pulse"><div className="w-2 h-2 rounded-full bg-cyan-500" /> Ingress (Live Board)</div>
                            </div>
                        </div>
                    </section>

                    {/* V. Intelligence */}
                    <section id="intelligence" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase V: Intelligence</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-5xl font-black text-white mb-16 tracking-tighter flex items-center gap-8">
                            <span className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-cyan-500"><Activity className="w-8 h-8" /></span>
                            Operational Insight
                        </h2>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] hover:border-cyan-500/10 transition-colors">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-6">Throughput Vectors</h4>
                                <p className="text-[11px] text-slate-500 leading-[1.8] italic font-black uppercase tracking-widest">Flow-Q automatically synthesizes average service times and agent efficiency indices to provide millisecond-accurate wait time projections.</p>
                            </div>
                            <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] hover:border-cyan-500/10 transition-colors">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-6">Aggregate Audits</h4>
                                <p className="text-[11px] text-slate-500 leading-[1.8] italic font-black uppercase tracking-widest">Utilize the <code className="bg-black px-2 py-0.5 rounded text-cyan-400 lowercase italic font-mono">/analytics/summary</code> endpoint for periodic business performance reviews.</p>
                            </div>
                        </div>
                    </section>

                    {/* VI. Error Matrix */}
                    <section id="errors" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase VI: Fault Matrix</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-5xl font-black text-white mb-16 tracking-tighter">System Error Index</h2>

                        <div className="border border-white/10 rounded-[3rem] overflow-hidden bg-black/40 shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-12 py-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Fault Code</th>
                                        <th className="px-12 py-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Status</th>
                                        <th className="px-12 py-8 text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Resolution Path</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] text-slate-500 font-bold tracking-tight">
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-12 py-8 font-mono text-rose-500/90 whitespace-nowrap">AUTH_KEY_REJECTED</td>
                                        <td className="px-12 py-8">401</td>
                                        <td className="px-12 py-8 italic text-slate-600">The X-API-KEY provided is either expired or not registered in this Org Context.</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-12 py-8 font-mono text-rose-500/90 whitespace-nowrap">RESOURCE_NOT_FOUND</td>
                                        <td className="px-12 py-8">404</td>
                                        <td className="px-12 py-8 italic text-slate-600">The requested Merchant ID, Service ID, or Ticket ID does not exist.</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-12 py-8 font-mono text-rose-500/90 whitespace-nowrap">LIFECYCLE_CONFLICT</td>
                                        <td className="px-12 py-8">409</td>
                                        <td className="px-12 py-8 italic text-slate-600">Attempted a state transition (e.g., Calling a customer who is already serving).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* VII. Interactive Playground (Swagger) */}
                    <section id="playground" className="mb-32 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-20">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">Phase VII: Actuation Playground</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-5xl font-black text-white mb-12 tracking-tighter italic">API Execution Port</h2>

                        <p className="text-xl text-slate-500 mb-20 leading-relaxed max-w-3xl font-medium italic">
                            Execute live hubal commands directly against the engine using the authenticated Swagger environment. This bridge connects to your currently provisioned sandbox.
                        </p>

                        <div className="relative bg-black border border-white/10 rounded-[4rem] shadow-[0_0_120px_rgba(8,145,178,0.05)] overflow-hidden min-h-[900px] group/swagger transition-all duration-700">
                            <div className="h-20 bg-white/5 border-b border-white/5 flex items-center justify-between px-16">
                                <div className="flex items-center gap-6">
                                    <Terminal className="w-5 h-5 text-cyan-500" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">Merchant Protocol Actuator</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                </div>
                            </div>
                            <iframe
                                src={`${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}/api-docs/swagger`}
                                className="w-full h-[820px] border-none opacity-90 invert-[0.85] hue-rotate-180 brightness-110 contrast-100 mix-blend-screen grayscale-[0.2]"
                                title="Swagger Documentation"
                            />
                        </div>
                    </section>

                    {/* Footer / Conclusion */}
                    <footer className="mt-64 pt-32 border-t border-white/5 text-center px-10">
                        <div className="flex justify-center gap-20 mb-24 opacity-10 grayscale hover:grayscale-0 transition-grayscale duration-700 cursor-default">
                            <Database className="w-8 h-8" />
                            <Lock className="w-8 h-8" />
                            <Globe className="w-8 h-8" />
                        </div>
                        <h4 className="text-4xl font-black text-white tracking-tighter mb-10 italic">Ready for Enterprise Integration.</h4>
                        <p className="text-slate-500 font-medium max-w-lg mx-auto mb-24 leading-[1.8] text-base italic uppercase tracking-widest">
                            For custom B2B logic, infrastructure scaling, or white-label portal solutions, please contact our Merchant Operations Board.
                        </p>
                        <div className="text-[11px] font-black text-slate-800 uppercase tracking-[1em] mb-20">
                            FLOW-Q_MERCHANT_SPEC_2026
                        </div>
                    </footer>

                </main>
            </div>
        </div>
    );
}

// Global Styles Injection
const globalStyles = `
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: #020617;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
::selection {
    background: rgba(6, 182, 212, 0.3);
    color: #fff;
}
body {
    -webkit-font-smoothing: antialiased;
    scroll-behavior: smooth;
    overflow-x: hidden;
}
@keyframes fadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}
.animate-in {
    animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

