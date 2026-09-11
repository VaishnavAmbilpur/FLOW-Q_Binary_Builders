"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAppStore, useAuthStore } from "@/store";
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Users,
  History,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const { user, setAuth, clearAuth } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, [user]);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      const token = localStorage.getItem("accessToken") || "";
      setAuth(res.data, token);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => {});
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      clearAuth();
      router.push("/login");
    }
  };

  const allNavLinks = [
    {
      name: "Dashboard",
      path: "/org-admin/dashboard",
      icon: LayoutDashboard,
      roles: ["ORG_ADMIN"],
    },
    {
      name: "Analytics",
      path: "/org-admin/analytics",
      icon: BarChart3,
      roles: ["ORG_ADMIN"],
    },
    {
      name: "Operator Desk",
      path: "/operator",
      icon: ClipboardList,
      roles: ["OPERATOR"],
    },
    {
      name: "Agent Counter",
      path: "/agent",
      icon: Users,
      roles: ["AGENT"],
    },
    {
      name: "History",
      path: user?.role === "ORG_ADMIN" ? "/org-admin/history" : "/history",
      icon: History,
      roles: ["ORG_ADMIN", "AGENT", "OPERATOR"],
    },
  ];

  const navLinks = user?.role
    ? allNavLinks.filter((link) => link.roles.includes(user.role))
    : [];

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                FLOW-Q
              </span>
              <span className="text-[8px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                Workspace
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navLinks.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                    {user.role?.replace("_", " ")}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => toggleSidebar()}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {sidebarOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
