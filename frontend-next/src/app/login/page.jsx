"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import {
  ArrowLeft,
  Activity,
  Shield,
  Users,
  Layers,
  CheckCircle2,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function StaffLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Show error from Google OAuth redirect
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error === "not_registered")
        setMsg(
          "Your Google account is not registered. Agents and Receptionists must use their admin-registered email.",
        );
      if (error === "oauth_error")
        setMsg("Google sign-in failed. Please try again.");
    }
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await api.post("/auth/login", form);
      const { id, role } = res.data.user;
      const { accessToken } = res.data;

      localStorage.setItem("agentId", id);
      localStorage.setItem("role", role);
      localStorage.setItem("accessToken", accessToken);

      setMsg("Login Successful 🎉 Redirecting...");
      setTimeout(() => {
        if (role === "AGENT") {
          router.push("/agent");
        } else if (role === "OPERATOR") {
          router.push("/operator");
        } else if (role === "ORG_ADMIN") {
          router.push("/org-admin/dashboard");
        } else {
          router.push("/");
        }
      }, 800);
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <div className="flex w-full min-h-screen">
        {/* LEFT SIDE: AUTH FORM */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12">
          <div className="w-full max-w-[400px] mx-auto">
            <ScrollReveal direction="up" delay={50}>
              {/* Back Link */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </Link>

              {/* Eyebrow Tag & Header */}
              <div className="mb-8">
                <span className="eyebrow-tag mb-3">
                  ← BUSINESS ACCESS PORTAL
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-2">
                  Welcome Back
                </h1>
                <p className="text-slate-600 text-sm font-normal">
                  Sign in to manage queues, call visitors, and monitor live wait times.
                </p>
              </div>

              {msg && (
                <div
                  className={`mb-6 p-4 rounded-xl text-xs font-bold ${
                    msg.includes("Successful")
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-rose-50 border border-rose-200 text-rose-700"
                  }`}
                >
                  {msg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="user@organization.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="btn-primary-obsidian w-full py-3.5 text-sm font-bold mt-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    "Sign In to Dashboard"
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="space-y-4">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}/api/auth/google`}
                  className="btn-secondary-white w-full py-3 text-xs font-bold text-slate-800"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google Workspace
                </a>

                <p className="text-center text-xs text-slate-500 font-medium">
                  Need a new organization hub?{" "}
                  <Link
                    href="/signup"
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* RIGHT SIDE: PRODUCT SHOWCASE */}
        <div className="hidden lg:flex w-1/2 bg-slate-50 border-l border-slate-200 flex-col justify-center items-center p-12 relative overflow-hidden">
          <ScrollReveal direction="left" delay={100} className="max-w-md space-y-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Layers className="w-6 h-6" />
            </div>

            <div>
              <span className="eyebrow-tag mb-2">
                ← ENTERPRISE READY
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                Intelligent queue flow &amp; real-time synchronization.
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Empower your front desk and service agents with live visitor progression, SMS notifications, and multi-desk load balancing.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Real-time Matrix",
                  desc: "Sub-second synchronization across all desks and monitors.",
                  icon: Activity,
                },
                {
                  title: "Encrypted Privacy",
                  desc: "Automated masking & cipher protection on visitor records.",
                  icon: Shield,
                },
                {
                  title: "Instant Staff Dispatch",
                  desc: "One-click call next, pause, transfer, and complete.",
                  icon: Users,
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 text-xs">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
