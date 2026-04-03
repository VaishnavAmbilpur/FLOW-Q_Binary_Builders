"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import Loader from "@/components/Loader";
import { 
    Search, Calendar, Filter, User, Stethoscope, 
    CheckCircle, XCircle, Clock, ChevronDown, 
    ArrowUpDown, FileText, Download, Activity, History as HistoryIcon
} from "lucide-react";

export default function PatientHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filter states
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [date, setDate] = useState("");

    const loadHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status) params.status = status;
            if (doctorId) params.doctorId = doctorId;
            if (date) params.date = date;

            const res = await api.get("/queue/history/", { params });
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    }, [search, status, doctorId, date]);

    const loadDoctors = async () => {
        try {
            const res = await api.get("/admin/staff");
            setDoctors(res.data.filter((s:any) => s.role === "DOCTOR"));
        } catch (err) {
            console.error("Failed to load doctors", err);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadHistory();
        }, 500);
        return () => clearTimeout(timeout);
    }, [loadHistory]);

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">
            

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-20 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-down">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3 hover:rotate-0 transition-all duration-700">
                            <HistoryIcon className="w-6 h-6 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter italic underline decoration-brand-500/20 underline-offset-4">Patient History</h1>
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em]">Visit Logs <span className="mx-2 text-neutral-800">/</span> Records</p>
                        </div>
                    </div>
                </div>

                {/* Intelligence Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up">
                    <div className="lg:col-span-1 relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input 
                            placeholder="SEARCH BY NAME..."
                            className="w-full bg-white/[0.03] border border-white/5 p-4 pl-12 rounded-2xl text-[9px] font-black uppercase tracking-widest placeholder-neutral-700 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <select 
                            className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest outline-none transition-all focus:border-brand-500/50 appearance-none cursor-pointer text-neutral-400"
                            value={doctorId}
                            onChange={(e) => setDoctorId(e.target.value)}
                        >
                            <option value="">ALL DOCTORS</option>
                            {doctors.map(d => <option key={d._id} value={d._id}>{d.name.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none group-hover:text-white transition-colors" />
                    </div>
                    <div className="relative group">
                        <select 
                            className="w-full bg-white/[0.03] border border-white/5 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest outline-none transition-all focus:border-brand-500/50 appearance-none cursor-pointer text-neutral-400"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">ALL STATUSES</option>
                            <option value="completed">COMPLETED</option>
                            <option value="cancelled">CANCELLED</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none group-hover:text-white transition-colors" />
                    </div>
                    <div className="relative group">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                        <input 
                            type="date"
                            className="w-full bg-white/[0.03] border border-white/5 p-4 pl-12 rounded-2xl text-[9px] font-black uppercase tracking-widest outline-none transition-all focus:border-brand-500/50 text-neutral-400 cursor-pointer"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* History Registry */}
                <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-4 backdrop-blur-3xl relative overflow-hidden animate-fade-up">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center grayscale opacity-50">
                            <Activity className="w-16 h-16 text-brand-400 animate-pulse mb-6" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Loading History...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-40 flex flex-col items-center justify-center grayscale opacity-20">
                            <HistoryIcon className="w-20 h-20 text-neutral-600 mb-8" />
                            <p className="text-xl font-black uppercase tracking-widest">No matching records found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-separate border-spacing-y-4 px-6 md:px-10">
                                <thead className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.4em]">
                                    <tr>
                                        <th className="pb-6 pl-10">PATIENT</th>
                                        <th className="pb-6">STATUS</th>
                                        <th className="pb-6">DOCTOR</th>
                                        <th className="pb-6">DATE & TIME</th>
                                        <th className="pb-6 text-right pr-10">TOKEN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((patient) => (
                                        <tr key={patient._id} className="group transition-all duration-500 hover:z-20 relative">
                                            <td className="bg-white/[0.02] border-y border-l border-white/5 p-5 rounded-l-2xl group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500">
                                                <div className="flex items-center gap-4 text-neutral-300">
                                                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-black tracking-tight group-hover:text-brand-400 transition-colors uppercase">{patient.name}</h4>
                                                        <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mt-0.5">Visit ID {patient._id.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-white/[0.02] border-y border-white/5 p-5 group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500">
                                                <div className="flex items-center gap-3">
                                                    {patient.status === 'completed' ? (
                                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-success-500/10 border border-success-500/20 text-success-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                                                            <CheckCircle className="w-3 h-3" /> COMPLETED
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-danger-500/10 border border-danger-500/20 text-danger-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                                                            <XCircle className="w-3 h-3" /> CANCELLED
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="bg-white/[0.02] border-y border-white/5 p-5 group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500">
                                                <div className="flex items-center gap-2 group-hover:gap-4 text-neutral-400 group-hover:text-white transition-all duration-300">
                                                    <Stethoscope className="w-3.5 h-3.5 text-brand-500/50" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-tight italic">{patient.doctorId?.name}</p>
                                                        <p className="text-[7px] font-black text-neutral-800 uppercase tracking-widest">{patient.doctorId?.specialization}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-white/[0.02] border-y border-white/5 p-5 group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tabular-nums">{new Date(patient.completedAt || patient.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tabular-nums">{new Date(patient.completedAt || patient.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-white/[0.02] border-y border-r border-white/5 p-8 rounded-r-[2rem] group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-500 text-right pr-10">
                                                <span className="text-4xl font-black font-mono tracking-tighter text-white/20 group-hover:text-brand-500 transition-colors">{patient.tokenNumber.toString().padStart(2, '0')}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Insight */}
                {!loading && history.length > 0 && (
                    <div className="mt-12 flex items-center justify-between px-10 animate-fade-up animate-delay-300">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                            <p className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.5em]">Showing {history.length} Records</p>
                        </div>
                        <button className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all active:scale-95">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
