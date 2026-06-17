"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { MonitorPlay, Stethoscope, ArrowRight, User, Maximize, Minimize } from "lucide-react";
import io from 'socket.io-client';

export default function AgentDisplayBoard() {
    const params = useParams();
    const organizationId = params.organizationId;
    const agentId = params.agentId;

    const [agentData, setAgentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const loadDisplayData = async () => {
        try {
            const res = await api.get(`/kiosk/${organizationId}/display/${agentId}`);
            if (res.data.success) {
                setAgentData(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load agent display data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!organizationId || !agentId) return;

        loadDisplayData();

        // WebSocket Integration for real-time TV re-rendering
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log("Connected to agent display socket");
            socket.emit('joinOrganizationPublicRoom', organizationId);
            loadDisplayData();
        });

        socket.on('queueUpdated', () => {
            console.log("Queue Update Received via Socket, Reloading Display Data...");
            loadDisplayData();
        });

        socket.on('agentAvailabilityChanged', () => {
            console.log("Agent Availability Changed via Socket, Reloading Display Data...");
            loadDisplayData();
        });

        // Polling fallback
        const interval = setInterval(() => {
            loadDisplayData();
        }, 10000);

        return () => {
            socket.off('queueUpdated');
            socket.off('agentAvailabilityChanged');
            socket.disconnect();
            clearInterval(interval);
        };
    }, [organizationId, agentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0516] flex items-center justify-center transition-colors">
                <div className="w-32 h-32 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!agentData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0c0516] flex items-center justify-center transition-colors">
                <p className="text-4xl text-gray-500 font-medium">Agent display not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex flex-col p-12 transition-all">

            {/* Ambient Signage Glows */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

            {/* Header Area */}
            <header className="flex items-center justify-between mb-16 relative z-10 border-b border-white/5 pb-12">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
                        <MonitorPlay className="w-12 h-12 text-brand-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white mb-1 uppercase italic underline decoration-brand-500/20 underline-offset-4">Live Queue Stream</h1>
                        <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.4em]">Department Display <span className="mx-3 text-neutral-800">/</span> {agentData.organizationName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-1">Current Time</p>
                            <p className="text-5xl font-black font-mono tracking-tighter tabular-nums bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleFullscreen}
                        className="p-6 rounded-[2rem] bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-neutral-400 hover:text-white backdrop-blur-xl"
                    >
                        {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
                    </button>
                </div>
            </header>

            {/* Matrix View */}
            <main className="flex-1 relative z-10 flex flex-col lg:flex-row gap-16">

                {/* Left Side: Serving Focus */}
                <div className="flex-[2] flex flex-col justify-center">
                    <div className="flex items-center gap-10 mb-20 animate-fade-down">
                        <div className="w-32 h-32 bg-brand-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand-500/30 transform -rotate-6 group-hover:rotate-0 transition-all duration-700">
                            <Stethoscope className="w-16 h-16" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-brand-400 uppercase tracking-[0.4em] mb-2">Operating Hubian</p>
                            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase mb-3 italic">{agentData.agentName}</h2>
                            <div className="flex items-center gap-4">
                                <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400">{agentData.serviceCategory}</span>
                                <span className="px-6 py-2 bg-success-500/10 border border-success-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-success-400 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-success-500 animate-ping" /> Online
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group animate-fade-up">
                        <div className="absolute -inset-20 bg-brand-500/5 blur-[120px] rounded-full pointer-events-none group-hover:bg-brand-500/10 transition-all duration-1000" />
                        <div className="relative bg-white/[0.02] border border-white/5 rounded-[5rem] p-24 text-center backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.4)]">
                            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-neutral-700 mb-6">Currently Serving</p>
                            <span className={`text-[14rem] md:text-[18rem] lg:text-[20rem] leading-none font-black tracking-tighter font-mono drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-1000 ${agentData.servingToken !== '---' ? 'text-white' : 'text-neutral-900'}`}>
                                {agentData.servingToken}
                            </span>
                            {agentData.servingToken !== '---' && (
                                <div className="mt-12 flex items-center justify-center gap-4 text-brand-400 font-black text-[12px] uppercase tracking-[0.4em] animate-pulse">
                                    <Activity className="w-6 h-6" /> Please proceed to session
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Registry Stack */}
                <div className="flex-[1] flex flex-col bg-white/[0.03] border border-white/5 rounded-[4rem] backdrop-blur-2xl p-12 shadow-2xl relative overflow-hidden animate-fade-left">
                    <div className="absolute top-0 right-0 w-[50%] h-[30%] bg-brand-600/5 blur-[80px] rounded-full pointer-events-none" />

                    <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                        <div className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500"></span>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Upcoming Tokens</h3>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                        {agentData.nextTokens && agentData.nextTokens.length > 0 ? (
                            agentData.nextTokens.map((token: number, idx: number) => (
                                <div key={idx} className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 flex items-center justify-between">
                                    <div>
                                        <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-1">Queue Position {idx + 1}</p>
                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Waiting</p>
                                    </div>
                                    <span className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-white group-hover:text-brand-400 transition-colors">{token}</span>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
                                <Activity className="w-20 h-20 text-neutral-600 mb-8 animate-pulse" />
                                <p className="text-xl font-black uppercase tracking-widest">No customers in queue</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>

            {/* Global Ticker */}
            <footer className="mt-16 h-24 bg-white/5 border border-white/5 rounded-[2rem] flex items-center relative z-10 overflow-hidden backdrop-blur-xl">
                <div className="w-48 h-full bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center border-r border-white/10 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
                    Information
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="whitespace-nowrap flex items-center gap-16 animate-marquee">
                        {[1, 2].map((i) => (
                            <React.Fragment key={i}>
                                <span className="text-neutral-500 text-xl font-black uppercase tracking-widest flex items-center gap-4"><ArrowRight className="w-6 h-6 text-brand-400" /> Watch for your token number to appear on the screen.</span>
                                <span className="text-neutral-500 text-xl font-black uppercase tracking-widest flex items-center gap-4"><ArrowRight className="w-6 h-6 text-brand-400" /> Please check in at the reception or kiosk to join the queue.</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
}

const Activity = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);
