'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Scissors, Stethoscope, MapPin, Clock, Smartphone, ChevronRight, TrendingUp,
    CreditCard, User as UserIcon, Phone, BarChart2, AlertCircle, Check, Activity, ShieldAlert
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://flow-q-binary-builders.onrender.com/api/v2';
const STATIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'sq_test_NjljZmJiOGU3ODQ0NTgyYjZmOTQ5YmZh_73d51f3f88a95e5de0dcddf867eb0f4c0614bf44b96ffbb589ecf1e883c35453';

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { id } = await params;
                if (!id) return;

                const res = await axios.get(`${API_BASE}/queue/${id}`, {
                    headers: { 'x-api-key': STATIC_API_KEY }
                });
                setData(res.data.data);
                setError(false);
            } catch (err) {
                console.error('Fetch status failed', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        const init = async () => {
            await fetchStatus();
            const interval = setInterval(fetchStatus, 3000);
            return interval;
        };

        const timerPromise = init();
        return () => {
            timerPromise.then(id => clearInterval(id));
        };
    }, [params]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a12] gap-6">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            <p className="text-neutral-500 animate-pulse font-bold tracking-[0.3em] text-[10px] uppercase">Syncing Live Status...</p>
        </div>
    );

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a12] px-8 text-center gap-6">
            <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-500 scale-110">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">Protocol Link Error</h1>
                <p className="text-neutral-500 text-xs max-w-sm mt-2 font-bold uppercase tracking-widest leading-loose">This tracking node has timed out or the session hash was invalidated by the host.</p>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 transition-all"
            >
                Recall Terminal
            </button>
        </div>
    );

    const isCompleted = data.status === 'completed';
    const isCancelled = data.status === 'cancelled';
    const isServing = data.status === 'serving';

    return (
        <main className="min-h-screen bg-[#0a0a12] text-white font-sans selection:bg-blue-500/30 p-6 flex flex-col items-center">
            <header className="flex flex-col items-center gap-6 text-center mb-16 w-full max-w-md">
                <div className="w-16 h-16 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white shadow-[0_15px_40px_rgba(37,99,235,0.4)] transform -rotate-3 border-2 border-white/20">
                    <Activity className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight">Velvet & Slate</h1>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.4em] mt-1 italic">Intelligent Customer Tracking Link</p>
                </div>
            </header>

            {/* Main Status Display */}
            <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden backdrop-blur-3xl shadow-2xl animate-fade-up">
                {/* Subtle background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />

                {isCompleted ? (
                    <div className="text-center py-4 flex flex-col items-center gap-6 animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-2 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <Check className="w-12 h-12" strokeWidth={3} />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Service Concluded</h2>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Thank you for visiting today. This session has been marked as <span className="text-emerald-500">Completed</span>.</p>
                        <button disabled className="mt-4 px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-neutral-700">Link Inactive</button>
                    </div>
                ) : isCancelled ? (
                    <div className="text-center py-4 flex flex-col items-center gap-6 animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-2 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                            <AlertCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Visit Cancelled</h2>
                        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">This session has been <span className="text-red-500 font-black">terminated</span> by the management.</p>
                        <button disabled className="mt-4 px-8 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest text-neutral-700">Protocol Aborted</button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center text-center mb-12">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6 block animate-pulse">
                                {isServing ? 'NOW SERVING' : 'WAITING IN LINE'}
                            </span>
                            <div className="relative">
                                <h2 className="text-8xl sm:text-9xl font-black italic tracking-tighter text-white font-mono">
                                    {data.position || '—'}
                                </h2>
                                {!isServing && <span className="absolute -top-1 -right-6 text-xl font-black text-neutral-700 font-mono italic">#</span>}
                            </div>
                            <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.3em] mt-8">
                                {isServing ? 'Proceed to Stylist' : 'Your Position in Queue'}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 border-t border-white/5 pt-10">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-blue-500 shadow-xl">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-black italic text-white flex items-baseline gap-1">
                                        {isServing ? 0 : (data.estimatedWaitMins || (data.position * 5))}
                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">mins</span>
                                    </p>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-neutral-500 mt-1 block">Est. Wait</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/5 flex items-center justify-center text-blue-500 shadow-xl">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xl font-black italic text-white">#{data.tokenNumber}</span>
                                    <span className="text-[8px] uppercase font-black tracking-widest text-neutral-500 mt-1 block">Node Index</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Info Sections */}
            <div className="w-full max-w-md mt-6 space-y-3 animate-fade-up delay-200">
                <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between backdrop-blur-xl">
                    <div className="flex items-center gap-5">
                        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div>
                            <p className="text-[8px] uppercase font-black tracking-[0.3em] text-neutral-600 mb-0.5 italic">Customer Identity</p>
                            <p className="text-[13px] font-black italic text-white uppercase tracking-tight">{data.clientName}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl">
                    <p className="text-[10px] text-neutral-500 font-bold leading-loose uppercase tracking-[0.1em]">
                        Your token <span className="text-white font-black italic underline decoration-blue-500/50 underline-offset-4 tracking-[0.2em]">#{data.tokenNumber}</span> will be announced shortly. <br />
                        Please stand ready in the lounge.
                    </p>
                </div>
            </div>

            <footer className="mt-16 text-center flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-all duration-700">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase text-neutral-500">Secured via Deployment Matrix</span>
                    <span className="text-[10px] font-black italic tracking-tighter bg-white text-black px-2 py-0.5 rounded leading-none flex items-center gap-1.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> FLOW-Q
                    </span>
                </div>
            </footer>
        </main>
    );
}
