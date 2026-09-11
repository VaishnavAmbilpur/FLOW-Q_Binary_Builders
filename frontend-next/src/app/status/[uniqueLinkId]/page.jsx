"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { socket } from "@/services/socket";
import Loader from "@/components/Loader";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  Layers,
  Copy,
  ChevronRight,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function CustomerStatusView() {
  const { uniqueLinkId } = useParams();

  const [data, setData] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [agentStatus, setAgentStatus] = useState("Available");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const formatTime = (mins) => {
    if (mins == null) return "--";
    if (mins >= 60) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
  };

  const loadStatus = async () => {
    try {
      const res = await api.get(`/queue/status/${uniqueLinkId}`);

      if (res.data.status === "completed") {
        setCompleted(true);
        return;
      }
      if (res.data.status === "cancelled") {
        setCancelled(true);
        return;
      }

      if (res.data.agentAvailability) {
        setAgentStatus(res.data.agentAvailability);
      }

      setData(res.data);

      const me = res.data?.queue?.find((p) => p.isMe);
      let calculatedMins = 0;

      if (me?.waitMinutes != null) {
        calculatedMins = me.waitMinutes;
      } else if (res.data?.myPosition != null) {
        const peopleBefore = res.data.myPosition - 1;
        const avg = res.data.avgTime || 5;
        calculatedMins = peopleBefore * avg;
      }

      const storageKey = `wait_time_${uniqueLinkId}`;
      const saved = localStorage.getItem(storageKey);
      const now = Date.now();

      if (saved) {
        const {
          value,
          timestamp,
          position: savedPos,
          avg: savedAvg,
        } = JSON.parse(saved);
        const elapsedMins = Math.floor((now - timestamp) / 60000);

        if (
          savedPos === res.data.myPosition &&
          savedAvg === res.data.avgTime &&
          value - elapsedMins > 0
        ) {
          setRemainingMinutes(value - elapsedMins);
        } else {
          setRemainingMinutes(calculatedMins);
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              value: calculatedMins,
              timestamp: now,
              position: res.data.myPosition,
              avg: res.data.avgTime,
            }),
          );
        }
      } else {
        setRemainingMinutes(calculatedMins);
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            value: calculatedMins,
            timestamp: now,
            position: res.data.myPosition,
            avg: res.data.avgTime,
          }),
        );
      }

      socket.connect();
      socket.emit("joinAgentPublicRoom", {
        organizationId: res.data.organizationId,
        agentId: res.data.agentId,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!uniqueLinkId) return;
    loadStatus();

    socket.connect();
    socket.on("connect", () => {
      socket.emit("joinCustomerRoom", uniqueLinkId);
      loadStatus();
    });

    socket.on("visitCompleted", () => setCompleted(true));
    socket.on("visitCancelled", () => setCancelled(true));
    socket.on("queueUpdated", loadStatus);

    socket.on("agentAvailabilityChanged", (payload) => {
      if (
        payload.agentId === data?.agentId ||
        payload.agentId === data?.agent?._id
      ) {
        setAgentStatus(payload.availability);
        if (payload.availability === "Available") loadStatus();
      }
    });

    return () => {
      socket.off("connect");
      socket.off("visitCompleted");
      socket.off("visitCancelled");
      socket.off("queueUpdated");
      socket.off("agentAvailabilityChanged");
    };
  }, [uniqueLinkId]);

  useEffect(() => {
    if (remainingMinutes == null) return;
    if (agentStatus !== "Available") return;

    const interval = setInterval(() => {
      setRemainingMinutes((prev) => {
        const newVal = prev && prev > 0 ? prev - 1 : 0;
        localStorage.setItem(
          `wait_time_${uniqueLinkId}`,
          JSON.stringify({
            value: newVal,
            timestamp: Date.now(),
            position: data?.myPosition,
            avg: data?.avgTime,
          }),
        );
        return newVal;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [remainingMinutes, agentStatus, data?.myPosition, uniqueLinkId]);

  if (loading) return <Loader message="Connecting to Live Tracker..." />;

  if (cancelled)
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-900 px-6 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Visit Cancelled
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your place in the queue has been cancelled. Please check in with the reception desk if you require assistance.
          </p>
        </div>
      </div>
    );

  if (completed)
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-900 px-6 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Visit Completed
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Thank you for visiting {data?.organizationName || "us"}. Have a wonderful day ahead!
          </p>
        </div>
      </div>
    );

  if (!data) return <Loader message="Syncing Ticket..." />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white font-sans py-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        <ScrollReveal direction="up" delay={50}>
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <span className="eyebrow-tag mb-2">
              ← LIVE PASS TRACKER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
              {data.organizationName || "Waiting Room"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Real-time waiting pass for {data.myClientName || data.name || "Guest"}
            </p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      setMsg("Link copied to clipboard!");
                      setTimeout(() => setMsg(""), 3000);
                    });
                  }
                }}
                className="btn-secondary-white text-xs px-4 py-2 font-bold flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Pass Link
              </button>
            </div>
            {msg && (
              <p className="text-xs text-emerald-600 font-bold mt-2 animate-fade-down">
                {msg}
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* Position & Time Hero Card */}
        <ScrollReveal direction="up" delay={100}>
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">
              YOUR LIVE POSITION
            </span>
            <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white mb-4">
              #{data.myPosition}
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700/60 px-4 py-2 rounded-full text-xs font-bold text-slate-200 mb-6">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>
                Estimated Wait:{" "}
                <span className="text-white font-mono font-black">
                  {agentStatus === "Available" ? formatTime(remainingMinutes) : "Paused"}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-left">
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Number</span>
                <span className="text-lg font-mono font-bold text-white">#{data.myTokenNumber}</span>
              </div>
              <div className="bg-slate-800/60 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Desk Status</span>
                <span className={`text-xs font-bold ${agentStatus === "Available" ? "text-emerald-400" : "text-amber-400"}`}>
                  ● {agentStatus === "Available" ? "Agent Serving" : "Desk Paused"}
                </span>
              </div>
            </div>

            {data.myPosition <= 3 && agentStatus === "Available" && (
              <div className="mt-6 bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-xl flex items-center gap-3 text-left">
                <AlertTriangle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-200">
                  Almost your turn! Please make your way toward the counter.
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Live Lineup View */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Current Queue Order
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {data.queue.length} Total
              </span>
            </div>

            <div className="space-y-2">
              {data.queue.map((p) => (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    p.isMe
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 border-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm">
                      #{p.tokenNumber}
                    </span>
                    <span className={`text-xs font-bold ${p.isMe ? "text-white" : "text-slate-700"}`}>
                      {p.isMe ? "You" : "Customer in Line"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.isMe ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    Position {p.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
          Powered by FLOW-Q Systems
        </p>
      </div>
    </div>
  );
}
