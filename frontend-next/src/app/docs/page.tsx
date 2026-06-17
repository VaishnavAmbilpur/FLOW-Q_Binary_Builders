"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Key, Zap, RefreshCw, Activity, ShieldCheck,
    CheckCircle2, Copy, Loader2, Globe, Server, Code2,
    Terminal, Search, ChevronRight, BookOpen, Layers,
    ExternalLink, Smartphone, LayoutDashboard, Cpu,
    Database, Lock, FileJson, Info, AlertTriangle, PlayCircle,
    Check
} from 'lucide-react';

const sections = [
    { id: 'introduction', label: 'Introduction', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'auth', label: 'Authentication', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'discovery', label: 'I. Discovery', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'scheduling', label: 'II. Scheduling', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'orchestration', label: 'III. Orchestration', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'IV. Analytics', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'errors', label: 'V. Fault Matrix', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'playground', label: 'VI. Interactive API Console', icon: <Terminal className="w-3.5 h-3.5" /> },
];

export default function DocsPage() {
    const [mounted, setMounted] = useState(false);
    const [provisionResult, setProvisionResult] = useState<{ apiKey: string; orgName: string; orgId: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copiedKey, setCopiedKey] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSection, setActiveSection] = useState('introduction');
    const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

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

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        if (id === 'apiKey') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else {
            setCopiedCodeId(id);
            setTimeout(() => setCopiedCodeId(null), 2000);
        }
    };

    useEffect(() => {
        if (!mounted) return;

        const observerOptions = {
            root: null,
            rootMargin: '-15% 0px -75% 0px',
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
        <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-brand-500/20 selection:text-white antialiased relative">
            
            {/* Ambient Accent Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
            </div>

            {/* Sticky Navigation Bar */}
            <nav className="h-16 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-900 sticky top-0 z-[100] px-6 sm:px-8">
                <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center transition-all group-hover:rotate-3 shadow-lg">
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-sm font-black tracking-tighter text-white uppercase italic flex items-center gap-2">
                                    FLOW-Q
                                    <span className="px-1.5 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[8px] rounded uppercase font-sans tracking-widest font-black">v2.0</span>
                                </h1>
                                <p className="text-[7px] font-black text-neutral-400 uppercase tracking-[0.4em] leading-none">Developer Specification</p>
                            </div>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-colors mr-4 hidden sm:block">
                            Back to Home
                        </Link>
                        <button
                            onClick={provisionApiKey}
                            disabled={loading}
                            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-600/20"
                        >
                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-white" />}
                            Provision Sandbox
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto flex px-6 sm:px-8">

                {/* Left Sidebar Navigation */}
                <aside className="w-64 h-[calc(100vh-64px)] sticky top-16 hidden md:block border-r border-neutral-900 py-10 pr-6 overflow-y-auto z-40 bg-transparent">
                    <div className="mb-8">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="Search spec..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-xl text-[10px] font-semibold text-white focus:outline-none focus:border-brand-500/30 transition-all placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    <nav className="space-y-6">
                        {filteredSections.map((section) => (
                            <div key={section.id} className="relative">
                                {activeSection === section.id && (
                                    <div className="absolute -left-[25px] top-0 bottom-0 w-1 bg-brand-500 rounded-r-full" />
                                )}
                                <a
                                    href={`#${section.id}`}
                                    className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest transition-all mb-3 group ${activeSection === section.id ? 'text-brand-400' : 'text-neutral-400 hover:text-white'}`}
                                >
                                    <span className={`${activeSection === section.id ? 'text-brand-500 scale-105' : 'text-neutral-600 group-hover:text-neutral-300'} transition-all`}>{section.icon}</span>
                                    {section.label}
                                </a>
                                {['discovery', 'scheduling', 'orchestration', 'analytics'].includes(section.id) && (
                                    <ul className="space-y-2 ml-6 border-l border-neutral-900 pl-4">
                                        {section.id === 'discovery' && (
                                            <>
                                                <li><a href="#get-info" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /info</a></li>
                                                <li><a href="#get-locations" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /locations</a></li>
                                                <li><a href="#get-services" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /services</a></li>
                                                <li><a href="#get-agent-status" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /agents/:id/status</a></li>
                                            </>
                                        )}
                                        {section.id === 'scheduling' && (
                                            <>
                                                <li><a href="#get-slots" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /services/:id/slots</a></li>
                                                <li><a href="#post-book" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">POST /appointments/book</a></li>
                                                <li><a href="#patch-arrive" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">PATCH /appointments/:id/arrive</a></li>
                                            </>
                                        )}
                                        {section.id === 'orchestration' && (
                                            <>
                                                <li><a href="#get-queue" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /queue</a></li>
                                                <li><a href="#post-queue" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">POST /queue</a></li>
                                                <li><a href="#post-queue-bulk" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">POST /queue/bulk</a></li>
                                                <li><a href="#patch-action" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">PATCH /queue/:id/action</a></li>
                                            </>
                                        )}
                                        {section.id === 'analytics' && (
                                            <>
                                                <li><a href="#get-analytics-summary" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /analytics/summary</a></li>
                                                <li><a href="#get-analytics-wait" className="text-[9px] text-neutral-500 hover:text-brand-400 transition-colors block font-mono">GET /analytics/wait-times</a></li>
                                            </>
                                        )}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 py-12 md:py-16 md:pl-10 max-w-4xl overflow-x-hidden relative z-10 scroll-smooth">

                    {/* Section: Introduction */}
                    <header id="introduction" className="mb-20 scroll-mt-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 font-black text-[8px] uppercase tracking-widest mb-6">
                            <Activity className="w-3 h-3" /> Core System Protocols v2.0
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase italic mb-6">
                            B2B API Reference
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-3xl mb-12">
                            Welcome to the Flow-Q API reference. This endpoint mesh allows you to programmatically manage customer ingress, query real-time wait times, book reservations, and coordinate floor operator workflows. Every endpoint has been designed for low-latency state synchronization.
                        </p>

                        {/* Connection Credentials Info */}
                        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
                            <h3 className="text-xs font-black uppercase text-white tracking-widest mb-3 flex items-center gap-2">
                                <Server className="w-4 h-4 text-brand-400" /> API Base URL & Headers
                            </h3>
                            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                                Send all requests to the following domain environment. The B2B sandbox operates on standard HTTP, while production mandates HTTPS TLS 1.3:
                            </p>
                            <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 font-mono text-[10px] space-y-2 text-brand-400">
                                <div><span className="text-neutral-500 uppercase tracking-widest font-black mr-2">Base URL:</span> http://localhost:5000/api</div>
                                <div><span className="text-neutral-500 uppercase tracking-widest font-black mr-2">Method Header:</span> x-api-key: &lt;your_sandbox_api_key&gt;</div>
                                <div><span className="text-neutral-500 uppercase tracking-widest font-black mr-2">Content-Type:</span> application/json</div>
                            </div>
                        </div>
                    </header>

                    {/* Section: Authentication */}
                    <section id="auth" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Developer Access</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Bearer Handshake</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Generate temporary keys directly in our developer console below to trigger integration webhooks, populate kiosks, or query analytics in real-time.
                        </p>

                        {/* Sandbox Provisioner Widget */}
                        <div className="bg-neutral-900/20 border border-neutral-800 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 blur-[80px] pointer-events-none rounded-full" />
                            
                            {!provisionResult ? (
                                <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl bg-black/10 hover:border-brand-500/20 transition-all">
                                    <h4 className="text-sm font-black text-white mb-3 uppercase tracking-wider">Initialize Developer Sandbox</h4>
                                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-6">Generates a virtual organization, catalog services, and a developer key</p>
                                    <button
                                        onClick={provisionApiKey}
                                        disabled={loading}
                                        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                                        Generate Org Context
                                    </button>
                                    {error && <p className="text-rose-500 mt-4 text-[9px] font-black uppercase tracking-wider">{error}</p>}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6 border-b border-neutral-800 pb-6">
                                        <div>
                                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Sandbox Org Name</span>
                                            <p className="text-sm font-bold text-white">"{provisionResult.orgName}"</p>
                                        </div>
                                        <div>
                                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-1">Organization ID</span>
                                            <p className="text-xs font-mono text-brand-400 break-all">{provisionResult.orgId}</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 p-5 rounded-xl border border-neutral-800 relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Secret API Key (Pass as x-api-key header)</span>
                                            {copiedKey && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Copied</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 px-4 py-3 bg-black/80 border border-neutral-800 rounded-lg font-mono text-xs text-brand-400 break-all leading-normal">
                                                {provisionResult.apiKey}
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(provisionResult.apiKey, 'apiKey')}
                                                className="p-3.5 bg-neutral-800 hover:bg-brand-600 hover:text-white text-neutral-300 rounded-lg transition-all active:scale-95"
                                                title="Copy to clipboard"
                                            >
                                                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="mt-4 p-3.5 bg-brand-500/5 border border-brand-500/10 rounded-lg text-brand-400 text-[9px] font-semibold tracking-wide flex items-center gap-3">
                                            <Info className="w-4 h-4 flex-shrink-0" />
                                            Active demo token: Scope is constrained to sandbox routers. Expires when database is purged.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section: Discovery */}
                    <section id="discovery" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase I: Discovery</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Inventory Discovery</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Discover active resources within your organization. Use these endpoints to map available service categories, list staffed agent terminals, and locate check-in branches.
                        </p>

                        <div className="space-y-12">
                            {/* GET /info */}
                            <div id="get-info" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/info</code>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Auth Required</span>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Fetches the full organization profile, subscription status, active configuration flags, and branch locations.
                                </p>
                            </div>

                            {/* GET /locations */}
                            <div id="get-locations" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/locations</code>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Auth Required</span>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Retrieves the array of physical locations associated with this business entity. Useful for multi-site check-in routing.
                                </p>
                            </div>

                            {/* GET /services */}
                            <div id="get-services" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/services</code>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Auth Required</span>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Lists all active services (e.g. consultations, checkouts) with their current waitlist lengths and estimated wait times.
                                </p>

                                <div className="mb-6">
                                    <h4 className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-2">Query Parameters</h4>
                                    <div className="border border-neutral-850 rounded-xl overflow-hidden text-[10px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-900/40 border-b border-neutral-850 text-neutral-400">
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Param</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Type</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Required</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-850 text-neutral-300">
                                                <tr>
                                                    <td className="px-4 py-2 font-mono text-brand-400">locationId</td>
                                                    <td className="px-4 py-2">String</td>
                                                    <td className="px-4 py-2 text-neutral-500">Optional</td>
                                                    <td className="px-4 py-2">Filter services operating at a specific location ID.</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-mono text-brand-400">category</td>
                                                    <td className="px-4 py-2">String</td>
                                                    <td className="px-4 py-2 text-neutral-500">Optional</td>
                                                    <td className="px-4 py-2">Regex filter matching specific department labels.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* GET /agents/:id/status */}
                            <div id="get-agent-status" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/agents/:agentId/status</code>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Auth Required</span>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Queries an agent's terminal state: current availability status (e.g. Available, Break), active service category, and current queue load.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Scheduling */}
                    <section id="scheduling" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase II: Scheduling</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Scheduling Core</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Coordinate pre-scheduled visits and reservation slots. The scheduling system maps service hours to generate open, collision-free appointment windows.
                        </p>

                        <div className="space-y-12">
                            {/* GET /services/:id/slots */}
                            <div id="get-slots" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/services/:serviceId/slots</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Generates 15-minute appointment time windows for a service based on staff calendars and existing booking locks.
                                </p>
                                <div className="mb-6">
                                    <h4 className="text-[8px] font-black text-neutral-500 uppercase tracking-widest mb-2">Required Params</h4>
                                    <div className="border border-neutral-850 rounded-xl overflow-hidden text-[10px]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-neutral-900/40 border-b border-neutral-850 text-neutral-400">
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Param</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">In</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Type</th>
                                                    <th className="px-4 py-2 uppercase font-black tracking-wider text-[8px]">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-850 text-neutral-300">
                                                <tr>
                                                    <td className="px-4 py-2 font-mono text-brand-400">serviceId</td>
                                                    <td className="px-4 py-2">Path</td>
                                                    <td className="px-4 py-2">String</td>
                                                    <td className="px-4 py-2">The unique identifier of the target service category.</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 font-mono text-brand-400">date</td>
                                                    <td className="px-4 py-2">Query</td>
                                                    <td className="px-4 py-2">String (YYYY-MM-DD)</td>
                                                    <td className="px-4 py-2">Target date context for calculating open times.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* POST /appointments/book */}
                            <div id="post-book" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black rounded uppercase tracking-widest">POST</span>
                                        <code className="font-mono text-xs text-white font-semibold">/appointments/book</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Reservates an appointment slot. The booking payload requires the customer profile, service ID, and desired ISO date-time.
                                </p>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 font-mono text-[9px] text-neutral-400 relative">
                                        <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Request Body</span>
                                        {`{
  "serviceId": "65bfa78a...",
  "clientName": "Julian Mars",
  "clientPhone": "+1555123456",
  "scheduledAt": "2026-12-01T14:30:00Z",
  "notes": "Consultation note"
}`}
                                    </div>
                                    <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 font-mono text-[9px] text-brand-400 relative">
                                        <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Response JSON</span>
                                        {`{
  "success": true,
  "appointmentId": "65bfa902...",
  "clientName": "Julian Mars",
  "scheduledAt": "2026-12-01T14:30:00.000Z",
  "serviceName": "General Consulting"
}`}
                                    </div>
                                </div>
                            </div>

                            {/* PATCH /appointments/:id/arrive */}
                            <div id="patch-arrive" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-black rounded uppercase tracking-widest">PATCH</span>
                                        <code className="font-mono text-xs text-white font-semibold">/appointments/:id/arrive</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400">
                                    Executes arrival check-in. This marks the reservation as 'arrived' and automatically transitions the guest into the active, live queue board.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Orchestration */}
                    <section id="orchestration" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase III: Orchestration</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Actuator Core</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Control queue flow, push walk-ins onto the board, promote high-priority clients, and trigger lifecycle states (e.g. Call, Complete, Cancel).
                        </p>

                        <div className="space-y-12">
                            {/* GET /queue */}
                            <div id="get-queue" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/queue</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400">
                                    Lists active queue entries for the organization. Can be filtered by status (waiting, serving, completed) or specific serviceId.
                                </p>
                            </div>

                            {/* POST /queue */}
                            <div id="post-queue" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black rounded uppercase tracking-widest">POST</span>
                                        <code className="font-mono text-xs text-white font-semibold">/queue</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Direct walk-in check-in. Ingresses a customer directly into the active waitlist, generating a unique status link.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 font-mono text-[9px] text-neutral-400">
                                        <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Request Body</span>
                                        {`{
  "serviceId": "65bfa78a...",
  "clientName": "Alex Riviera",
  "clientPhone": "+1888444222",
  "priority": "HIGH",
  "notes": "Walk-in guest note"
}`}
                                    </div>
                                    <div className="bg-black/60 border border-neutral-800 rounded-xl p-4 font-mono text-[9px] text-brand-400">
                                        <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Response JSON</span>
                                        {`{
  "success": true,
  "tokenNumber": 4,
  "uniqueLinkId": "f3b207ac...",
  "queueEntryId": "65bfab12...",
  "statusLink": "/v2/queue/f3b207ac...",
  "estimatedWaitMins": 15
}`}
                                    </div>
                                </div>
                            </div>

                            {/* POST /queue/bulk */}
                            <div id="post-queue-bulk" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black rounded uppercase tracking-widest">POST</span>
                                        <code className="font-mono text-xs text-white font-semibold">/queue/bulk</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400">
                                    Batch-inserts up to 50 queue entries in a single network round-trip. Useful for migrating lists or uploading daily lobby sheets.
                                </p>
                            </div>

                            {/* PATCH /queue/:uniqueLinkId/action */}
                            <div id="patch-action" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[9px] font-black rounded uppercase tracking-widest">PATCH</span>
                                        <code className="font-mono text-xs text-white font-semibold">/queue/:uniqueLinkId/action</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Transitions customer lifecycle status. Crucial for floor desks updating dashboards or calling next tickets.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                                        <code className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-2">"call"</code>
                                        <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">Transitions state to serving. Broadcasts live updates and triggers SMS notifications.</p>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                                        <code className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-2">"complete"</code>
                                        <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">Resolves the queue slot, archives timestamps, and updates performance analytics.</p>
                                    </div>
                                    <div className="p-4 bg-black/40 border border-neutral-800 rounded-xl">
                                        <code className="text-[10px] font-black text-brand-400 uppercase tracking-widest block mb-2">"cancel"</code>
                                        <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">Voids the waitlist slot, marking the status field as cancelled.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Analytics */}
                    <section id="analytics" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase IV: Analytics</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Operational Insight</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Analyze visit throughput, track hourly check-in volume peaks, and extract average session durations.
                        </p>

                        <div className="space-y-12">
                            {/* GET /analytics/summary */}
                            <div id="get-analytics-summary" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/analytics/summary</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400 mb-6">
                                    Aggregates total check-ins, completed counts, cancelled ratios, and average session times scoped by period (today, week, month).
                                </p>
                            </div>

                            {/* GET /analytics/wait-times */}
                            <div id="get-analytics-wait" className="scroll-mt-24 bg-neutral-900/20 border border-neutral-800 rounded-2xl p-6 relative">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black rounded uppercase tracking-widest">GET</span>
                                        <code className="font-mono text-xs text-white font-semibold">/analytics/wait-times</code>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-400">
                                    Returns hourly visitor counts for a target date context. Essential for plotting charts showing lobby foot traffic trends.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Fault Matrix */}
                    <section id="errors" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase V: Fault Matrix</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Error Schema</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Every request error returns a standardized JSON structure including error codes and field-level validation messages.
                        </p>

                        <div className="border border-neutral-800 rounded-xl overflow-hidden bg-black/40 text-xs">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-neutral-900/40 border-b border-neutral-800 text-neutral-400">
                                        <th className="px-6 py-4 uppercase font-black tracking-wider text-[8px]">Fault Code</th>
                                        <th className="px-6 py-4 uppercase font-black tracking-wider text-[8px]">Status</th>
                                        <th className="px-6 py-4 uppercase font-black tracking-wider text-[8px]">Resolution Context</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[10px] text-neutral-300 divide-y divide-neutral-800/60 font-medium">
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-rose-500">AUTH_KEY_REJECTED</td>
                                        <td className="px-6 py-4">401</td>
                                        <td className="px-6 py-4 text-neutral-500">The x-api-key provided is expired or invalid for this organization context.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-rose-500">RESOURCE_NOT_FOUND</td>
                                        <td className="px-6 py-4">404</td>
                                        <td className="px-6 py-4 text-neutral-500">The target service ID, agent ID, or unique link ID does not exist in the database.</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 font-mono text-rose-500">LIFECYCLE_CONFLICT</td>
                                        <td className="px-6 py-4">409</td>
                                        <td className="px-6 py-4 text-neutral-500">Invalid action state progression (e.g. calling an entry already served).</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section: Interactive Playground */}
                    <section id="playground" className="mb-20 scroll-mt-20">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Phase VI: Console</span>
                            <div className="flex-1 h-px bg-neutral-900" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 tracking-tighter uppercase italic">Interactive API Console</h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mb-8 leading-relaxed">
                            Test live B2B endpoints directly against the server container using our integrated Swagger playground.
                        </p>

                        <div className="bg-black border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative">
                            <div className="h-12 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between px-6">
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-4 h-4 text-brand-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Swagger Console</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                </div>
                            </div>
                            <iframe
                                src={`${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}/api-docs/swagger`}
                                className="w-full h-[640px] border-none opacity-90 invert-[0.9] hue-rotate-180 brightness-110 contrast-100 mix-blend-screen grayscale-[0.1]"
                                title="Swagger Playground Console"
                            />
                        </div>
                    </section>

                    {/* Compact Footer / Version Flag */}
                    <footer className="mt-24 pt-12 border-t border-neutral-900 text-center">
                        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.5em]">
                            FLOW-Q B2B API DOCUMENTATION © {new Date().getFullYear()}
                        </p>
                    </footer>

                </main>
            </div>
        </div>
    );
}
