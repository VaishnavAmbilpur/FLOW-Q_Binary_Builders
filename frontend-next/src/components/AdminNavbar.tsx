"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAppStore, useAuthStore } from "@/store";
import { Monitor, Users, Activity } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";


export default function AdminNavbar() {
    const { sidebarOpen, setSidebarOpen, toggleSidebar } = useAppStore();
    const { clearAuth } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout").catch(() => {});
            localStorage.clear();
            clearAuth();
            router.push("/developer/login");
        } catch (err) {
            console.error(err);
        }
    };


    const navLinks = [
        { name: "Portal", path: "/developer", icon: Monitor, bgClass: "bg-indigo-100 dark:bg-indigo-900/30", borderClass: "border-indigo-200 dark:border-indigo-800", textClass: "text-indigo-600 dark:text-indigo-400" },
        { name: "Team", path: "/developer/team", icon: Users, bgClass: "bg-emerald-100 dark:bg-emerald-900/30", borderClass: "border-emerald-200 dark:border-emerald-800", textClass: "text-emerald-600 dark:text-emerald-400" },
        { name: "Analytics", path: "/developer/analytics", icon: Activity, bgClass: "bg-pink-100 dark:bg-pink-900/30", borderClass: "border-pink-200 dark:border-pink-800", textClass: "text-pink-600 dark:text-pink-400" }
    ];

    const isAuthPage = pathname === "/developer/login" || pathname === "/developer/signup";

    return (
        <div
            className="
      fixed top-0 left-0 w-full z-50
      bg-white/90 dark:bg-[#0a0f1c]/80 backdrop-blur-xl
      border-b border-gray-200 dark:border-white/10
      shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]
      px-6 py-4 flex justify-between items-center
    "
        >
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center transition-all overflow-hidden relative drop-shadow-sm">
                    <Image
                        src="/logo.svg"
                        alt="FLOW-Q Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white mt-1">FLOW-Q Admin</span>
            </div>

            {!isAuthPage && (
                <div className="hidden md:flex gap-10 text-gray-700 dark:text-gray-200 font-medium items-center">
                    {navLinks.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={`
                    relative group flex items-center gap-2
                    hover:text-fuchsia-400 dark:hover:text-fuchsia-300 transition
                    ${isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-200"}
                `}
                            >
                                <div className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${isActive ? 'shadow-sm' : 'opacity-80 group-hover:opacity-100'} ${item.bgClass} ${item.borderClass} ${item.textClass}`}>
                                    <Icon className={`w-4 h-4 drop-shadow-sm`} />
                                </div>
                                {item.name}
                                <span
                                    className={`
                    absolute left-0 -bottom-1 h-[2px]
                    bg-gradient-to-r from-fuchsia-400 to-pink-500
                    transition-all duration-300
                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                    `}
                                ></span>
                            </Link>
                        );
                    })}
                    <div className="relative z-[100]">
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg text-sm text-gray-900 dark:text-white font-bold transition-colors"
                    >
                        Logout
                    </button>
                </div>
            )}

            {!isAuthPage && (
                <div className="flex items-center gap-4 md:hidden">
                    <div className="relative z-[100]">
                        <ThemeToggle />
                    </div>
                    <button
                        className="text-3xl text-gray-900 dark:text-white"
                        onClick={() => toggleSidebar()}
                    >
                        {sidebarOpen ? "✖" : "☰"}
                    </button>
                </div>
            )}

            {sidebarOpen && (
                <div
                    className="
          absolute top-[68px] left-0 w-full
          bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-2xl
          border-t border-gray-200 dark:border-white/10
          shadow-lg animate-fadeIn md:hidden
        "
                >
                    <div className="flex flex-col text-center py-5 gap-4 text-gray-800 dark:text-gray-200">
                        {navLinks.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    relative group flex items-center justify-center gap-2
                    hover:text-fuchsia-400 dark:hover:text-fuchsia-300 transition text-lg
                    ${isActive ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-200"}
                  `}
                                >
                                    <div className={`p-1.5 rounded-lg border flex items-center justify-center ${isActive ? 'shadow-sm' : 'opacity-80 group-hover:opacity-100'} ${item.bgClass} ${item.borderClass} ${item.textClass}`}>
                                        <Icon className={`w-5 h-5 drop-shadow-sm`} />
                                    </div>
                                    {item.name}

                                    <span
                                        className={`
                      block mx-auto h-[2px]
                      bg-gradient-to-r from-fuchsia-400 to-pink-500
                      transition-all duration-300
                      ${isActive ? "w-1/2" : "w-0 group-hover:w-1/2"}
                    `}
                                    ></span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="mt-4 px-4 py-2 w-1/2 mx-auto bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg text-sm text-gray-900 dark:text-white font-bold transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
