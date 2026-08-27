"use client";

import React, { useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, Activity, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 font-sans relative overflow-hidden transition-colors duration-300 selection:bg-brand-500/30 p-6">
      {/* Ambient Background - Architect Ledger Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <div className="relative w-full max-w-[380px] z-10 animate-fade-up">
        {/* Back Link */}
        <div className="mb-6 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
          >
            <ArrowLeft className="w-2.5 h-2.5" /> Return to Hub
          </Link>
        </div>

        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-3xl rounded-[2rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[60px] rounded-full pointer-events-none" />

          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 uppercase italic underline decoration-brand-500/30 underline-offset-4">
              Forgot <span className="text-brand-500">Access.</span>
            </h2>
            <p className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.3em] leading-relaxed">
              Initialize credential restoration protocol
            </p>
          </div>

          {isSuccess ? (
            <div className="rounded-2xl bg-brand-500/10 p-5 border border-brand-500/30 animate-fade-up backdrop-blur-xl">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-widest">
                    Email Dispatched
                  </h3>
                  <p className="mt-1 text-[11px] text-neutral-400 font-bold leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="mt-6 w-full py-3.5 rounded-xl bg-white text-black font-black text-[9px] uppercase tracking-widest flex items-center justify-center shadow-xl hover:scale-[1.02] transition-all"
              >
                Finalize Restoration
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-danger-500/10 p-4 border border-danger-500/30 animate-shake backdrop-blur-xl">
                  <p className="text-[10px] font-black text-danger-400 uppercase tracking-widest text-center">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-4">
                  Credential Identity
                </label>
                <div className="relative group">
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 p-3 rounded-xl text-[11px] text-white placeholder-neutral-700 outline-none transition-all group-hover:border-white/10 group-focus:bg-white/[0.05]"
                    placeholder="institutional@staff.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.3em]
                    bg-brand-600 hover:bg-brand-500 text-white shadow-2xl shadow-brand-600/20
                    transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />{" "}
                    Transmitting...
                  </>
                ) : (
                  "Request Reset Protocol"
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-[9px] font-black text-neutral-800 uppercase tracking-widest leading-relaxed">
                  Encryption Status:{" "}
                  <span className="text-success-500">Secure</span>
                  <br />
                  Node Integrity:{" "}
                  <span className="text-brand-500">Verified</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
