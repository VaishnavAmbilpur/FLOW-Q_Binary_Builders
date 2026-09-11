"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import {
  History,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Briefcase,
  Clock,
  Activity,
  FileText,
  Copy,
} from "lucide-react";
import Loader from "@/components/Loader";
import ScrollReveal from "@/components/ScrollReveal";

export default function HistoryDashboard() {
  const [history, setHistory] = useState([]);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const initializeHistory = async () => {
      try {
        setLoading(true);
        const userRes = await api.get("/auth/me");
        const userData = userRes.data;
        setUser(userData);

        if (userData.role === "OPERATOR") {
          setAgents(userData.assignedAgents || []);
        } else if (userData.role === "ORG_ADMIN") {
          const staffRes = await api.get("/organizations/staff");
          const allStaff = staffRes.data || [];
          const agentsList = allStaff.filter((s) => s.role === "AGENT");
          setAgents(agentsList);
        }
      } catch (err) {
        setError("Failed to initialize. Please login again.");
        setLoading(false);
      }
    };

    initializeHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError("");
      const params = { date, status, search };
      if (
        (user.role === "OPERATOR" || user.role === "ORG_ADMIN") &&
        selectedAgentId
      ) {
        params.agentId = selectedAgentId;
      }
      const res = await api.get(`/queue/history/`, { params });
      setHistory(res.data);
    } catch (err) {
      setError("Failed to load history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadHistory();
  }, [user, selectedAgentId]);

  const showMsg = (text, type) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  };

  const copyTrackingId = (uid) => {
    navigator.clipboard.writeText(uid);
    showMsg("Tracking ID copied", "success");
  };

  if (loading && !user) return <Loader message="Loading History Logs..." />;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Waitlist History &amp; Logs
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Search past customer entries, completed visits, and service timestamps
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Filter by Agent</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="">All Service Desks</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.serviceCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Visit Status</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All Records</option>
                  <option value="completed">Completed Visits</option>
                  <option value="cancelled">Cancelled Visits</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Search Visitor</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      placeholder="Search visitor name or token..."
                      className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl text-xs outline-none focus:border-slate-900 focus:bg-white"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={loadHistory}
                    className="btn-primary-obsidian text-xs px-5 py-3 font-bold"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {msg}
          </div>
        )}

        {/* Results */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            {loading ? (
              <p className="text-center py-16 text-xs text-slate-400">Loading records...</p>
            ) : history.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold">No historical entries found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((p) => (
                  <div
                    key={p._id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                          #{p.tokenNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                          <p className="text-xs text-slate-500">Agent: {p.agentId?.name || "Specialist"}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-xs text-slate-600 mb-4 bg-white p-2.5 rounded-lg border border-slate-100">
                        {p.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs text-slate-500 font-medium">
                      <span>
                        {p.completedAt
                          ? new Date(p.completedAt).toLocaleDateString([], { month: "short", day: "numeric" }) +
                            " at " +
                            new Date(p.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Archived"}
                      </span>
                      <button
                        onClick={() => copyTrackingId(p._id)}
                        className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Copy ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
