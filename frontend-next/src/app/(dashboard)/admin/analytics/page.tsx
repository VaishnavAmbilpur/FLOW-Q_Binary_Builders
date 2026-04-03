"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import Loader from "@/components/Loader";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { 
    Activity, Clock, CheckCircle, XCircle, Users, 
    BarChart3, TrendingUp, Zap, Target, Gauge
} from "lucide-react";

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const res = await api.get("/admin/analytics");
            setData(res.data);
        } catch (err) {
            console.error("Failed to load analytics", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) return <Loader />;

    const { dailyVolume, doctorPerformance, heatmap } = data;

    // Heatmap Preparation
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM commonly

    const maxHeatmapCount = Math.max(...heatmap.map((h: any) => h.count), 1);

    const getHeatmapColor = (count: number) => {
        if (!count) return "bg-white/[0.02] border-white/5";
        const intensity = count / maxHeatmapCount;
        if (intensity < 0.2) return "bg-brand-500/10 border-brand-500/20";
        if (intensity < 0.5) return "bg-brand-500/30 border-brand-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
        if (intensity < 0.8) return "bg-brand-500/60 border-brand-500/60 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]";
        return "bg-brand-500 border-white/20 text-white font-bold shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse";
    };

    const totalPatients = doctorPerformance.reduce((acc: number, doc: any) => acc + doc.total, 0);
    const totalCompleted = doctorPerformance.reduce((acc: number, doc: any) => acc + (doc.completed || 0), 0);
    const totalCancelled = doctorPerformance.reduce((acc: number, doc: any) => acc + (doc.cancelled || 0), 0);
    const completedRate = totalPatients ? Math.round((totalCompleted / totalPatients) * 100) : 0;

    const validWaitTimes = doctorPerformance.filter((d: any) => d.avgWaitTime != null).map((d: any) => d.avgWaitTime);
    const avgOverallWait = validWaitTimes.length ? Math.round(validWaitTimes.reduce((a: number, b: number) => a + b, 0) / validWaitTimes.length) : 0;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">
            

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-20 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-down">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3 hover:rotate-0 transition-all duration-700">
                            <BarChart3 className="w-6 h-6 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 uppercase tracking-tighter italic underline decoration-brand-500/20 underline-offset-4">Node Analytics</h1>
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em]">Matrix Throughput <span className="mx-2 text-neutral-800">/</span> 30-Day Intelligence</p>
                        </div>
                    </div>
                </div>

                {/* Primary Intelligence Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 animate-fade-up">
                    { [
                        { label: "Matrix Volume", value: totalPatients, icon: <Users className="w-5 h-5" />, color: "text-brand-400 border-brand-500/20" },
                        { label: "Commitment Rate", value: `${completedRate}%`, icon: <Target className="w-5 h-5" />, color: "text-success-400 border-success-500/20" },
                        { label: "Neural Latency", value: `${avgOverallWait}m`, icon: <Zap className="w-5 h-5" />, color: "text-warning-400 border-warning-500/20" },
                        { label: "Sync Failures", value: totalCancelled, icon: <XCircle className="w-5 h-5" />, color: "text-danger-400 border-danger-500/20" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative bg-white/[0.03] border rounded-[1.5rem] sm:rounded-2xl p-5 sm:p-7 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 opacity-30 group-hover:opacity-100 transition-opacity">{icon}</div>
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 font-mono whitespace-nowrap">{value}</span>
                            <p className="text-[8px] sm:text-[9px] uppercase font-black tracking-[0.2em] text-neutral-600">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Visualization Matrix */}
                <div className="grid lg:grid-cols-2 gap-10 mb-10 animate-fade-up delay-100">
                    
                    {/* Throughput Timeline */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-brand-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight italic">Temporal Volume</h3>
                            </div>
                            <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Auto-Scaling Axis</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyVolume}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#404040"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.slice(5)}
                                        fontFamily="var(--font-mono)"
                                    />
                                    <YAxis
                                        stroke="#404040"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        fontFamily="var(--font-mono)"
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#60a5fa' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Node Performance */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-success-600/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Gauge className="w-5 h-5 text-success-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight italic">Node Efficiency</h3>
                            </div>
                            <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Commitment Matrix</span>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={doctorPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis
                                        dataKey="doctorName"
                                        stroke="#404040"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        fontFamily="var(--font-mono)"
                                        tickFormatter={(val) => val.split(' ').pop()}
                                    />
                                    <YAxis
                                        stroke="#404040"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        fontFamily="var(--font-mono)"
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '20px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="completed" fill="#10b981" radius={[10, 10, 0, 0]} name="Commits" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                    <Bar dataKey="cancelled" fill="#ef4444" radius={[10, 10, 0, 0]} name="Failures" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Matrix Heatmap */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-3xl relative overflow-hidden animate-fade-up delay-200 group">
                    <div className="absolute top-0 left-0 w-[30%] h-[30%] bg-brand-600/5 blur-[100px] rounded-full pointer-events-none" />
                    <div className="flex items-center gap-4 mb-10">
                        <Activity className="w-6 h-6 text-brand-400" />
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight italic">Temporal Intensity Matrix</h3>
                            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Global Traffic Node Distribution</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <div className="min-w-[800px] pb-6">
                            {/* Hours Header */}
                            <div className="flex ml-20 mb-6">
                                {hours.map(h => (
                                    <div key={h} className="flex-1 text-center text-[10px] font-black text-neutral-600 uppercase tracking-widest italic">
                                        {h > 12 ? `${h - 12}P` : h === 12 ? '12P' : `${h}A`}
                                    </div>
                                ))}
                            </div>

                            {/* Matrix Grid */}
                            <div className="flex flex-col gap-3">
                                {days.map((dayName, dayIndex) => (
                                    <div key={dayName} className="flex items-center group/row">
                                        <div className="w-20 text-[10px] font-black text-neutral-700 text-right pr-6 group-hover/row:text-white transition-colors duration-500 uppercase tracking-[0.2em] italic">{dayName}</div>
                                        <div className="flex-1 flex gap-2">
                                            {hours.map(hour => {
                                                const point = heatmap.find((h: any) => h.dayOfWeek === dayIndex && h.hourOfDay === hour);
                                                const count = point ? point.count : 0;
                                                return (
                                                    <div
                                                        key={`${dayIndex}-${hour}`}
                                                        title={`${dayName} ${hour}:00 - ${count} Nodes Active`}
                                                        className={`flex-1 h-12 md:h-14 rounded-2xl border flex items-center justify-center text-[10px] font-black transition-all duration-700 hover:scale-[1.15] hover:z-20 cursor-crosshair ${getHeatmapColor(count)}`}
                                                    >
                                                        {count > 0 ? count : ""}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
