"use client";

import React, { useEffect, useState, useCallback } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { io } from "socket.io-client";
import {
  Activity,
  ArrowUp,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Power,
  RefreshCw,
  Shield,
  TrendingUp,
  User,
  Users,
  X,
  Smartphone,
  Layers,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [summary, setSummary] = useState(null);

  // Completion state
  const [completingCustomer, setCompletingCustomer] = useState(null);
  const [nextSessionDate, setNextSessionDate] = useState("");
  const [msg, setMsg] = useState("");
  const [avgTime, setAvgTime] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const router = useRouter();

  async function loadAgent() {
    try {
      const meRes = await api.get("/auth/me");
      const userData = meRes.data;

      if (userData.role !== "AGENT" && userData.role !== "ORG_ADMIN") {
        router.push("/operator");
        return;
      }

      const res = await api.get("/agents/info");
      setAgent(res.data);
      setAvgTime(
        (
          res.data.avgSessionTime ||
          res.data.avgSessionDuration ||
          5
        ).toString(),
      );
    } catch (err) {
      if (err.response?.status === 401) router.push("/login");
    }
  }

  const loadQueue = useCallback(async () => {
    if (!agent?._id) return;
    try {
      const res = await api.get(`/queue/${agent._id}`);
      setQueue(res.data);
    } catch (err) {
      console.error("Load queue error", err);
    }
  }, [agent?._id]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await api.get("/queue/summary/today");
      setSummary(res.data);
    } catch (err) {
      console.error("Load summary error", err);
    }
  }, []);

  const loadUpcomingAppointments = useCallback(async () => {
    if (!agent?._id) return;
    try {
      const res = await api.get(`/appointments/agent/${agent._id}/upcoming`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Load upcoming appointments error", err);
    }
  }, [agent?._id]);

  useEffect(() => {
    loadAgent();
  }, []);

  useEffect(() => {
    if (!agent?._id) return;
    loadQueue();
    loadSummary();
    loadUpcomingAppointments();

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      },
    );
    socket.on("connect", () => {
      loadQueue();
      loadSummary();
      loadUpcomingAppointments();
    });
    socket.on("queue.updated", () => {
      loadQueue();
      loadSummary();
    });
    socket.on("queueUpdated", () => {
      loadQueue();
      loadSummary();
    });

    return () => {
      socket.disconnect();
    };
  }, [agent?._id]);

  async function updateAvgTime() {
    try {
      await api.put("/agents/update-session-duration", {
        avgSessionTime: Number(avgTime),
      });
      setAgent((prev) => ({ ...prev, avgSessionTime: Number(avgTime) }));
      showMsg("Average session duration updated");
    } catch (err) {
      console.error(err);
    }
  }

  async function changeAvailability(state) {
    try {
      await api.put("/agents/availability", {
        availability: state,
        statusMessage:
          state === "Unavailable" || state === "Not Available"
            ? statusMessage
            : "",
      });
      setAgent((prev) => ({
        ...prev,
        availability: state,
        statusMessage:
          state === "Unavailable" || state === "Not Available"
            ? statusMessage
            : "",
      }));
      if (state === "Available") setStatusMessage("");
      showMsg(`Status changed to: ${state}`);
    } catch (err) {
      console.error(err);
    }
  }

  async function prioritiseCustomer(customerId) {
    try {
      await api.put(`/queue/prioritise/${customerId}`);
      showMsg("Customer moved to top of queue");
      loadQueue();
    } catch (err) {
      showMsg("Error prioritising customer");
    }
  }

  async function handleCompleteCustomer() {
    if (!completingCustomer) return;
    try {
      await api.put(`/queue/complete/${completingCustomer._id}`, {
        nextSessionDate: nextSessionDate || null,
      });
      setCompletingCustomer(null);
      setNextSessionDate("");
      loadQueue();
      loadSummary();
      showMsg("Customer visit finalized!");
    } catch (err) {
      console.error(err);
    }
  }

  async function cancelCustomer(customerId) {
    if (
      !confirm(
        "Are you sure you want to cancel this customer's visit? This action is irreversible.",
      )
    )
      return;
    try {
      await api.put(`/queue/cancel/${customerId}`);
      showMsg("Customer visit cancelled");
      loadQueue();
      loadSummary();
    } catch (err) {
      console.error(err);
      showMsg("Error cancelling visit");
    }
  }

  function showMsg(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  }

  if (!agent) return <Loader message="Loading Agent Counter..." />;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header Strip */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Agent Counter
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      agent.availability === "Available"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    ● {agent.availability}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {agent.name} • {agent.serviceCategory || "General Service Desk"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadQueue}
                className="btn-secondary-white p-2.5 text-xs"
                title="Refresh Queue"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => router.push("/login")}
                className="btn-secondary-white text-xs px-4 py-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <Power className="w-3.5 h-3.5" /> End Shift
              </button>
            </div>
          </div>
        </ScrollReveal>

        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2.5 shadow-md animate-fade-down">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {msg}
          </div>
        )}

        {/* Today's Summary Metrics */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Served Today",
                value: summary?.completed ?? "0",
                icon: CheckCircle,
                textColor: "text-emerald-700",
                bg: "bg-emerald-50/50 border-emerald-100",
              },
              {
                label: "Currently Waiting",
                value: queue.length,
                icon: Users,
                textColor: "text-slate-900",
                bg: "bg-white border-slate-200",
              },
              {
                label: "Avg Session",
                value: summary?.avgConsultTime ? `${summary.avgConsultTime}m` : `${agent.avgSessionTime || 5}m`,
                icon: Clock,
                textColor: "text-slate-900",
                bg: "bg-white border-slate-200",
              },
              {
                label: "Busiest Window",
                value: summary?.busiestHour ?? "11:00 AM",
                icon: TrendingUp,
                textColor: "text-slate-900",
                bg: "bg-white border-slate-200",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${stat.bg}`}
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className={`text-3xl font-black font-mono ${stat.textColor}`}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls & Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <ScrollReveal direction="up" delay={150}>
              {/* Availability Mode */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <span className="eyebrow-tag mb-3">
                  ← DESK AVAILABILITY
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Counter Status
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => changeAvailability("Available")}
                    className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      agent.availability === "Available"
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Activity className="w-4 h-4" /> Available
                  </button>
                  <button
                    onClick={() => changeAvailability("Unavailable")}
                    className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      agent.availability === "Unavailable" || agent.availability === "Not Available"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Power className="w-4 h-4" /> Paused
                  </button>
                </div>

                {(agent.availability === "Unavailable" || agent.availability === "Not Available") && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <label className="text-xs font-bold text-slate-600">
                      Pause Notice Message
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={statusMessage}
                        onChange={(e) => setStatusMessage(e.target.value)}
                        placeholder="Back in 10 minutes..."
                        className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs outline-none focus:border-slate-900"
                      />
                      <button
                        onClick={() => changeAvailability("Unavailable")}
                        className="btn-primary-obsidian text-xs px-3 py-2"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Timing Speed Setting */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
                <span className="eyebrow-tag mb-3">
                  ← SESSION CADENCE
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-4">
                  Average Service Duration
                </h3>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={avgTime}
                    onChange={(e) => setAvgTime(e.target.value)}
                    className="w-24 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-center font-bold text-sm text-slate-900 outline-none focus:border-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-medium">Minutes</span>
                  <button
                    onClick={updateAvgTime}
                    className="btn-primary-obsidian text-xs px-4 py-2.5 ml-auto"
                  >
                    Save
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Live Stream Queue List */}
          <div className="lg:col-span-8">
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <span className="eyebrow-tag mb-1">
                      ← LIVE QUEUE FEED
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Waiting Room Lineup
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                    {queue.length} in line
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">
                      No visitors currently waiting
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      New check-ins will appear here automatically in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.map((p, idx) => (
                      <div
                        key={p._id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          idx === 0
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-900"
                        }`}
                      >
                        {/* Token & Visitor info */}
                        <div className="flex items-center gap-4">
                          <span
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-base ${
                              idx === 0
                                ? "bg-white text-slate-900 shadow-sm"
                                : "bg-white border border-slate-200 text-slate-900"
                            }`}
                          >
                            {p.tokenNumber}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`text-sm font-bold ${
                                  idx === 0 ? "text-white" : "text-slate-900"
                                }`}
                              >
                                {p.clientName || p.name}
                              </h4>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full">
                                  Now Serving
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs ${
                                idx === 0 ? "text-slate-300" : "text-slate-500"
                              }`}
                            >
                              Wait: ~
                              {p.estimatedWait ??
                                idx *
                                  (agent.avgSessionTime ||
                                    agent.avgSessionDuration ||
                                    5)}{" "}
                              mins {p.notes ? `• ${p.notes}` : ""}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {idx > 0 && idx < 3 && (
                            <button
                              onClick={() => prioritiseCustomer(p._id)}
                              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                              title="Prioritize to Next"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                          )}
                          {idx === 0 && (
                            <button
                              onClick={() => {
                                setCompletingCustomer(p);
                                setNextSessionDate("");
                              }}
                              className="px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <CheckCircle className="w-4 h-4" /> Complete Visit
                            </button>
                          )}
                          <button
                            onClick={() => cancelCustomer(p._id)}
                            className={`p-2.5 rounded-lg border transition-colors ${
                              idx === 0
                                ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-rose-900 hover:text-white"
                                : "border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                            }`}
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
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

        {/* Upcoming Appointments */}
        <ScrollReveal direction="up" delay={250}>
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="eyebrow-tag mb-1">
                  ← SCHEDULED SESSIONS
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Upcoming Appointments (Next 7 Days)
                </h3>
              </div>
              <button
                onClick={loadUpcomingAppointments}
                className="btn-secondary-white p-2 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {appointments.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500 font-medium">
                No upcoming appointments scheduled.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Client Name</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Notes</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => {
                      const dt = new Date(appt.scheduledAt);
                      return (
                        <tr key={appt._id} className="hover:bg-slate-50/60">
                          <td className="py-3 font-semibold text-slate-900">
                            {dt.toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 font-mono text-slate-600">
                            {dt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            {appt.clientName || appt.customerName}
                          </td>
                          <td className="py-3 text-slate-600 font-mono">
                            {appt.clientPhone || appt.phone || "—"}
                          </td>
                          <td className="py-3 text-slate-500 max-w-xs truncate">
                            {appt.notes || "—"}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Complete Visit Modal */}
      {completingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 animate-scale-in">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Finalize Visit
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Completing service for: <span className="font-bold text-slate-900">{completingCustomer.clientName || completingCustomer.name}</span>
            </p>

            <div className="space-y-4 mb-6">
              <label className="text-xs font-bold text-slate-700 block">
                Schedule Follow-up Return Date (Optional)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={nextSessionDate}
                onChange={(e) => setNextSessionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCompletingCustomer(null)}
                className="btn-secondary-white flex-1 py-3 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCustomer}
                className="btn-primary-obsidian flex-1 py-3 text-xs font-bold"
              >
                Complete Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
