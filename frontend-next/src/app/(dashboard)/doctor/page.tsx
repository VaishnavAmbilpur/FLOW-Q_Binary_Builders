"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { io } from "socket.io-client";
import {
    Activity, ArrowLeft, ArrowUp, Calendar, CheckCircle, Clock, FileText, Mail, MonitorSmartphone, Power, RefreshCw, Settings, Shield, Stethoscope, TrendingUp, User, Users, X
} from "lucide-react";

export default function DoctorDashboard() {
    const [doctor, setDoctor] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    // Completion state
    const [completingPatient, setCompletingPatient] = useState<any>(null);
    const [nextVisitDate, setNextVisitDate] = useState("");
    const [msg, setMsg] = useState("");
    const [avgTime, setAvgTime] = useState("");
    const [pauseMessage, setPauseMessage] = useState("");
    const router = useRouter();

    async function loadDoctor() {
        try {
            const meRes = await api.get("/auth/me");
            const userData = meRes.data;

            if (userData.role !== "DOCTOR" && userData.role !== "HOSPITAL_ADMIN") {
                router.push("/reception");
                return;
            }

            const res = await api.get("/doctors/info");
            setDoctor(res.data);
            setAvgTime(res.data.avgConsultationTime?.toString() || "5");
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/login");
        }
    }

    const loadQueue = useCallback(async () => {
        if (!doctor?._id) return;
        try {
            const res = await api.get(`/queue/${doctor._id}`);
            setQueue(res.data);
        } catch (err) {
            console.error("Load queue error", err);
        }
    }, [doctor?._id]);

    const loadSummary = useCallback(async () => {
        if (!doctor?._id) return;
        try {
            const res = await api.get(`/queue/summary/today?doctorId=${doctor._id}`);
            setSummary(res.data);
        } catch (err) {
            console.error("Load summary error", err);
        }
    }, [doctor?._id]);

    useEffect(() => { loadDoctor(); }, []);

    useEffect(() => {
        if (!doctor?._id) return;
        loadQueue();
        loadSummary();

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
            transports: ["websocket"],
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log("Socket connected to hospital stream");
        });

        socket.on("queueUpdated", () => {
            console.log("Queue Update Received!");
            loadQueue();
            loadSummary();
        });

        return () => { socket.disconnect(); };
    }, [doctor?._id]);

    async function updateAvgTime() {
        try {
            await api.put("/doctors/update-avg-time", { avgTime: Number(avgTime) });
            setDoctor((prev: any) => ({ ...prev, avgConsultationTime: Number(avgTime) }));
            showMsg("Average Consultation Time Updated!");
        } catch (err) { console.error(err); }
    }

    async function changeAvailability(state: string) {
        try {
            await api.put("/doctors/availability", {
                availability: state,
                pauseMessage: state === "Not Available" ? pauseMessage : ""
            });
            setDoctor((prev: any) => ({
                ...prev,
                availability: state,
                pauseMessage: state === "Not Available" ? pauseMessage : ""
            }));
            if (state === "Available") setPauseMessage("");
            showMsg(`Availability changed to: ${state}`);
        } catch (err) { console.error(err); }
    }

    async function prioritisePatient(patientId: string) {
        try {
            await api.put(`/queue/prioritise/${patientId}`);
            showMsg("Patient moved to top of queue");
            loadQueue();
        } catch (err) {
            showMsg("Error prioritising patient");
        }
    }

    async function handleCompletePatient() {
        if (!completingPatient) return;
        try {
            await api.put(`/queue/complete/${completingPatient._id}`, {
                nextVisitDate: nextVisitDate || null
            });
            setCompletingPatient(null);
            setNextVisitDate("");
            loadQueue();
            loadSummary();
            showMsg("Patient visit completed!");
        } catch (err) { console.error(err); }
    }

    async function cancelPatient(patientId: string) {
        if (!confirm("Are you sure you want to cancel this patient's visit? This action is irreversible.")) return;
        try {
            await api.put(`/queue/cancel/${patientId}`);
            showMsg("Patient Visit Cancelled");
            loadQueue();
            loadSummary();
        } catch (err) {
            console.error(err);
            showMsg("Error cancelling visit");
        }
    }

    function showMsg(text: string) {
        setMsg(text);
        setTimeout(() => setMsg(""), 3000);
    }

    if (!doctor) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-hidden transition-colors duration-300 selection:bg-brand-500/30">

            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-down">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
                            <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-brand-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white line-clamp-1 uppercase italic">Doctor Dashboard</h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border animate-pulse ${doctor.availability === "Available"
                                    ? "bg-success-500/10 border-success-500/30 text-success-400"
                                    : "bg-danger-500/10 border-danger-500/30 text-danger-400"}`}>
                                    {doctor.availability}
                                </span>
                            </div>
                            <p className="text-neutral-500 text-[10px] sm:text-sm font-black uppercase tracking-[0.2em]">Dr. {doctor.name} <span className="mx-2 text-neutral-800">/</span> {doctor.specialization}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <button
                            onClick={loadQueue}
                            className="p-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <div className="h-6 w-px bg-white/10 mx-0.5" />
                        <button
                            onClick={() => router.push("/login")}
                            className="flex items-center gap-2.5 px-4 py-2 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                        >
                            <Power className="w-3.5 h-3.5" /> End Shift
                        </button>
                    </div>
                </div>

                {msg && (
                    <div className="mb-8 p-5 rounded-[2rem] bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black uppercase tracking-widest animate-fade-up flex items-center gap-3 text-[10px] shadow-2xl backdrop-blur-xl">
                        <CheckCircle className="w-4 h-4" /> {msg}
                    </div>
                )}

                {/* Today's Summary Hub */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-up delay-100">
                    {[
                        {
                            label: "Total Seen", value: summary?.completed ?? "00",
                            icon: <CheckCircle className="w-5 h-5 text-success-400" />,
                            color: "text-success-400 border-success-500/20 bg-success-500/5"
                        },
                        {
                            label: "In Queue", value: (summary?.waiting ?? 0).toString().padStart(2, '0'),
                            icon: <Users className="w-5 h-5 text-brand-400" />,
                            color: "text-brand-400 border-brand-500/20 bg-brand-500/5"
                        },
                        {
                            label: "Avg Consult", value: summary?.avgConsultTime ? `${summary.avgConsultTime.toString().padStart(2, '0')}m` : "--",
                            icon: <Clock className="w-5 h-5 text-info-400" />,
                            color: "text-info-400 border-info-500/20 bg-info-500/5"
                        },
                        {
                            label: "Busiest Hr", value: summary?.busiestHour ?? "--",
                            icon: <TrendingUp className="w-5 h-5 text-warning-400" />,
                            color: "text-warning-400 border-warning-500/20 bg-warning-500/5"
                        },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative bg-white/[0.03] border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 font-mono">{value}</span>
                            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-neutral-400">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-10">

                    {/* Operational Settings */}
                    <div className="lg:col-span-4 space-y-8 animate-fade-up delay-200">

                        {/* Availability Command Center */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[60px] rounded-full pointer-events-none" />

                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="w-5 h-5 text-brand-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Queue Command</h3>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => changeAvailability("Available")}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-3 ${doctor.availability === "Available"
                                        ? "border-success-500/50 bg-success-500/10 text-success-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
                                        : "border-white/5 bg-white/5 text-neutral-600 hover:border-white/20"}`}
                                >
                                    <Activity className="w-4 h-4" /> Resumed
                                </button>
                                <button
                                    onClick={() => changeAvailability("Not Available")}
                                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-3 ${doctor.availability === "Not Available"
                                        ? "border-danger-500/50 bg-danger-500/10 text-danger-400 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                                        : "border-white/5 bg-white/5 text-neutral-600 hover:border-white/20"}`}
                                >
                                    <Power className="w-4 h-4" /> Paused
                                </button>
                            </div>

                            {doctor.availability === "Not Available" && (
                                <div className="mt-8 pt-8 border-t border-white/5 animate-fade-down">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-4 block ml-1">PA Announcement</label>
                                    <div className="flex flex-col gap-3">
                                        <input
                                            value={pauseMessage}
                                            onChange={(e) => setPauseMessage(e.target.value)}
                                            placeholder="Estimated return time..."
                                            className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-white placeholder-neutral-700 focus:border-brand-500/50 outline-none transition-all text-sm font-bold"
                                        />
                                        <button
                                            onClick={() => changeAvailability("Not Available")}
                                            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                                        >
                                            Broadcast
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Flow Cadence */}
                        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-8">
                                <Clock className="w-5 h-5 text-info-400" />
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400">Consultation Timing</h3>
                            </div>
                            <div className="bg-black/20 rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center">
                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-5xl font-black font-mono text-brand-400">{doctor.avgConsultationTime || "05"}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">min avg</span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full">
                                    <input
                                        type="number" min="1"
                                        value={avgTime}
                                        onChange={(e) => setAvgTime(e.target.value)}
                                        className="flex-1 px-4 py-3 rounded-xl text-center font-black text-white bg-white/5 border border-white/5 focus:border-brand-500/50 outline-none text-sm"
                                        placeholder="Min"
                                    />
                                    <button
                                        onClick={updateAvgTime}
                                        className="flex-[2] py-3 rounded-xl font-black bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all text-[10px] uppercase tracking-widest active:scale-95"
                                    >
                                        Save Timing
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Profile Hub */}
                        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-8 backdrop-blur-3xl">
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                                        <Mail className="w-4 h-4 text-brand-400" />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-0.5 italic">Admin Email</p>
                                        <p className="text-xs font-bold text-neutral-300 truncate">{doctor.email}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-info-500/10 flex items-center justify-center border border-info-500/20">
                                        <Shield className="w-4 h-4 text-info-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-0.5 italic">Permissions</p>
                                        <p className="text-xs font-bold text-neutral-300">Advanced Practitioner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Stream Queue */}
                    <div className="lg:col-span-8 animate-fade-up delay-300">
                        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-8 shadow-2xl backdrop-blur-3xl min-h-[600px] flex flex-col">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/30 rounded-2xl flex items-center justify-center text-brand-400">
                                        <Users className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-white uppercase italic">Live Patient Queue</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{queue.length} Active in Queue</p>
                                    </div>
                                </div>
                            </div>

                            {queue.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="w-32 h-32 bg-white/5 rounded-[3rem] border border-white/5 flex items-center justify-center mb-6 animate-pulse">
                                        <Calendar className="w-12 h-12 text-neutral-800" />
                                    </div>
                                    <h4 className="text-xl font-black text-neutral-600">Pipeline Clear</h4>
                                    <p className="text-neutral-500 text-sm mt-1 max-w-[240px] font-medium">Ready for new arrivals. Check synchronization if needed.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {queue.map((p: any, idx: number) => (
                                        <div
                                            key={p._id}
                                            className={`group relative flex items-center gap-3 sm:gap-6 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 ${idx === 0
                                                ? "bg-brand-600/10 border-brand-500/50 shadow-[0_0_50px_rgba(99,102,241,0.1)] translate-x-1 sm:translate-x-2"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:translate-x-1"}`}
                                        >
                                            {/* Order Number */}
                                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center font-mono font-black text-xl md:text-2xl flex-shrink-0 relative overflow-hidden transition-transform duration-500 group-hover:scale-105 ${idx === 0
                                                ? "bg-brand-600 text-white shadow-2xl shadow-brand-600/40"
                                                : "bg-white/5 text-neutral-400 border border-white/5"}`}>
                                                {p.tokenNumber}
                                            </div>

                                            {/* Detailed Patient Card */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col mb-1">
                                                    <p className="text-base sm:text-lg font-black text-white truncate group-hover:text-brand-400 transition-colors uppercase tracking-tight">{p.name}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 italic">Assigned to Dr. {doctor.name}</p>
                                                    {idx === 0 && <span className="w-fit mt-1 px-1.5 py-0.5 bg-brand-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md animate-bounce">Active</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-black/20 px-3 py-1 rounded-full outline outline-1 outline-white/5">
                                                        <Clock className="w-3 h-3" />
                                                        ~{p.estimatedWait ?? (idx * (doctor.avgConsultationTime || 5))}m Wait
                                                    </div>
                                                    {p.notes && (
                                                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-info-400 bg-info-500/10 px-3 py-1 rounded-full outline outline-1 outline-info-500/20 max-w-[200px] truncate">
                                                            <FileText className="w-3 h-3" />
                                                            {p.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Precision Actions */}
                                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                                {idx > 0 && (
                                                    <button
                                                        onClick={() => prioritisePatient(p._id)}
                                                        className="p-3.5 rounded-2xl border border-warning-500/30 bg-warning-500/10 text-warning-400 hover:bg-warning-500/20 transition-all active:scale-90"
                                                        title="Matrix Priority Flow"
                                                    >
                                                        <ArrowUp className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {idx === 0 && (
                                                    <button
                                                        onClick={() => {
                                                            setCompletingPatient(p);
                                                            setNextVisitDate("");
                                                        }}
                                                        className="flex items-center gap-2.5 px-3.5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.5rem] bg-success-600 hover:bg-success-500 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-success-600/30 transition-all active:scale-95 group/btn"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:scale-110 transition-transform" />
                                                        <span className="hidden sm:inline">Commit Visit</span>
                                                        <span className="sm:hidden">Commit</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => cancelPatient(p._id)}
                                                    className="p-3.5 rounded-2xl border border-danger-500/30 bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-all active:scale-90"
                                                    title="Cancel Patient"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Commit Visit Overlay */}
            {completingPatient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral-950/80 backdrop-blur-3xl animate-fadeIn">
                    <div className="bg-neutral-900 w-full max-w-lg rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

                        <div className="px-10 py-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-brand-500/10 rounded-[2.5rem] border border-brand-500/20 flex items-center justify-center mb-8">
                                <Activity className="w-10 h-10 text-brand-400" />
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic">Complete Visit</h2>
                            <p className="text-neutral-400 font-black uppercase tracking-widest text-[10px] mb-10">Patient: <span className="text-brand-400 italic">{completingPatient.name}</span></p>

                            <div className="w-full space-y-6 text-left">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-5 block italic">Scheduled Return</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={nextVisitDate}
                                        onChange={(e) => setNextVisitDate(e.target.value)}
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-white/5 border border-white/10 text-white font-bold focus:border-brand-500/50 outline-none transition-all"
                                    />
                                    <p className="text-[10px] font-black italic text-neutral-500 px-5 text-center">
                                        System will auto-dispatch WhatsApp alerts 24h prior.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full mt-12">
                                <button
                                    onClick={() => setCompletingPatient(null)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-neutral-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all font-mono"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCompletePatient}
                                    className="px-8 py-4 rounded-2xl bg-success-600 hover:bg-success-500 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-success-600/20 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle className="w-4 h-4" /> Commit Matrix
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
