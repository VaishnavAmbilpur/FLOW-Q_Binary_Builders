"use client";

import React, { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, Activity, ShieldCheck, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.data.message);
      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white p-6">
      <div className="w-full max-w-[400px]">
        <ScrollReveal direction="up" delay={50}>
          {/* Back Link */}
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="eyebrow-tag mb-2">
                ← ACCOUNT RECOVERY
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-slate-600 text-xs leading-relaxed">
                Enter your registered email and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            {isSuccess ? (
              <div className="rounded-xl bg-emerald-50 p-5 border border-emerald-200">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-800">
                      Reset Link Sent
                    </h3>
                    <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="btn-primary-obsidian w-full mt-5 py-3 text-xs font-bold"
                >
                  Return to Login
                </Link>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-200">
                    <p className="text-xs font-bold text-rose-700 text-center">
                      {error}
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Your Registered Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    placeholder="user@organization.com"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-obsidian w-full py-3.5 text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" /> Sending link...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
