"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import {
  LayoutDashboard,
  BarChart3,
  History,
  Power,
  Layers,
} from "lucide-react";

export default function OrganizationAdminNavbar() {
  const { clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    clearAuth();
    router.push("/login");
  };

  const navLinks = [
    {
      name: "Overview",
      path: "/org-admin/dashboard",
      icon: LayoutDashboard,
    },
    { name: "Analytics", path: "/org-admin/analytics", icon: BarChart3 },
    { name: "Waitlist History", path: "/org-admin/history", icon: History },
  ];

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              Q-ADMIN
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Control Console
            </p>
          </div>
        </div>

        {/* Navigation Hubs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* System Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
