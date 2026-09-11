"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { ArrowLeft, Activity, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function ResetPassword() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Link may be invalid or expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-slate-50 text-slate-900 font-sans">
        <div className="w-full max-w-[400px] bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            Password Reset Complete
          </h3>
          <p className="text-xs text-slate-600 mb-6">
            Your password has been successfully updated. Redirecting to login in 3 seconds...
          </p>
          <Link
            href="/login"
            className="btn-primary-obsidian w-full py-3 text-xs font-bold"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-6 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-[400px]">
        <ScrollReveal direction="up" delay={50}>
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
                ← SECURITY CREDENTIALS
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Set New Password
              </h1>
              <p className="text-slate-600 text-xs">
                Create a strong password with at least 8 characters.
              </p>
            </div>

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
                  New Password
                </label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  placeholder="Min 8 characters"
                  disabled={isLoading}
                  minLength={8}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  placeholder="Confirm password"
                  disabled={isLoading}
                  minLength={8}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="show-password"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                />
                <label
                  htmlFor="show-password"
                  className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                >
                  Show password text
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary-obsidian w-full py-3.5 text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" /> Saving password...
                  </>
                ) : (
                  "Update & Save Password"
                )}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
