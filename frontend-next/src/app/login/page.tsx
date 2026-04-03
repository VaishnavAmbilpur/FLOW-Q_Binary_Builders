"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, MonitorSmartphone, Activity, Shield, Users } from "lucide-react";

export default function StaffLogin() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Show error from Google OAuth redirect
    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const error = params.get("error");
            if (error === "not_registered") setMsg("Your Google account is not registered. Doctors and Receptionists must use their admin-registered email.");
            if (error === "oauth_error") setMsg("Google sign-in failed. Please try again.");
        }
    }, []);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const res = await api.post("/auth/login", form);
            const { id, role } = res.data.user;
            localStorage.setItem("doctorId", id);
            localStorage.setItem("role", role);

            setMsg("Login Successful 🎉 Redirecting...");
            setTimeout(() => {
                if (role === "DOCTOR") {
                    router.push("/doctor");
                } else if (role === "RECEPTIONIST") {
                    router.push("/reception");
                } else if (role === "HOSPITAL_ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/");
                }
            }, 800);
        } catch (err: any) {
            setMsg(err.response?.data?.message || "Login failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-neutral-950 font-sans relative overflow-hidden transition-colors duration-300 selection:bg-brand-500/30">

            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="flex w-full relative z-10">
                {/* LEFT SIDE: AUTH FORM */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 xl:px-20 py-10">
                    <div className="w-full max-w-[380px] mx-auto">

                        {/* Logo & Header */}
                        <div className="mb-6 text-center lg:text-left animate-fade-down">
                            <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                <ArrowLeft className="w-2.5 h-2.5" /> Back to Home
                            </Link>

                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/20 mb-4 mx-auto lg:mx-0 transform -rotate-3">
                                <MonitorSmartphone className="w-5 h-5 text-white" />
                            </div>

                            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                                Welcome <span className="text-brand-500">Back.</span>
                            </h2>
                            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                                Clinical Access Portal
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
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="dr.name@hospital.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">Credentials</label>
                                <div className="relative group">
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className="w-full py-4 mt-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Activity className="w-3 h-3 animate-spin" /> Verifying...
                                    </>
                                ) : (
                                    "Authenticate Dashboard"
                                )}
                            </button>
                        </form>

                        <div className="my-8 flex items-center gap-4 animate-fade-up delay-200">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.3em]">Identity Hub</span>
                            <div className="flex-1 h-px bg-white/5" />
                        </div>

                        <div className="space-y-3.5 animate-fade-up delay-300">
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
                                Continue with Workspace
                            </a>

                            <div className="flex justify-between items-center px-1">
                                <Link href="/forgot-password" data-accent="warning" className="text-[9px] font-black text-neutral-600 hover:text-amber-500 uppercase tracking-widest transition-colors">
                                    Lost Password?
                                </Link>
                                <span className="text-[9px] font-black text-neutral-800 uppercase tracking-widest">
                                    No account? <Link href="/signup" className="text-brand-500 hover:underline">Register Hub</Link>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: PRODUCT SHOWCASE */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 md:p-14 border-l border-white/5">
                    <div className="absolute inset-0 bg-brand-600/5 backdrop-blur-[1px]" />

                    <div className="relative z-10 max-w-sm space-y-8 animate-fade-left">
                        <div className="space-y-4">
                            <h3 className="text-2xl md:text-3xl font-black text-white leading-tight underline decoration-brand-500/50 underline-offset-8 italic">
                                Architecting the future of healthcare.
                            </h3>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                                A high-fidelity patient management system designed for speed, precision, and world-class care quality.
                            </p>
                        </div>

                        <div className="grid gap-2.5">
                            {[
                                { icon: Activity, title: "Real-time Matrix", desc: "Global queue synchronization across all nodes." },
                                { icon: Shield, title: "Ledger Security", desc: "Encrypted role-based access for all clinical staff." },
                                { icon: Users, title: "Flow Optimization", desc: "Smart AI predictions for patient throughput." }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-white/[0.03] border border-white/5 p-3.5 md:p-4 rounded-xl hover:bg-white/[0.07] transition-all group">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-brand-500/50 transition-colors">
                                        <item.icon className="w-4 h-4 text-brand-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-[9px] uppercase tracking-widest mb-0.5">{item.title}</h4>
                                        <p className="text-neutral-500 text-[9px] font-bold">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
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
