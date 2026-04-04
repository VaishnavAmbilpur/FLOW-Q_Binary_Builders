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

export default function DocsPage() {
    const [provisionResult, setProvisionResult] = useState<{ apiKey: string; orgName: string; orgId: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('javascript');
    const [searchTerm, setSearchTerm] = useState("");

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

    const sections = [
        { id: 'introduction', label: 'Introduction', icon: <Globe className="w-4 h-4" /> },
        { id: 'auth', label: 'Authentication', icon: <Lock className="w-4 h-4" /> },
        { id: 'discovery', label: 'I. Discovery', icon: <Search className="w-4 h-4" /> },
        { id: 'orchestration', label: 'II. Orchestration', icon: <Cpu className="w-4 h-4" /> },
        { id: 'lifecycle', label: 'III. Lifecycle', icon: <RefreshCw className="w-4 h-4" /> },
        { id: 'intelligence', label: 'IV. Intelligence', icon: <Activity className="w-4 h-4" /> },
        { id: 'errors', label: 'Error Handling', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'playground', label: 'Swagger API', icon: <Terminal className="w-4 h-4" /> },
    ];

    const filteredSections = sections.filter(s =>
        s.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/20 selection:text-blue-100 antialiased">
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            {/* Nav */}
            <nav className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100] px-8">
                <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-8 h-8 bg-blue-600/90 rounded-lg flex items-center justify-center text-white transition-all group-hover:bg-blue-500">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xs font-bold tracking-tight text-white mb-0.5 uppercase tracking-[0.1em]">Flow-Q <span className="opacity-40 font-medium">B2B Core</span></h2>
                                <p className="text-[9px] font-medium text-slate-600 uppercase tracking-widest leading-none">Protocol v2.0</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={provisionApiKey}
                            disabled={loading}
                            className="px-5 py-2 bg-slate-900 border border-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-slate-800 hover:border-white/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 inline" /> : <Zap className="w-3.5 h-3.5 mr-2 inline text-blue-400" />}
                            Provision Sandbox
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
                                placeholder="Search Protocol..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-[11px] font-medium text-white focus:outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <nav className="space-y-12">
                        {filteredSections.map((section) => (
                            <div key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-white transition-colors mb-4"
                                >
                                    <span className="opacity-40">{section.icon}</span>
                                    {section.label}
                                </a>
                                {['discovery', 'orchestration', 'lifecycle', 'intelligence'].includes(section.id) && (
                                    <ul className="space-y-3.5 ml-7 border-l border-white/5 pl-6">
                                        {section.id === 'discovery' && (
                                            <>
                                                <li><a href="#get-services" className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors block italic">GET /services</a></li>
                                                <li><a href="#get-slots" className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors block italic">GET /services/:id/slots</a></li>
                                            </>
                                        )}
                                        {section.id === 'orchestration' && (
                                            <>
                                                <li><a href="#get-queue" className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors block italic">GET /queue</a></li>
                                                <li><a href="#post-checkin" className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors block italic">POST /queue/check-in</a></li>
                                                <li><a href="#patch-action" className="text-[10px] text-slate-600 hover:text-blue-400 transition-colors block italic">PATCH /queue/:id/action</a></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 px-12 lg:px-24 py-16 max-w-5xl scroll-smooth overflow-x-hidden">

                    {/* Introduction */}
                    <header id="introduction" className="mb-24">
                        <div className="inline-flex items-center gap-3 px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full text-blue-500 font-bold text-[9px] uppercase tracking-widest mb-10">
                            <Activity className="w-3 h-3" /> Technical Specification
                        </div>
                        <h1 className="text-6xl font-medium text-white tracking-tight leading-[1.1] mb-10">
                            The Headless Clinical <br />
                            <span className="text-slate-700 italic">Queue Engine.</span>
                        </h1>
                        <p className="text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mb-16 italic">
                            A mission-critical protocol for synchronizing high-traffic medical environments. All routes are designed for third-party clinical software, kiosk hardware, and patient tracking apps.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-10">
                            <div className="p-10 bg-slate-900/10 border border-white/5 rounded-[2.5rem] group hover:bg-slate-900/20 transition-all cursor-default">
                                <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mb-8 border border-white/5 grayscale group-hover:grayscale-0 transition-all">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-3">Privacy-by-Design</h3>
                                <p className="text-sm text-slate-400 leading-relaxed italic font-medium">All sensitive PII is masked by default. Public tracking utilizes secure, single-use UUID tokens instead of identity strings.</p>
                            </div>
                            <div className="p-10 bg-slate-900/10 border border-white/5 rounded-[2.5rem] group hover:bg-slate-900/20 transition-all cursor-default">
                                <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mb-8 border border-white/5 grayscale group-hover:grayscale-0 transition-all">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-3">Actuator Model</h3>
                                <p className="text-sm text-slate-400 leading-relaxed italic font-medium">Headless by nature. We handle the state synchronization; you build the terminal branding and user experience.</p>
                            </div>
                        </div>
                    </header>

                    {/* Authentication */}
                    <section id="auth" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 01</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-4xl font-medium text-white mb-8 tracking-tight">Authentication Handshake</h2>

                        <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-3xl">
                            Flow-Q utilizes header-based authentication. Every request to the <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400 text-sm font-mono italic">v2</code> protocol must include your Organization API Key.
                        </p>

                        {/* Sandbox Provisioner */}
                        <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] p-8 text-white relative overflow-hidden group mb-16 backdrop-blur-sm shadow-2xl shadow-blue-500/5">
                            <div className="flex items-center justify-between mb-16">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-white leading-none mb-1.5">Sandbox Provisioner</h4>
                                        <p className="text-[10px] font-medium text-slate-700 uppercase tracking-widest leading-none">Clinical Sandbox Context</p>
                                    </div>
                                </div>
                            </div>

                            {!provisionResult ? (
                                <div className="text-center py-20 border border-dashed border-white/5 rounded-[2rem] bg-slate-950/20">
                                    <h3 className="text-2xl font-medium text-slate-400 mb-8 tracking-tight italic">Initialize Medical Environment</h3>
                                    <button
                                        onClick={provisionApiKey}
                                        disabled={loading}
                                        className="px-12 py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <PlayCircle className="w-4 h-4 mr-2 inline" />}
                                        Create Org Sandbox
                                    </button>
                                    {error && <p className="text-rose-500 mt-8 text-xs font-bold uppercase tracking-widest italic">{error}</p>}
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
                                    <div className="grid md:grid-cols-2 gap-12 border-b border-white/5 pb-10">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mb-1.5">Organization Context</span>
                                            <p className="text-lg font-medium text-white italic">"{provisionResult.orgName}"</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block mb-1.5">System Reference</span>
                                            <p className="text-xs font-mono text-slate-500 break-all">{provisionResult.orgId}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 p-10 rounded-[2rem] border border-white/5 relative group/key">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">Secret B2B API Key</span>
                                            {copied && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Copied to Clipboard</span>}
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex-1 px-5 py-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[11px] text-blue-400 break-all overflow-hidden overflow-ellipsis h-12 leading-[1.2rem]">
                                                {provisionResult.apiKey}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(provisionResult.apiKey)}
                                                className="p-4 bg-white/5 hover:bg-white text-slate-600 hover:text-slate-950 rounded-xl border border-white/5 transition-all active:scale-90"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 text-[10px] italic leading-relaxed">
                                            <Info className="w-3.5 h-3.5 inline mr-2 align-text-bottom opacity-60" />
                                            Note: This key grants full access to the "{provisionResult.orgName}" clinical sandbox. Store this securely in your environment variables.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </section>

                    {/* I. Service Discovery */}
                    <section id="discovery" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 02</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-[1.5rem] flex items-center justify-center text-slate-500">
                                <Search className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl font-medium text-white tracking-tight">I. Service Discovery</h2>
                        </div>

                        <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-3xl">
                            Before managing patient flow, your system must discover the clinical landscape. These endpoints provide real-time service counts, department statuses, and scheduling windows.
                        </p>

                        <div className="space-y-24">
                            {/* GET /services */}
                            <div id="get-services" className="scroll-mt-40 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-500 text-[10px] font-bold uppercase tracking-widest">GET</div>
                                    <code className="text-lg font-mono text-white tracking-tight">/services</code>
                                </div>
                                <p className="text-sm text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Retrieves all active clinical services for your organization. This is typically used to populate your booking dropdowns or availability boards.
                                </p>

                                <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                                    <div className="bg-slate-950 p-4 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-slate-700 tracking-widest italic">Response Payload (JSON)</span>
                                        <div className="flex gap-1.5 opacity-20">
                                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                                        </div>
                                    </div>
                                    <pre className="p-8 text-[11px] font-mono whitespace-pre-wrap leading-relaxed text-blue-200/70">
                                        {`{
  "success": true,
  "data": [
    {
      "id": "svc_72x9k",
      "name": "General Wellness Check",
      "description": "Routine diagnostic assessment.",
      "durationMins": 15,
      "estimatedWaitMins": 18,
      "activeWaiters": 4
    }
  ]
}`}
                                    </pre>
                                </div>
                            </div>

                            {/* GET /services/:id/slots */}
                            <div id="get-slots" className="scroll-mt-40 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-500 text-[10px] font-bold uppercase tracking-widest">GET</div>
                                    <code className="text-lg font-mono text-white tracking-tight">/services/:id/slots</code>
                                </div>
                                <p className="text-sm text-slate-500 mb-10 italic max-w-2xl leading-relaxed">
                                    Retrieves 15-minute appointment windows for a specific service and date. Use this to construct your time-picker UI components.
                                </p>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-slate-900/20 border border-white/5 rounded-2xl">
                                        <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 italic">Query Parameters</h5>
                                        <div className="space-y-4">
                                            <div>
                                                <code className="text-[11px] font-mono text-blue-400">date</code>
                                                <p className="text-[11px] text-slate-600 mt-1">Required. Format: YYYY-MM-DD</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-900/20 border border-white/5 rounded-2xl">
                                        <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-4 italic">Metadata</h5>
                                        <p className="text-[11px] text-slate-600 leading-relaxed uppercase tracking-widest font-bold">Latency: ~45ms <br /> Multi-Agent Awareness: ACTIVE</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* II. Live Orchestration */}
                    <section id="orchestration" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 03</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-[1.5rem] flex items-center justify-center text-slate-500">
                                <Cpu className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl font-medium text-white tracking-tight">II. Orchestration</h2>
                        </div>

                        <p className="text-lg text-slate-500 mb-20 leading-relaxed max-w-3xl italic font-medium">
                            The core actuators for managing real-time patient flow. These endpoints power the "Live Board" and staff dashboards.
                        </p>

                        <div className="space-y-32">

                            {/* POST /queue/check-in */}
                            <div id="post-checkin" className="scroll-mt-40 group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-500 text-[10px] font-bold uppercase tracking-widest">POST</div>
                                    <code className="text-lg font-mono text-white tracking-tight">/queue/check-in</code>
                                </div>
                                <div className="p-8 bg-slate-900/30 border-l-2 border-amber-500/50 rounded-r-[2rem] mb-12">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Direct Ingress (Walk-ins)</h4>
                                    <p className="text-sm text-slate-500 italic max-w-xl leading-relaxed">
                                        Use this to bypass appointments and add a participant directly to the waiting mesh. Perfect for front-desk tablets or manual lobby check-ins.
                                    </p>
                                </div>

                                <div className="bg-slate-950 border border-white/5 rounded-3xl p-10 grayscale hover:grayscale-0 transition-grayscale duration-700">
                                    <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic mb-6">Request Schema</h5>
                                    <pre className="text-[11px] font-mono leading-relaxed text-blue-300/80">
                                        {`{
  "clientName": "Jane Doe",
  "clientPhone": "+1234567890",
  "serviceId": "svc_72x9k",
  "notes": "Emergency walk-in"
}`}
                                    </pre>
                                </div>
                            </div>

                            {/* PATCH /queue/:uniqueLinkId/action */}
                            <div id="patch-action" className="scroll-mt-40 group">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded text-sky-500 text-[10px] font-bold uppercase tracking-widest">PATCH</div>
                                        <code className="text-lg font-mono text-white tracking-tight">/queue/:id/action</code>
                                    </div>
                                    <div className="px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full text-blue-400 text-[9px] font-bold uppercase tracking-widest">Primary Actuator</div>
                                </div>
                                <p className="text-sm text-slate-500 mb-12 italic max-w-2xl leading-relaxed">
                                    This endpoint mutation triggers state changes across the entire B2B clinical board. It is the core of the staff-participant handshake.
                                </p>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { action: 'call', desc: 'Moves patient into "Serving" state. Notifies participant.' },
                                        { action: 'complete', desc: 'Finalizes visit. Purges from live board.' },
                                        { action: 'cancel', desc: 'Terminates visit. Logged as incomplete.' }
                                    ].map(act => (
                                        <div key={act.action} className="p-6 bg-slate-900/10 border border-white/5 rounded-2xl hover:bg-slate-900/20 transition-all">
                                            <code className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3">"{act.action}"</code>
                                            <p className="text-[10px] text-slate-600 leading-relaxed font-bold uppercase tracking-widest">{act.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* III. Lifecycle */}
                    <section id="lifecycle" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 04</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-[1.5rem] flex items-center justify-center text-slate-500">
                                <RefreshCw className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl font-medium text-white tracking-tight">III. Lifecycle & Timing</h2>
                        </div>

                        <div className="p-12 bg-white/5 border border-white/5 rounded-[3rem] mb-20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <Activity className="w-48 h-48 text-white" />
                            </div>
                            <h4 className="text-lg font-medium text-white mb-6">The "Scheduled to Live" Handshake</h4>
                            <p className="text-sm text-slate-500 italic leading-relaxed max-w-xl mb-12">
                                When a participant books via <code className="bg-slate-900 px-1.5 rounded text-blue-400">/book</code>, they exist in the <b>"Reservation State."</b> They only enter the live board when they actuate the <b>"Arrival Handshake."</b>
                            </p>
                            <div className="flex items-center gap-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
                                <div>Step 1: Reservation</div>
                                <div className="w-10 h-px bg-slate-800" />
                                <div>Step 2: Actuation (PATCH /arrive)</div>
                                <div className="w-10 h-px bg-slate-800" />
                                <div className="text-emerald-500">Step 3: Live Ingress</div>
                            </div>
                        </div>
                    </section>

                    {/* IV. Intelligence */}
                    <section id="intelligence" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 05</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-4xl font-medium text-white mb-10 tracking-tight flex items-center gap-6">
                            <span className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500"><Activity className="w-6 h-6" /></span>
                            IV. Intelligence & Analytics
                        </h2>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="p-10 bg-slate-900/10 border border-white/5 rounded-[2.5rem]">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Wait-Time Vectors</h4>
                                <p className="text-xs text-slate-600 leading-relaxed italic font-bold uppercase tracking-widest">Flow-Q automatically calculates projected wait times based on historical throughput and active staff indices.</p>
                            </div>
                            <div className="p-10 bg-slate-900/10 border border-white/5 rounded-[2.5rem]">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">Throughput Summaries</h4>
                                <p className="text-xs text-slate-600 leading-relaxed italic font-bold uppercase tracking-widest">Fetch the <code className="bg-slate-950 px-1 rounded text-blue-400 lowercase italic">/analytics/summary</code> endpoint for end-of-day operational audits.</p>
                            </div>
                        </div>
                    </section>

                    {/* V. Error Matrix */}
                    <section id="errors" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 06</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-4xl font-medium text-white mb-12 tracking-tight">System Error Matrix</h2>

                        <div className="border border-white/5 rounded-[2rem] overflow-hidden bg-slate-950/40">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/40 border-b border-white/5">
                                    <tr>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">Protocol Code</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">HTTP</th>
                                        <th className="px-10 py-6 text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">Resolution</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] text-slate-500 font-medium">
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-6 font-mono text-rose-500/90 whitespace-nowrap">AUTH_INVALID_KEY</td>
                                        <td className="px-10 py-6">401</td>
                                        <td className="px-10 py-6 italic text-slate-600">The provisioned x-api-key was not recognized by the Org Model.</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-6 font-mono text-rose-500/90 whitespace-nowrap">HANDSHAKE_EXPIRED</td>
                                        <td className="px-10 py-6">410</td>
                                        <td className="px-10 py-6 italic text-slate-600">The reservation window of the appointment has closed.</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                                        <td className="px-10 py-6 font-mono text-rose-500/90 whitespace-nowrap">ACTUATOR_STATE_CONFLICT</td>
                                        <td className="px-10 py-6">409</td>
                                        <td className="px-10 py-6 italic text-slate-600">Attempted a state mutation that is illegal from the current state.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Interactive Playground (Swagger) */}
                    <section id="playground" className="mb-24 scroll-mt-24">
                        <div className="flex items-center gap-4 mb-14">
                            <span className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.4em]">Section 07</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <h2 className="text-4xl font-medium text-white mb-10 tracking-tight italic">Swagger API Engine</h2>

                        <p className="text-lg text-slate-500 mb-16 leading-relaxed max-w-3xl font-medium italic">
                            Interact with the live clinical endpoints directly in the browser using the authenticated Swagger sandbox. This connects to your local medical deployment.
                        </p>

                        <div className="relative bg-slate-950 border border-white/5 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden min-h-[900px] grayscale hover:grayscale-0 transition-all duration-[2s]">
                            <div className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-12">
                                <div className="flex items-center gap-4">
                                    <Terminal className="w-4 h-4 text-emerald-500/60" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Live API Actuation Core</span>
                                </div>
                            </div>
                            <iframe
                                src={`${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}/api-docs/swagger`}
                                className="w-full h-[830px] border-none opacity-80 invert-[0.88] hue-rotate-180 brightness-110 contrast-90"
                                title="Swagger Documentation"
                            />
                        </div>
                    </section>

                    {/* Footer / Conclusion */}
                    <footer className="mt-64 pt-32 border-t border-white/5 text-center">
                        <div className="flex justify-center gap-16 mb-20 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                            <Database className="w-6 h-6" />
                            <Lock className="w-6 h-6" />
                            <Globe className="w-6 h-6" />
                        </div>
                        <h4 className="text-3xl font-medium text-white tracking-tight mb-8">Ready for Production Handshake.</h4>
                        <p className="text-slate-600 font-normal max-w-md mx-auto mb-20 leading-relaxed text-sm italic">
                            For premium SLA support, rate-limit increases, or custom clinical integrations, please contact our implementation board.
                        </p>
                        <div className="text-[10px] font-bold text-slate-800 uppercase tracking-[0.5em]">
                            PROTOCOL_CORE_SPEC_2026
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
  background: #0f172a;
}
::selection {
    background: rgba(59, 130, 246, 0.2);
    color: #eff6ff;
}
body {
    -webkit-font-smoothing: antialiased;
    scroll-behavior: smooth;
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
    animation: slideUp 0.8s ease-out forwards;
}
`;
