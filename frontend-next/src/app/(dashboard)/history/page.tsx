"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { 
    History, Search, Filter, Calendar, CheckCircle, XCircle, 
    Briefcase, Clock, Users, Activity, FileText, MonitorSmartphone,
    RefreshCw, ChevronRight, User, Trash2, Smartphone, ExternalLink,
    GripVertical, Copy
} from "lucide-react";
import Loader from "@/components/Loader";

export default function HistoryDashboard() {
    const [history, setHistory] = useState<any[]>([]);
    const [date, setDate] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const initializeHistory = async () => {
            try {
                setLoading(true);
                const userRes = await api.get("/auth/me");
                const userData = userRes.data;
                setUser(userData);

                if (userData.role === "OPERATOR") {
                    setAgents(userData.assignedAgents || []);
                } else if (userData.role === "ORG_ADMIN") {
                    const staffRes = await api.get("/organizations/staff");
                    const allStaff = staffRes.data || [];
                    const agentsList = allStaff.filter((s: any) => s.role === "AGENT");
                    setAgents(agentsList);
                }
            } catch (err: any) {
                setError("Failed to initialize. Please login again.");
                setLoading(false);
            }
        };

        initializeHistory();
    }, []);

    const loadHistory = async () => {
        if (!user) return;
        try {
            setLoading(true);
            setError("");
            const params: any = { date, status, search };
            if ((user.role === "OPERATOR" || user.role === "ORG_ADMIN") && selectedAgentId) {
                params.agentId = selectedAgentId;
            }
            const res = await api.get(`/queue/history/`, { params });
            setHistory(res.data);
        } catch (err: any) {
            setError("Failed to load history");
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadHistory();
    }, [user, selectedAgentId]);

    const showMsg = (text: string, type: string) => {
        setMsg(text);
        setTimeout(() => setMsg(""), 4000);
    };

    const copyTrackingId = (uid: string) => {
        navigator.clipboard.writeText(uid);
        showMsg("Tracking ID Copied", "success");
    };

    if (loading && !user) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-hidden selection:bg-brand-500/30">
            
            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-down">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
                            <History className="w-8 h-8 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1">Customer History</h1>
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Comprehensive Customer Logs <span className="mx-2 text-neutral-800">/</span> Archive</p>
                        </div>
                    </div>
                </div>

                {/* Status Toggles & Rapid Filters */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12 animate-fade-up">
                    <div className="lg:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5">Hubian Filter</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-5 top-5 w-4 h-4 text-neutral-600 group-focus-within:text-brand-500 transition-colors" />
                            <select
                                className="w-full bg-white/[0.03] border border-white/5 p-5 pl-12 rounded-[1.5rem] text-white outline-none appearance-none transition-all cursor-pointer focus:border-brand-500/50 focus:bg-white/[0.05]"
                                value={selectedAgentId}
                                onChange={e => setSelectedAgentId(e.target.value)}
                            >
                                <option value="" className="bg-neutral-900 text-neutral-500">All Agents</option>
                                {agents.map(agent => (
                                    <option key={agent._id} value={agent._id} className="bg-neutral-900">{agent.name} ({agent.serviceCategory})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5">Status Filter</label>
                        <div className="relative group">
                            <Activity className="absolute left-5 top-5 w-4 h-4 text-neutral-600 group-focus-within:text-brand-500 transition-colors" />
                            <select
                                className="w-full bg-white/[0.03] border border-white/5 p-5 pl-12 rounded-[1.5rem] text-white outline-none appearance-none transition-all cursor-pointer focus:border-brand-500/50 focus:bg-white/[0.05]"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                            >
                                <option value="" className="bg-neutral-900 text-neutral-500">All Entries</option>
                                <option value="completed" className="bg-neutral-900">Completed Visits</option>
                                <option value="cancelled" className="bg-neutral-900">Cancelled Visits</option>
                            </select>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5">Customer Search</label>
                        <div className="relative group flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-5 w-4 h-4 text-neutral-600 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    placeholder="Search by name or identifier..."
                                    className="w-full bg-white/[0.03] border border-white/5 p-5 pl-12 rounded-[1.5rem] text-white placeholder-neutral-700 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05]"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={loadHistory}
                                className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-8 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-95"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {msg && (
                    <div className="mb-8 p-5 rounded-[2rem] bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black uppercase tracking-widest animate-fade-up flex items-center justify-center gap-3 text-[10px] backdrop-blur-xl">
                        <CheckCircle className="w-4 h-4" /> {msg}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-4 backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-up min-h-[700px]">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="p-4 lg:p-10">
                        {loading ? (
                            <div className="py-40 flex flex-col items-center justify-center animate-pulse">
                                <MonitorSmartphone className="w-12 h-12 text-brand-500/30 mb-6" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600">Loading Customer Logs...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="py-40 flex flex-col items-center justify-center">
                                <Activity className="w-12 h-12 text-neutral-800 mb-6" />
                                <h4 className="text-xl font-black text-neutral-600 tracking-widest uppercase">Archive Empty</h4>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {history.map((p: any) => (
                                    <div key={p._id} className="group bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between min-h-[280px] relative overflow-hidden">
                                        
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {p.status === "completed" ? (
                                                <div className="p-2 bg-success-500/10 text-success-400 rounded-xl" title="Visit Completed">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-danger-500/10 text-danger-400 rounded-xl" title="Visit Cancelled">
                                                    <XCircle className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center font-mono font-black text-lg text-brand-400 shadow-inner">
                                                    #{p.tokenNumber}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-1">Customer Entry</p>
                                                    <p className="text-xl font-black text-white truncate uppercase tracking-tight group-hover:text-brand-400 transition-colors">{p.name}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-3 text-neutral-400">
                                                    <Briefcase className="w-4 h-4 opacity-40" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Professional {p.agentId?.name || "Specialist"}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-neutral-500">
                                                    <FileText className="w-4 h-4 opacity-40 mt-0.5" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2">{p.description || "Routine Session Note"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-white/5 pt-6 mt-auto">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {p.completedAt ? new Date(p.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Archived"}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-700">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {p.completedAt ? new Date(p.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => copyTrackingId(p._id)}
                                                className="p-3 bg-white/5 border border-white/5 rounded-xl text-neutral-600 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/30 transition-all active:scale-90"
                                                title="Copy Matrix ID"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-800">Organization Management System //</p>
                </div>
            </div>
        </div>
    );
}
