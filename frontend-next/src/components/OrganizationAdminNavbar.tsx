"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
    LayoutDashboard, BarChart3, History, Power, 
    ShieldCheck, Bell, Settings, Search, Menu, X
} from "lucide-react";

export default function OrganizationAdminNavbar() {
    const pathname = usePathname();
    const router = useRouter();

    const navLinks = [
        { name: "Admin Dashboard", path: "/org-admin/dashboard", icon: LayoutDashboard },
        { name: "Analytics", path: "/org-admin/analytics", icon: BarChart3 },
        { name: "Waitlist History", path: "/org-admin/history", icon: History }
    ];

    const handleLogout = () => {
        // Simple client-side logout for organization admin
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl animate-fade-down">
            <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 py-5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                
                {/* Ambient Interior Glow */}
                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-brand-500/5 blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner transform rotate-3">
                        <ShieldCheck className="w-6 h-6 text-brand-400" />
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">Q-ADMIN</h2>
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.4em]">Admin Control</p>
                    </div>
                </div>

                {/* Main Navigation Hubs */}
                <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-[2rem] border border-white/5 relative z-10 backdrop-blur-xl">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.path;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`
                                    relative flex items-center gap-3 px-6 py-3 rounded-[1.5rem] transition-all duration-500 group/link
                                    ${isActive 
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
                                        : "text-neutral-400 hover:text-white hover:bg-white/5"}
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400 group-hover/link:text-brand-400"} transition-colors`} />
                                <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">{link.name}</span>
                                
                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* System Controls */}
                <div className="flex items-center gap-4 relative z-10">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-4 bg-danger-500/10 hover:bg-danger-500 text-danger-400 hover:text-white border border-danger-500/20 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                        <Power className="w-4 h-4" />
                        <span className="hidden sm:block">Logout Session</span>
                    </button>
                </div>

            </div>
        </nav>
    );
}
