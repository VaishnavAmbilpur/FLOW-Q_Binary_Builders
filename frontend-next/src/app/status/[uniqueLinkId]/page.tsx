"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { socket } from "@/services/socket";
import Loader from "@/components/Loader";
import { CheckCircle, XCircle, Clock, AlertTriangle, Activity, Star } from "lucide-react";

export default function PatientStatusView() {
    const { uniqueLinkId } = useParams();

    const [data, setData] = useState<any>(null);
    const [completed, setCompleted] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);
    const [doctorStatus, setDoctorStatus] = useState("Available");
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    const formatTime = (mins: number | null) => {
        if (mins == null) return "--";
        if (mins >= 60) {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return m > 0 ? `${h}h ${m}m` : `${h}h`;
        }
        return `${mins}m`;
    };

    const loadStatus = async () => {
        try {
            const res = await api.get(`/queue/status/${uniqueLinkId}`);

            if (res.data.status === "completed") {
                setCompleted(true);
                if (res.data.feedback) setFeedbackSubmitted(true);
                return;
            }
            if (res.data.status === "cancelled") {
                setCancelled(true);
                return;
            }

            if (res.data.doctorAvailability) {
                setDoctorStatus(res.data.doctorAvailability);
            }

            setData(res.data);

            const me = res.data?.queue?.find((p: any) => p.isMe);
            let calculatedMins = 0;

            if (me?.waitMinutes != null) {
                calculatedMins = me.waitMinutes;
            } else if (res.data?.myPosition != null) {
                const peopleBefore = res.data.myPosition - 1;
                const avg = res.data.avgTime || 5;
                calculatedMins = peopleBefore * avg;
            }

            // Persist countdown across refresh using localStorage
            const storageKey = `wait_time_${uniqueLinkId}`;
            const saved = localStorage.getItem(storageKey);
            const now = Date.now();

            if (saved) {
                const { value, timestamp, position: savedPos, avg: savedAvg } = JSON.parse(saved);
                const elapsedMins = Math.floor((now - timestamp) / 60000);

                // Only use saved value if position and avgTime haven't changed (server truth is higher)
                if (savedPos === res.data.myPosition && savedAvg === res.data.avgTime && value - elapsedMins > 0) {
                    setRemainingMinutes(value - elapsedMins);
                } else {
                    setRemainingMinutes(calculatedMins);
                    localStorage.setItem(storageKey, JSON.stringify({
                        value: calculatedMins,
                        timestamp: now,
                        position: res.data.myPosition,
                        avg: res.data.avgTime
                    }));
                }
            } else {
                setRemainingMinutes(calculatedMins);
                localStorage.setItem(storageKey, JSON.stringify({
                    value: calculatedMins,
                    timestamp: now,
                    position: res.data.myPosition,
                    avg: res.data.avgTime
                }));
            }

            socket.connect();
            socket.emit("joinDoctorPublicRoom", {
                hospitalId: res.data.hospitalId,
                doctorId: res.data.doctorId
            });
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!uniqueLinkId) return;
        loadStatus();

        socket.connect();
        socket.emit("joinPatientRoom", uniqueLinkId as string);

        socket.on("visitCompleted", () => setCompleted(true));
        socket.on("visitCancelled", () => setCancelled(true));
        socket.on("queueUpdated", loadStatus);

        socket.on("doctorAvailabilityChanged", (payload: any) => {
            if (payload.doctorId === data?.doctorId || payload.doctorId === data?.doctor?._id) {
                setDoctorStatus(payload.availability);
                if (payload.availability === "Available") loadStatus();
            }
        });

        return () => {
            socket.off("visitCompleted");
            socket.off("visitCancelled");
            socket.off("queueUpdated");
            socket.off("doctorAvailabilityChanged");
        };
    }, [uniqueLinkId]);

    useEffect(() => {
        if (remainingMinutes == null) return;
        if (doctorStatus !== "Available") return;

        const interval = setInterval(() => {
            setRemainingMinutes(prev => {
                const newVal = (prev && prev > 0 ? prev - 1 : 0);
                // Sink to localStorage periodically
                localStorage.setItem(`wait_time_${uniqueLinkId}`, JSON.stringify({
                    value: newVal,
                    timestamp: Date.now(),
                    position: data?.myPosition,
                    avg: data?.avgTime
                }));
                return newVal;
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [remainingMinutes, doctorStatus, data?.myPosition, uniqueLinkId]);

    const submitFeedback = async () => {
        if (rating === 0) return;
        setFeedbackLoading(true);
        try {
            await api.put(`/queue/feedback/${uniqueLinkId}`, { rating, comment });
            setFeedbackSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setFeedbackLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (cancelled)
        return (
            <div className="min-h-screen flex justify-center items-center bg-neutral-950 px-6 relative overflow-hidden transition-colors">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-danger-600/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-danger-500/20 shadow-2xl text-center max-w-md w-full animate-fade-up z-10">
                    <XCircle className="w-20 h-20 text-danger-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    <h2 className="text-3xl font-black text-white tracking-tight">Cancelled</h2>
                    <p className="mt-4 text-white font-medium">Your appointment was cancelled. Please ask at the front desk if you need help.</p>
                </div>
            </div>
        );

    if (completed)
        return (
            <div className="min-h-screen flex justify-center items-center bg-neutral-950 px-6 relative overflow-hidden py-10 transition-colors">
                <div className="absolute w-[50%] h-[50%] bg-success-600/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="bg-white/5 backdrop-blur-3xl p-8 sm:p-10 rounded-[3rem] border border-success-500/20 shadow-2xl text-center max-w-md w-full animate-fade-up z-10 flex flex-col items-center">
                    <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-success-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <h2 className="text-3xl font-black text-white tracking-tight">Finished</h2>
                    <p className="mt-3 text-sm sm:text-base text-white font-bold max-w-[280px] mx-auto uppercase tracking-wide">Thanks for visiting! Have a great day.</p>
                </div>
            </div>
        );

    if (!data) return <Loader />;

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-brand-500/30 font-sans relative overflow-x-hidden pt-8 pb-20 px-4 sm:px-6 transition-colors">

            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-brand-500/5 blur-[100px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-md mx-auto relative z-10 space-y-6">

                {/* Header Card */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center animate-fade-down">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mx-auto mb-6 transform hover:rotate-3 transition-transform">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">Live Waitlist</h1>
                    <p className="text-neutral-100 text-[10px] font-black uppercase tracking-[0.3em] mt-4">{data.hospitalName}</p>

                    <button
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                navigator.clipboard.writeText(window.location.href).then(() => {
                                    setMsg("Tracking Link Copied! 🎉");
                                    setTimeout(() => setMsg(""), 3000);
                                });
                            }
                        }}
                        className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 active:scale-95 transition-all shadow-inner"
                    >
                        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        Copy Tracking Link
                    </button>
                    {msg === "Tracking Link Copied! 🎉" && <p className="text-[10px] text-brand-300 mt-3 font-bold animate-fade-up">Tracking link saved to clipboard!</p>}
                </div>

                {/* Progress Tracker */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 sm:p-8 shadow-xl space-y-8">
                    <div className="flex justify-between items-start px-2 relative">
                        <div className="absolute top-[18px] sm:top-[22px] left-8 right-8 h-0.5 bg-white/10">
                            <div
                                className="h-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000"
                                style={{ width: data.myPosition === 1 ? '100%' : data.myPosition <= 3 ? '66%' : '33%' }}
                            />
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:gap-3 z-10 group">
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-all ${data.myPosition > 0 ? 'bg-brand-500 border-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-neutral-900 border-neutral-800'}`}>
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-100">Check-in</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:gap-3 z-10 group">
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-all ${data.myPosition > 3 ? 'bg-brand-500 border-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse' : data.myPosition > 0 ? 'bg-brand-500 border-brand-400' : 'bg-neutral-900 border-neutral-800'}`}>
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-100">Waiting</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 sm:gap-3 z-10 group">
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border-2 transition-all ${data.myPosition <= 3 && data.myPosition > 0 ? 'bg-brand-500 border-brand-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-bounce' : 'bg-neutral-900 border-neutral-800'}`}>
                                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-100">Go In</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-center group hover:bg-white/5 transition-all shadow-inner">
                            <p className="text-neutral-100 text-[11px] font-bold uppercase tracking-wider">NUMBER</p>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-1 sm:mt-2 group-hover:scale-110 transition-transform">#{data.myTokenNumber}</p>
                        </div>
                        <div className="bg-brand-500/10 border border-brand-500/20 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-center group hover:bg-brand-500/20 transition-all shadow-inner">
                            <p className="text-brand-300 text-[11px] font-bold uppercase tracking-wider">PLACE IN LINE</p>
                            <p className="text-3xl sm:text-4xl font-black text-white mt-1 sm:mt-2 group-hover:scale-110 transition-transform">{data.myPosition}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-5 flex items-center justify-between shadow-inner group hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:border-brand-500/50 transition-colors">
                                    <Activity className={`w-6 h-6 z-10 ${doctorStatus === 'Available' ? 'text-brand-400' : 'text-neutral-600'}`} />
                                    {doctorStatus === 'Available' && (
                                        <div className="absolute inset-0 bg-brand-500/5 animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider">DOCTOR STATUS</p>
                                    <p className={`text-[13px] font-black tracking-wide ${doctorStatus === 'Available' ? 'text-brand-400' : 'text-danger-500 shadow-[0_0_10px_rgba(239, 68, 68, 0.3)]'}`}>
                                        {doctorStatus === 'Available' ? 'DOCTOR IS ONLINE' : 'DOCTOR IS OFFLINE'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-neutral-100 uppercase tracking-wider">WAIT TIME</p>
                                <p className="text-xl sm:text-2xl font-black text-white">{doctorStatus === 'Available' ? formatTime(remainingMinutes) : '---'}</p>
                            </div>
                        </div>

                        {data.myPosition <= 3 && doctorStatus === 'Available' && (
                            <div className="bg-brand-600 border border-brand-400 p-5 rounded-[2rem] flex items-center gap-4 animate-pulse shadow-xl shadow-brand-600/20">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-[11px] font-bold text-white uppercase tracking-wider leading-relaxed">It's almost your turn! Please wait near the office.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Queue Overview List */}
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            Live Waitlist
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-ping" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-100">{data.queue.length} Total</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {data.queue.map((p: any) => (
                            <div
                                key={p.id}
                                className={`group p-5 rounded-2xl border transition-all flex items-center justify-between
                                    ${p.isMe
                                        ? 'bg-brand-500 border-brand-400 shadow-xl shadow-brand-500/20 translate-x-2'
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:translate-x-1'}
                                `}
                            >
                                <div className="flex items-center gap-5">
                                    <span className={`text-base font-black ${p.isMe ? 'text-white' : 'text-neutral-100'}`}>#{p.tokenNumber}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${p.isMe ? 'bg-white shadow-[0_0_8px_white]' : 'bg-neutral-800'}`} />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${p.isMe ? 'text-brand-100' : 'text-neutral-100'}`}>
                                        {p.isMe ? 'THIS IS YOU' : 'MEMBER'}
                                    </span>
                                </div>
                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold border uppercase tracking-wider transition-all
                                    ${p.isMe
                                        ? 'bg-white/10 border-white/20 text-white'
                                        : 'bg-black/40 border-neutral-800 text-neutral-400 group-hover:border-neutral-700'}
                                `}>
                                    PLACE {p.position}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-[9px] font-black text-neutral-300 uppercase tracking-[0.4em] pt-8">
                    Flow-Q Digital Assist
                </p>
            </div>
        </div>
    );
}
