"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAppStore, useAuthStore } from "@/store";
import {
  LogOut,
  Menu,
  X,
  ChevronDown,
  MonitorSmartphone,
  LayoutDashboard,
  BarChart3,
  ClipboardList,
  Users,
  History,
  Shield,
  UserCircle,
  Bell,
  Search
} from "lucide-react";

interface NavLink {
  name: string;
  path: string;
  icon: any;
  bgClass: string;
  borderClass: string;
  textClass: string;
  roles: string[];
}

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
      const token = localStorage.getItem('accessToken') || "";
      setAuth(res.data, token);
    } catch (err) {
      console.error("Failed to load user:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout").catch(() => { });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      clearAuth();
      router.push("/login");
    }
  };


  // Role-based navigation links
  const allNavLinks: NavLink[] = [
    { name: "Organization Dashboard", path: "/org-admin/dashboard", icon: LayoutDashboard, bgClass: "bg-blue-100 dark:bg-blue-900/30", borderClass: "border-blue-200 dark:border-blue-800", textClass: "text-blue-600 dark:text-blue-400", roles: ["ORG_ADMIN"] },
    { name: "Analytics", path: "/org-admin/analytics", icon: BarChart3, bgClass: "bg-fuchsia-100 dark:bg-fuchsia-900/30", borderClass: "border-fuchsia-200 dark:border-fuchsia-800", textClass: "text-fuchsia-600 dark:text-fuchsia-400", roles: ["ORG_ADMIN"] },
    { name: "Operator Desk", path: "/operator", icon: ClipboardList, bgClass: "bg-amber-100 dark:bg-amber-900/30", borderClass: "border-amber-200 dark:border-amber-800", textClass: "text-amber-600 dark:text-amber-400", roles: ["OPERATOR"] },
    { name: "Agent Panel", path: "/agent", icon: Users, bgClass: "bg-emerald-100 dark:bg-emerald-900/30", borderClass: "border-emerald-200 dark:border-emerald-800", textClass: "text-emerald-600 dark:text-emerald-400", roles: ["AGENT"] },
    { name: "History", path: user?.role === "ORG_ADMIN" ? "/org-admin/history" : "/history", icon: History, bgClass: "bg-violet-100 dark:bg-violet-900/30", borderClass: "border-violet-200 dark:border-violet-800", textClass: "text-violet-600 dark:text-violet-400", roles: ["ORG_ADMIN", "AGENT", "OPERATOR"] },
  ];

  // Filter links based on user role
  const navLinks: NavLink[] = user?.role
    ? allNavLinks.filter(link => link.roles.includes(user.role))
    : [];

  const getRoleColor = () => {
    switch (user?.role) {
      case "ORG_ADMIN":
        return {
          gradient: "from-blue-500 to-brand-500",
          badge: "bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400",
          icon: Shield,
          hover: "hover:text-brand-400"
        };
      case "AGENT":
        return {
          gradient: "from-emerald-500 to-teal-500",
          badge: "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400",
          icon: Users,
          hover: "hover:text-emerald-500"
        };
      case "OPERATOR":
        return {
          gradient: "from-orange-400 to-rose-400",
          badge: "bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400",
          icon: ClipboardList,
          hover: "hover:text-amber-500"
        };
      default:
        return {
          gradient: "from-blue-400 to-cyan-500",
          badge: "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
          icon: UserCircle,
          hover: "hover:text-blue-500"
        };
    }
  };

  const roleStyle = getRoleColor();
  const RoleIcon = roleStyle.icon;

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-3xl border-b border-gray-100 dark:border-white/5 selection:bg-brand-500/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo - FLOW-Q */}
          <Link href="/" className="flex items-center gap-4 group transition-all">
            <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={28}
                height={28}
                className="object-contain drop-shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-black text-2xl tracking-tighter bg-gradient-to-r ${roleStyle.gradient} bg-clip-text text-transparent uppercase italic`}>
                FLOW-Q
              </span>
              <span className="text-[7px] font-black tracking-[0.4em] text-neutral-100 uppercase -mt-1 opacity-80">Smart Waiting System</span>
            </div>
          </Link>

          {/* Main Terminal Navigation */}
          <div className="hidden md:flex items-center gap-2 bg-black/5 dark:bg-white/[0.03] p-1.5 rounded-[1.5rem] border border-black/5 dark:border-white/5">
            {navLinks.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`
                    relative flex items-center gap-3 px-6 py-2.5 rounded-[1.2rem] transition-all duration-500 group/link
                    ${isActive
                      ? "bg-white dark:bg-white text-black dark:text-black shadow-2xl"
                      : "text-neutral-100 hover:text-black dark:hover:text-white"}
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-200 group-hover/link:text-brand-400"} transition-colors`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Control Cluster */}
          <div className="hidden md:flex items-center gap-5">
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-4 px-2 py-2 rounded-2xl hover:bg-neutral-100 dark:hover:bg-white/5 transition-all group"
              >
                <div className="flex flex-col text-right">
                  <div className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">{user.name}</div>
                  <div className="text-[8px] font-black text-neutral-200 uppercase tracking-widest">{user.role?.replace("_", " ")}</div>
                </div>
                <div className={`w-11 h-11 rounded-[1rem] ${roleStyle.badge} flex items-center justify-center shadow-2xl transform group-hover:-rotate-3 transition-transform`}>
                  <RoleIcon className="w-5 h-5 shadow-sm" />
                </div>
              </button>

              {/* Account Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-fade-down z-[110]">
                  <div className="p-6 border-b border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02]">
                    <div className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">{user.name}</div>
                    <div className="text-[10px] text-neutral-200 truncate mb-3">{user.email}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${roleStyle.badge}`}>
                      {user.role?.replace("_", " ")}
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all uppercase tracking-widest"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Node Switch */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => toggleSidebar()}
              className="p-3 bg-neutral-100 dark:bg-white/5 rounded-2xl hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-neutral-900 dark:text-white" /> : <Menu className="w-6 h-6 text-neutral-900 dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Terminal Overlay */}
        {sidebarOpen && (
          <div className="md:hidden border-t border-neutral-100 dark:border-white/5 bg-white dark:bg-neutral-950 py-6 space-y-4 px-2 animate-fade-down">
            {navLinks.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                        flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-[10px]
                        ${isActive
                      ? `bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10`
                      : "text-neutral-100 hover:bg-neutral-50 dark:hover:bg-white/[0.02]"
                    }
                        `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Event Listener for Modal Closing */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}
