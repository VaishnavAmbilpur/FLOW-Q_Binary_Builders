"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import api from "@/services/api";

import { useAuthStore } from "@/store";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(!isAuthenticated);

  useEffect(() => {
    // Instant pass if already authenticated in store
    if (isAuthenticated) {
      setLoading(false);
      return;
    }

    // Try to recover session from cookie/API
    api
      .get("/auth/me")
      .then((res) => {
        const user = res.data;
        const token = localStorage.getItem("accessToken") || "";
        setAuth(user, token);
        setLoading(false);
      })
      .catch(() => {
        clearAuth();
        router.push("/login");
      });
  }, [router, isAuthenticated, setAuth, clearAuth]);

  if (loading) return <Loader />;

  return <>{children}</>;
}
