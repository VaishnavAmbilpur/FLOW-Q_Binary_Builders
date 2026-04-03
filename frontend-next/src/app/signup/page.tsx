"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, MonitorSmartphone, Activity, Shield, Users } from "lucide-react";

export default function Signup() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        hospitalName: "",
        email: "",
        password: ""
    });

    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            await api.post("/auth/signup", form);
            setMsg("Signup Successful 🎉 Redirecting...");
            setTimeout(() => router.push("/login"), 1000);
        } catch (err: any) {
            setMsg(err.response?.data?.message || "Signup failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-neutral-950 font-sans relative overflow-hidden transition-colors duration-300 selection:bg-brand-500/30">
            
            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-info-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="flex w-full relative z-10 flex-row-reverse">
                {/* LEFT SIDE: AUTH FORM (Actually right side now to keep variety) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 xl:px-20 py-10 border-l border-white/5">
                    <div className="w-full max-w-[380px] mx-auto">
                        
                        {/* Logo & Header */}
                        <div className="mb-6 text-center lg:text-left animate-fade-down">
                            <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                <ArrowLeft className="w-2.5 h-2.5" /> Back to Home
                            </Link>
                            
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-4 mx-auto lg:mx-0 transform rotate-3">
                                <MonitorSmartphone className="w-5 h-5 text-white" />
                            </div>
                            
                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                                Register <span className="text-brand-500">Hub.</span>
                            </h2>
                            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                                Global Hospital Onboarding
                            </p>
                        </div>

                        {msg && (
                            <div className={`mb-6 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest text-center animate-fade-up shadow-xl backdrop-blur-xl ${msg.includes('Successful') 
                                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' 
                                : 'bg-danger-500/10 border-danger-500/30 text-danger-400'}`}>
                                {msg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5 animate-fade-up delay-100">
                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Administrative Name</label>
                                <div className="relative group">
                                    <input
                                        name="name"
                                        placeholder="e.g. Dr. Arthur Ledger"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Facility Name</label>
                                <div className="relative group">
                                    <input
                                        name="hospitalName"
                                        placeholder="e.g. Ledger Clinical Research Center"
                                        value={form.hospitalName}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Professional Email</label>
                                <div className="relative group">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="admin@ledger-clinic.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Secure Credentials</label>
                                <div className="relative group">
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 mt-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Activity className="w-3.5 h-3.5 animate-spin" /> Provisioning...
                                    </>
                                ) : (
                                    "Create Clinical Hub"
                                )}
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4 animate-fade-up delay-200">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.3em]">Institutional Auth</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="animate-fade-up delay-300">
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`}
                                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] text-white font-bold text-[11px] transition-all active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4 shadow-lg" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Register with Workspace
                            </a>
                            
                            <div className="mt-6 text-center">
                                <span className="text-[9px] font-black text-neutral-800 uppercase tracking-widest">
                                    Member already? <Link href="/login" className="text-brand-500 hover:underline">Access Hub</Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: PRODUCT SHOWCASE */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 md:p-14">
                    <div className="absolute inset-0 bg-brand-600/5 backdrop-blur-[1px]" />
                    
                    <div className="relative z-10 max-w-sm space-y-8 animate-fade-right">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight underline decoration-info-500/50 underline-offset-8 italic">
                                Elevate your hospital's digital flow.
                            </h3>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                                Join thousands of healthcare providers leveraging the Architect Ledger system to eliminate congestion and maximize patient satisfaction.
                            </p>
                        </div>

                        {/* Testimonial / Statistic */}
                        <div className="bg-white/[0.03] border-l-4 border-brand-500 p-5 md:p-6 rounded-r-2xl backdrop-blur-md shadow-2xl">
                            <p className="text-white font-bold italic text-sm leading-relaxed mb-4">
                                "The precision of wait-time tracking transformed our clinic's reputation overnight. Simply world-class."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-black text-[10px] shadow-lg shadow-brand-500/20">
                                    SM
                                </div>
                                <div>
                                    <h4 className="font-black text-white text-[8px] uppercase tracking-widest">Dr. Sarah Mitchell</h4>
                                    <p className="text-neutral-500 text-[7px] font-black uppercase tracking-widest mt-0.5">CMO, Nexa Global Health</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                           <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                               99.9% Uptime
                           </div>
                           <div className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                               HIPAA Compliant
                           </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-10 right-10 flex justify-between items-center text-[9px] font-black text-neutral-800 uppercase tracking-[0.4em]">
                        <span>Ledger v2.04</span>
                        <span>© 2026 SmartQueue Global</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
