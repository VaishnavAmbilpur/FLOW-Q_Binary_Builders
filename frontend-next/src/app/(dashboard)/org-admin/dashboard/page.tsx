"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import {
    Users, UserPlus, FileText, CheckCircle, Briefcase, Power, Activity,
    QrCode, Clock, X, Monitor, Key, Trash2, Shield, Calendar,
    ChevronRight, MapPin, Search, Plus, ShieldCheck, Mail, Lock, Settings
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Form states
    const [agentForm, setAgentForm] = useState({ name: "", email: "", serviceCategory: "", password: "" });
    const [operatorForm, setOperatorForm] = useState({ name: "", email: "", password: "", assignedAgents: [] });

    // Lists
    const [agents, setAgents] = useState<any[]>([]);
    const [operators, setOperators] = useState<any[]>([]);
    const [revealedIds, setRevealedIds] = useState<string[]>([]);
    const [editingAssignmentOp, setEditingAssignmentOp] = useState<any>(null);

    // Scheduling State
    const [editingScheduleAgent, setEditingScheduleAgent] = useState<any>(null);
    const [scheduleForm, setScheduleForm] = useState<any[]>([]);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const meRes = await api.get("/organizations/info");
            const userData = meRes.data;

            if (userData.role !== "ORG_ADMIN") {
                router.push("/login");
                return;
            }
            setAdmin(userData);

            const staffRes = await api.get("/organizations/staff");
            const allStaff = staffRes.data || [];
            const agentsList = allStaff.filter((s: any) => s.role === "AGENT");
            const operatorsList = allStaff.filter((s: any) => s.role === "OPERATOR");
            setAgents(agentsList);
            setOperators(operatorsList);

        } catch (err: any) {
            console.error("Dashboard Load Error:", err);
            if (err.response?.status === 401) {
                router.push("/login");
            } else {
                showMsg("Failed to load dashboard data. Please refresh.", "error");
            }
        }
    }

    const handleAddAgent = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/organizations/staff/agent", agentForm);
            showMsg("Agent Added Successfully", "success");
            setAgentForm({ name: "", email: "", serviceCategory: "", password: "" });
            loadAdminData();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Failed to add agent", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddOperator = async (e: any) => {
        e.preventDefault();
        if (operatorForm.assignedAgents.length === 0) {
            showMsg("Select at least one agent first!", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post("/organizations/staff/operator", operatorForm);
            showMsg("Operator Added Successfully", "success");
            setOperatorForm({ name: "", email: "", password: "", assignedAgents: [] });
            loadAdminData();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Failed to add operator", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAgentSelection = (id: string) => {
        setOperatorForm(prev => ({
            ...prev,
            assignedAgents: [id] as any
        }));
    };

    const handleToggleReveal = (id: string) => {
        setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDeleteStaff = async (id: string, name: string) => {
        setLoading(true);
        try {
            await api.delete(`/organizations/staff/${id}`);
            showMsg(`Removed: ${name}`, "success");
            loadAdminData();
        } catch (err) {
            showMsg("Removal Failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSchedule = (agent: any) => {
        setEditingScheduleAgent(agent);
        const currentSchedule = agent.schedule || [];
        const initialForm = daysOfWeek.map(day => {
            const found = currentSchedule.find((s: any) => s.day === day);
            return { day, startTime: found?.startTime || "", endTime: found?.endTime || "" };
        });
        setScheduleForm(initialForm);
    };

    const handleScheduleChange = (index: number, field: string, val: string) => {
        const updated = [...scheduleForm];
        updated[index] = { ...updated[index], [field]: val };
        setScheduleForm(updated);
    };

    const handleSaveSchedule = async () => {
        setLoading(true);
        try {
            const finalSchedule = scheduleForm.filter(s => s.startTime && s.endTime);
            await api.put(`/organizations/staff/${editingScheduleAgent._id}/schedule`, { schedule: finalSchedule });
            showMsg("Schedule Updated", "success");
            setEditingScheduleAgent(null);
            loadAdminData();
        } catch (err) {
            showMsg("Sync Failure", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAssignment = async (opId: string, agentId: string) => {
        try {
            await api.put(`/organizations/staff/${opId}/assign`, { agentId });
            showMsg("Agent Assigned", "success");
            setEditingAssignmentOp(null);
            loadAdminData();
        } catch (err) {
            showMsg("Reassignment Failure", "error");
        }
    };

    function showMsg(text: string, type: string) {
        setMsg(text);
        setTimeout(() => setMsg(""), 4000);
    }

    if (!admin) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">


            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-success-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-12 relative z-10">

                {/* Sub-Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-down">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
                            <Activity className="w-6 h-6 md:w-8 md:h-8 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 italic uppercase decoration-brand-500/30 underline-offset-4">Admin Dashboard</h1>
                            <p className="text-neutral-100 text-[10px] font-black uppercase tracking-[0.4em]">{admin.organizationId?.name || "Organization"} <span className="mx-2 text-neutral-800">/</span> Control Center</p>
                        </div>
                    </div>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-fade-up">
                    {[
                        { label: "Active Agents", value: agents.length, icon: <Activity className="w-5 h-5" />, color: "text-brand-400 bg-brand-500/5 border-brand-500/20" },
                        { label: "Operators", value: operators.length, icon: <Users className="w-5 h-5" />, color: "text-success-400 bg-success-500/5 border-success-500/20" },
                        { label: "Queue Load", value: "84%", icon: <Activity className="w-5 h-5" />, color: "text-info-400 bg-info-500/5 border-info-500/20" },
                        { label: "System Status", value: "Live", icon: <ShieldCheck className="w-5 h-5" />, color: "text-warning-400 bg-warning-500/5 border-warning-500/20" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative bg-white/[0.03] border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 opacity-40 group-hover:opacity-100 transition-opacity translate-y-[-2px]">{icon}</div>
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 font-mono text-white">{value.toString().padStart(2, '0')}</span>
                            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-neutral-100">{label}</p>
                        </div>
                    ))}
                </div>

                {msg && (
                    <div className="mb-8 p-5 rounded-[2rem] bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black uppercase tracking-widest animate-fade-up flex items-center justify-center gap-3 text-[10px] backdrop-blur-xl">
                        <CheckCircle className="w-4 h-4" /> {msg}
                    </div>
                )}

                <div className="space-y-10">
                    {/* ROW 1: ENROLLMENT FORMS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                        {/* SECTION: AGENT ENROLLMENT */}
                        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl relative overflow-hidden animate-fade-up">
                            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-4 mb-8">
                                <Plus className="w-5 h-5 text-brand-400" />
                                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase tracking-[0.2em]">Add New Agent</h2>
                            </div>

                            <form onSubmit={handleAddAgent} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Agent Name</label>
                                        <input
                                            placeholder="e.g. Alex Ledger"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={agentForm.name}
                                            onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Service Category</label>
                                        <input
                                            placeholder="e.g. Cardiology"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={agentForm.serviceCategory}
                                            onChange={(e) => setAgentForm({ ...agentForm, serviceCategory: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="agent@organization.com"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={agentForm.email}
                                            onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Password</label>
                                        <input
                                            type="password"
                                            placeholder="********"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px] font-mono"
                                            value={agentForm.password}
                                            onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-5 mt-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : "Add Agent"}
                                </button>
                            </form>
                        </div>

                        {/* SECTION: OPERATOR ENROLLMENT */}
                        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl relative overflow-hidden animate-fade-up delay-100">
                            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-success-600/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-4 mb-8">
                                <Plus className="w-5 h-5 text-success-400" />
                                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase tracking-[0.2em]">Add New Operator</h2>
                            </div>

                            <form onSubmit={handleAddOperator} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Staff Name</label>
                                        <input
                                            placeholder="e.g. John Matrix"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={operatorForm.name}
                                            onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider ml-5 italic">Work Email</label>
                                        <input
                                            type="email"
                                            placeholder="staff@organization.com"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={operatorForm.email}
                                            onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-neutral-100 uppercase tracking-[0.3em] ml-5">Password</label>
                                    <input
                                        type="password"
                                        placeholder="********"
                                        className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-xs font-mono"
                                        value={operatorForm.password}
                                        onChange={(e) => setOperatorForm({ ...operatorForm, password: e.target.value })}
                                        required
                                    />
                                </div>

                                 <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-100 uppercase tracking-[0.3em] ml-5">Assign Agent</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {agents.map((d) => (
                                            <button
                                                key={d._id}
                                                type="button"
                                                onClick={() => handleAgentSelection(d._id)}
                                                className={`p-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${operatorForm.assignedAgents.includes(d._id as any) ? "bg-white text-black border-white shadow-xl scale-105" : "bg-white/5 border-white/5 text-neutral-100 hover:border-white/20"}`}
                                            >
                                                {d.name.split(' ').pop()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-5 mt-2 rounded-2xl bg-success-600 hover:bg-success-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-success-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : "Add Operator"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ROW 2: ACTIVE LISTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                        {/* SECTION: AGENT LIST */}
                        <div className="space-y-4 animate-fade-up delay-200">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 px-6 italic">Active Agents</h3>
                            <div className="space-y-3">
                                {agents.length === 0 ? (
                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl text-neutral-200 font-bold uppercase tracking-widest text-[9px]">No staff members found</div>
                                ) : (
                                    agents.map((agent) => (
                                        <div key={agent._id} className="group bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all backdrop-blur-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                     <div className="min-w-0">
                                                        <h4 className="text-sm font-black truncate text-white">{agent.name}</h4>
                                                        <p className="text-[8px] font-black text-neutral-200 uppercase tracking-widest">{agent.serviceCategory}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => handleToggleReveal(agent._id)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-500 hover:text-white transition-all" title="Reveal Info"><Key className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleOpenSchedule(agent)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-info-500 hover:text-white transition-all" title="Manage Schedule"><Clock className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteStaff(agent._id, agent.name)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-danger-500 hover:text-white transition-all text-danger-500 hover:border-danger-500" title="Delete Agent"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                             {revealedIds.includes(agent._id) && (
                                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-fade-down">
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-100 uppercase tracking-widest mb-1">Email</p>
                                                        <p className="text-[10px] font-bold text-neutral-300 truncate">{agent.email}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Password</p>
                                                        <p className="text-[10px] font-mono font-bold text-white uppercase">{agent.creationPassword || "Encrypted"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SECTION: OPERATOR LIST */}
                        <div className="space-y-4 animate-fade-up delay-300">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 px-6 italic">Active Operators</h3>
                            <div className="space-y-3">
                                {operators.length === 0 ? (
                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl text-neutral-200 font-bold uppercase tracking-widest text-[9px]">No operators found</div>
                                ) : (
                                    operators.map((op) => (
                                        <div key={op._id} className="group bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all backdrop-blur-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 bg-success-500/10 border border-success-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-success-500 group-hover:text-white transition-all">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                     <div className="min-w-0">
                                                        <h4 className="text-sm font-black truncate text-white">{op.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] font-black text-neutral-200 uppercase tracking-widest">Support Node</span>
                                                            {op.assignedAgents?.length > 0 && (
                                                                <span className="text-[7px] font-black bg-success-500/20 text-success-400 px-1.5 py-0.5 rounded-full border border-success-500/30">ASSIGNED</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => setEditingAssignmentOp(op)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-success-500 hover:text-white transition-all font-bold" title="Update Assignment"><UserPlus className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleToggleReveal(op._id)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-500 hover:text-white transition-all" title="Recall Info"><Key className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteStaff(op._id, op.name)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-danger-500 hover:text-white transition-all text-danger-500 hover:border-danger-500" title="Terminate Node"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                             {revealedIds.includes(op._id) && (
                                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-fade-down">
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-100 uppercase tracking-widest mb-1">Email</p>
                                                        <p className="text-[10px] font-bold text-neutral-300 truncate">{op.email}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Password</p>
                                                        <p className="text-[10px] font-mono font-bold text-white uppercase">{op.creationPassword || "Encrypted"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: SCHEDULE */}
            {editingScheduleAgent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-[#0a0a0a] w-full max-w-2xl rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                             <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Work Schedule</h2>
                                <p className="text-[10px] font-black text-neutral-100 uppercase tracking-[0.4em] mt-1">Professional {editingScheduleAgent.name}</p>
                            </div>
                            <button onClick={() => setEditingScheduleAgent(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-neutral-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            {scheduleForm.map((dayObj, i) => (
                                <div key={dayObj.day} className="grid grid-cols-3 gap-6 items-center bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5 hover:border-brand-500/30 transition-all">
                                    <div className="font-black text-[10px] uppercase tracking-widest text-neutral-100 pl-2">{dayObj.day}</div>
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-neutral-100 uppercase tracking-widest">START</p>
                                        <input
                                            type="time"
                                            value={dayObj.startTime}
                                            onChange={(e) => handleScheduleChange(i, "startTime", e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white focus:border-brand-500/50 outline-none font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-neutral-100 uppercase tracking-widest">END</p>
                                        <input
                                            type="time"
                                            value={dayObj.endTime}
                                            onChange={(e) => handleScheduleChange(i, "endTime", e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white focus:border-brand-500/50 outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                            <button onClick={() => setEditingScheduleAgent(null)} className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Back</button>
                            <button onClick={handleSaveSchedule} disabled={loading} className="px-10 py-4 rounded-[1.5rem] bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-600/20 transition-all active:scale-95">Save Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ASSIGNMENT */}
            {editingAssignmentOp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-[#0a0a0a] w-full max-w-md rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]">
                         <div className="px-10 py-10 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Assign Agent</h2>
                            <p className="text-[10px] font-black text-neutral-100 uppercase tracking-[0.4em] mt-1">Reassigning {editingAssignmentOp.name}</p>
                        </div>

                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                            {agents.map(d => (
                                <button
                                    key={d._id}
                                    onClick={() => handleUpdateAssignment(editingAssignmentOp._id, d._id)}
                                    className={`w-full flex items-center gap-5 p-6 rounded-[2rem] border transition-all text-left ${editingAssignmentOp.assignedAgents?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'bg-brand-600 text-white border-brand-500 shadow-2xl' : 'bg-white/5 border-white/5 text-neutral-100 hover:border-white/20'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${editingAssignmentOp.assignedAgents?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'bg-white/20' : 'bg-white/5'}`}>
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-black truncate">{d.name}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${editingAssignmentOp.assignedAgents?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'text-white/60' : 'text-neutral-700'}`}>{d.serviceCategory}</p>
                                    </div>
                                    {editingAssignmentOp.assignedAgents?.some((ad: any) => ad._id === d._id || ad === d._id) && (
                                        <CheckCircle className="w-5 h-5 ml-auto text-white" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex justify-end">
                            <button onClick={() => setEditingAssignmentOp(null)} className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
