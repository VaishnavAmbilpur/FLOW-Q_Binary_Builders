"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import {
    AlertCircle, CheckCircle2, User, Phone, FileText, ArrowRight,
    UserPlus, Clock, Stethoscope, X, Activity, ChevronRight
} from "lucide-react";

export default function KioskPage() {
    const params = useParams();
    const router = useRouter();
    const hospitalId = params.hospitalId;

    const [doctors, setDoctors] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loadingDocs, setLoadingDocs] = useState(true);

    // Form state
    const [formData, setFormData] = useState({ name: "", phone: "", description: "" });
    const [submitLoading, setSubmitLoading] = useState(false);

    // Result state
    const [tokenResult, setTokenResult] = useState(null);
    const [error, setError] = useState("");

    const loadDoctors = async () => {
        try {
            setLoadingDocs(true);
            const res = await api.get(`/kiosk/${hospitalId}/doctors`);
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDocs(false);
        }
    };

    useEffect(() => {
        if (!hospitalId) return;
        loadDoctors();

        // Poll every 30 seconds for wait time updates
        const interval = setInterval(() => {
            loadDoctors();
        }, 30000);

        return () => clearInterval(interval);
    }, [hospitalId]);

    const handleSelectDoctor = (doc: any) => {
        setSelectedDoc(doc);
        setTokenResult(null);
        setError("");
        setFormData({ name: "", phone: "", description: "" });
    };

    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError("");
        try {
            const res = await api.post(`/kiosk/${hospitalId}/enqueue`, {
                ...formData,
                doctorId: selectedDoc._id
            });

            if (res.data.success) {
                const { uniqueLinkId, tokenNumber } = res.data;
                setTokenResult(tokenNumber);
                loadDoctors(); // Refresh queues

                // Copy tracking link to clipboard
                const trackingLink = `${window.location.origin}/status/${uniqueLinkId}`;
                try {
                    await navigator.clipboard.writeText(trackingLink);
                    console.log("Tracking link copied to clipboard");
                } catch (clipErr) {
                    console.error("Failed to copy link:", clipErr);
                }

                // Redirect to live tracking link after 2 seconds
                setTimeout(() => {
                    router.push(`/status/${uniqueLinkId}`);
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to check in. Please see reception.");
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans relative overflow-hidden selection:bg-brand-500/30">

            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-10 py-20 relative z-10 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-20 animate-fade-down">
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl mx-auto mb-8 transform rotate-3">
                        <MonitorSmartphone className="w-10 h-10 text-brand-400" />
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-4">Check-In Terminal</h1>
                    <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.4em]">Self-Service Check-In <span className="mx-2 text-neutral-800">/</span> {hospitalId ? "Clinic Access" : "Hospital"}</p>
                </div>

                {tokenResult ? (
                    /* SUCCESS SCREEN */
                    <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[4rem] p-16 text-center backdrop-blur-3xl shadow-2xl animate-fade-up relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="w-24 h-24 bg-success-500/10 border border-success-500/20 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-success-400 animate-pulse">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>

                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">Check-In Complete</h2>
                        <p className="text-neutral-500 text-base sm:text-lg font-medium mb-12">Please proceed to the waiting area.</p>

                        <div className="bg-black/40 border border-white/5 rounded-[3rem] p-12 mb-10 shadow-inner relative group transition-all hover:bg-black/60">
                            <p className="text-[12px] font-bold uppercase tracking-[0.4em] text-neutral-500 mb-4 group-hover:text-neutral-400 transition-colors">Your Token Number</p>
                            <p className="text-[6rem] sm:text-[9.5rem] font-black leading-none text-white tracking-widest font-mono group-hover:text-brand-400 group-hover:scale-105 transition-all duration-500">{tokenResult}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-neutral-500 font-bold text-[11px] uppercase tracking-widest bg-white/5 py-4 rounded-2xl border border-white/5">
                            <Stethoscope className="w-4 h-4 text-brand-400" /> Doctor: <span className="text-white">{selectedDoc?.name}</span>
                        </div>

                        <p className="mt-12 text-[9px] font-black uppercase tracking-[0.5em] text-neutral-700 animate-pulse">Terminal will reset internally in 10s</p>
                    </div>
                ) : selectedDoc ? (
                    /* FORM SCREEN */
                    <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl animate-fade-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-brand-600/10 blur-[100px] rounded-full pointer-events-none" />

                        <button
                            onClick={() => setSelectedDoc(null)}
                            className="mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-all flex items-center gap-3"
                        >
                            <X className="w-4 h-4" /> Back to Doctors
                        </button>

                        <div className="flex items-center gap-8 mb-12 p-8 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-md">
                            <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/20 rounded-[2rem] flex items-center justify-center flex-shrink-0">
                                <Stethoscope className="w-10 h-10 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">{selectedDoc.name}</h2>
                                <p className="text-neutral-500 font-bold uppercase tracking-wider text-[11px] mb-3">{selectedDoc.specialization}</p>
                                <div className="flex items-center gap-3 text-success-400 font-bold text-[11px] uppercase tracking-widest bg-success-500/10 px-4 py-2 rounded-xl border border-success-500/20 w-fit">
                                    <Clock className="w-4 h-4" /> {selectedDoc.estimatedWaitMins} min estimated wait
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-10 p-6 bg-danger-500/10 border border-danger-500/30 rounded-[2rem] flex items-center gap-4 animate-shake text-danger-400 font-black uppercase tracking-widest text-[10px]">
                                <AlertCircle className="w-6 h-6" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-3">
                                <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider ml-6">Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-800 transition-colors group-focus-within:text-brand-400" />
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange}
                                        className="w-full pl-22 pr-8 py-6 sm:py-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 text-xl sm:text-2xl text-white outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-800"
                                        placeholder="Full Name..." />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wider ml-6">Contact Mobile</label>
                                <div className="relative group">
                                    <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-800 transition-colors group-focus-within:text-brand-400" />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="w-full pl-22 pr-8 py-6 sm:py-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 text-xl sm:text-2xl text-white outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all placeholder:text-neutral-800"
                                        placeholder="Phone Number..." />
                                </div>
                            </div>

                            <button
                                disabled={submitLoading}
                                type="submit"
                                className="w-full py-6 sm:py-8 mt-4 rounded-[2.5rem] bg-brand-600 hover:bg-brand-500 shadow-2xl shadow-brand-600/20 text-white font-black text-lg sm:text-xl uppercase tracking-[0.4em] flex items-center justify-center gap-6 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitLoading ? <Activity className="w-8 h-8 animate-spin" /> : "Check-In"}
                                <ArrowRight className="w-8 h-8" />
                            </button>
                        </form>
                    </div>
                ) : (
                    /* DOCTOR SELECTION SCREEN */
                    <div className="w-full flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-12 text-neutral-500 animate-fade-up">
                            <UserPlus className="w-6 h-6 text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Select a Doctor</span>
                        </div>

                        {doctors.length === 0 ? (
                            <div className="p-20 text-center bg-white/5 border border-white/5 rounded-[4rem] backdrop-blur-3xl">
                                <p className="text-xl text-neutral-600 font-bold uppercase tracking-widest">No active doctors found</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 w-full animate-fade-up delay-100">
                                {doctors.map((doc: any) => (
                                    <button
                                        key={doc._id}
                                        onClick={() => handleSelectDoctor(doc)}
                                        className="group bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-brand-500/40 rounded-[3.5rem] p-10 transition-all duration-500 backdrop-blur-xl flex flex-col items-center text-center shadow-2xl hover:-translate-y-4"
                                    >
                                        <div className="w-24 h-24 bg-brand-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/30 group-hover:scale-110 transition-all duration-500">
                                            <span className="text-4xl font-black">{doc.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">{doc.name}</h3>
                                        <p className="text-[11px] font-bold text-brand-400 group-hover:text-brand-300 transition-colors uppercase tracking-wider mb-10">{doc.specialization}</p>

                                        <div className="w-full flex items-center justify-between border-t border-white/5 pt-8">
                                            <div className="text-left">
                                                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Queue Size</p>
                                                <p className="font-mono text-xl font-black text-white">{doc.currentQueueLength} Patients</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider mb-1">Wait Time</p>
                                                <p className="font-mono text-xl font-black text-success-400">{doc.estimatedWaitMins} Min</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const MonitorSmartphone = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="10" height="14" x="11" y="3" rx="2" ry="2" /><path d="M18 13v.01" /><path d="M14 17h4" /><path d="M7 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" /><path d="M7 21h8" /><path d="M9 17v4" /><path d="M13 17v4" />
    </svg>
);
