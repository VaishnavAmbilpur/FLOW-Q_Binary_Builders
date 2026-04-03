"use client";

import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { QrCode, X, Maximize2, MonitorSmartphone } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRTerminal() {
    const [isOpen, setIsOpen] = useState(false);
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [origin, setOrigin] = useState("");

    useEffect(() => {
        setOrigin(window.location.origin);
        fetchHospitalId();
    }, []);

    const fetchHospitalId = async () => {
        try {
            // Check admin info first, then standard me info
            let res = await api.get("/admin/info").catch(() => null);
            if (!res || !res.data?._id) {
                res = await api.get("/auth/me").catch(() => null);
            }

            if (res && res.data) {
                // For hospital admins, their _id is the hospitalId
                // For staff, they might have a hospitalId field or it might be in the profile
                const id = res.data.hospitalId || res.data._id;
                setHospitalId(id);
            }
        } catch (err) {
            console.error("Failed to fetch hospital context for QR:", err);
        }
    };

    if (!hospitalId) return null;

    const qrUrl = `${origin}/kiosk/${hospitalId}`;

    return (
        <>
            {/* Minimalist Floating Trigger (Left Center) */}
            <div className="fixed left-0 top-1/2 -translate-y-1/2 z-[150] group">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex flex-col items-center justify-center p-3 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-r-2xl shadow-2xl hover:bg-brand-600/20 hover:border-brand-500/30 transition-all duration-500 group-hover:pl-5 group-hover:pr-4"
                    title="Open Registration QR"
                >
                    <QrCode className="w-5 h-5 text-neutral-400 group-hover:text-brand-400 transition-colors" />
                    <span className="mt-2 [writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-[0.2em] text-neutral-600 group-hover:text-neutral-400 transition-colors">
                        Terminal
                    </span>
                </button>
            </div>

            {/* FULL SCREEN OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12 animate-fadeIn">
                    {/* Blurred Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-3xl cursor-pointer" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Ambient Glows */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-brand-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-1/2 h-1/2 bg-info-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse delay-1000" />

                    {/* QR Content Card */}
                    <div className="relative z-10 w-full max-w-xl bg-[#0a0a0a]/90 border border-white/10 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 md:p-16 flex flex-col items-center shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-quantum-pop backdrop-blur-2xl">
                        
                        {/* High-Visibility Integrated Close Button */}
                        <div className="absolute top-6 right-6 z-[250]">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-3.5 sm:p-4 bg-white/10 hover:bg-danger-500/20 text-white hover:text-danger-400 border border-white/10 hover:border-danger-500/30 rounded-2xl transition-all active:scale-90 shadow-2xl backdrop-blur-3xl group/close"
                                aria-label="Dismiss Terminal"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover/close:rotate-180 transition-transform duration-500" />
                            </button>
                        </div>

                        <div className="mb-8 sm:mb-10 text-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-600/10 border border-brand-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
                                <MonitorSmartphone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-400" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">Patient Terminal</h2>
                            <p className="text-neutral-500 text-[8px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-8 sm:mb-12 italic">Scan to Join Clinical Queue</p>
                        </div>

                        {/* Responsive High-Fidelity QR */}
                        <div className="p-4 sm:p-8 bg-white rounded-2xl sm:rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.05)] border-4 sm:border-8 border-white/10 group transform hover:scale-[1.02] transition-transform duration-700">
                            <QRCodeCanvas
                                value={qrUrl}
                                size={typeof window !== 'undefined' ? (window.innerWidth < 640 ? 180 : window.innerWidth < 1024 ? 280 : 380) : 300}
                                level="H"
                                includeMargin={false}
                                bgColor="#ffffff"
                                fgColor="#000000"
                                className="w-full h-full max-w-[180px] sm:max-w-[280px] lg:max-w-[380px]"
                            />
                        </div>

                        <div className="mt-8 sm:mt-12 text-center max-w-sm px-4">
                            <p className="text-neutral-400 text-[10px] sm:text-xs font-medium leading-relaxed">
                                Patients can scan this code to access the self-service registration hub and track their live queue status in real-time.
                            </p>
                        </div>

                        {/* URL Badge */}
                        <div className="mt-6 sm:mt-8 px-4 sm:px-5 py-2 bg-white/5 border border-white/10 rounded-full max-w-full">
                            <p className="text-[7px] sm:text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-none truncate max-w-[200px] sm:max-w-none">
                                {qrUrl}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
