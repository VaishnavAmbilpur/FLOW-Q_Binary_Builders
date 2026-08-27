"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { MonitorPlay, Stethoscope, ArrowRight } from "lucide-react";
import io from "socket.io-client";

export default function DisplayBoard() {
  const params = useParams();
  const organizationId = params.organizationId;
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDisplayData = async () => {
    try {
      const res = await api.get(`/kiosk/${organizationId}/display`);
      if (res.data.success) {
        setAgents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load display data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!organizationId) return;

    loadDisplayData();

    // WebSocket Integration for real-time TV re-rendering
    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      },
    );

    socket.on("connect", () => {
      console.log("Connected to display socket");
      socket.emit("joinOrganizationPublicRoom", organizationId);
      loadDisplayData();
    });

    socket.on("queueUpdated", () => {
      console.log(
        "Queue Update Received via Socket, Reloading Display Data...",
      );
      loadDisplayData();
    });

    socket.on("agentAvailabilityChanged", () => {
      console.log(
        "Agent Availability Changed via Socket, Reloading Display Data...",
      );
      loadDisplayData();
    });

    // Polling fallback (typical for digital signage to ensure it never gets stuck)
    const interval = setInterval(() => {
      loadDisplayData();
    }, 10000);

    return () => {
      socket.off("queueUpdated");
      socket.off("agentAvailabilityChanged");
      socket.disconnect();
      clearInterval(interval);
    };
  }, [organizationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0c0516] flex items-center justify-center transition-colors">
        <div className="w-24 h-24 border-8 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden flex flex-col p-12 transition-all">
      {/* Ambient Signage Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

      {/* Header Area */}
      <header className="flex items-center justify-between mb-16 relative z-10 border-b border-white/5 pb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
            <MonitorPlay className="w-12 h-12 text-brand-400" />
          </div>
          <div>
            <h1 className="text-6xl font-black tracking-tighter text-white mb-2 uppercase">
              Organization Board
            </h1>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.6em]">
              Command Center <span className="mx-4 text-neutral-800">/</span>{" "}
              Real-Time Display Service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-1">
              Standard Time
            </p>
            <p className="text-6xl font-black font-mono tracking-tighter tabular-nums bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Matrix View */}
      <main className="flex-1 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12 content-start">
        {agents.length === 0 ? (
          <div className="col-span-full h-[60vh] flex flex-col items-center justify-center text-center opacity-40">
            <Activity className="w-20 h-20 text-neutral-700 mb-8 animate-pulse" />
            <p className="text-4xl text-neutral-700 font-black uppercase tracking-widest">
              No Active Queue Found
            </p>
          </div>
        ) : (
          agents.map((doc, index) => (
            <div
              key={doc.agentId}
              className="group bg-white/[0.03] border border-white/5 rounded-[4rem] p-12 transition-all duration-700 backdrop-blur-2xl flex flex-col justify-between shadow-2xl hover:bg-white/[0.05] hover:border-white/10 animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="mb-12 relative">
                <div className="flex items-center gap-6 mb-4">
                  <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-[1.5rem] flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-4xl font-black tracking-tight truncate uppercase pr-4">
                      {doc.agentName}
                    </h2>
                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.4em] mt-1">
                      {doc.serviceCategory}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`relative rounded-[3rem] p-12 border transition-all duration-700 shadow-2xl overflow-hidden ${doc.servingToken !== "---" ? "bg-white text-black border-white" : "bg-black/40 border-white/5 text-neutral-700"}`}
              >
                {doc.servingToken !== "---" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-transparent pointer-events-none opacity-50" />
                )}
                <p
                  className={`text-[10px] font-black uppercase tracking-[0.5em] mb-4 text-center ${doc.servingToken !== "---" ? "text-black/40" : "text-neutral-800"}`}
                >
                  Currently Serving
                </p>
                <div className="flex items-center justify-center">
                  <span
                    className={`text-[11rem] font-black leading-none tracking-tighter font-mono drop-shadow-2xl transition-all duration-700 ${doc.servingToken !== "---" ? "scale-105" : "scale-100 opacity-20"}`}
                  >
                    {doc.servingToken}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Global Ticker */}
      <footer className="mt-16 h-24 bg-white/5 border border-white/5 rounded-[2rem] flex items-center relative z-10 overflow-hidden backdrop-blur-xl">
        <div className="w-48 h-full bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.5em] flex items-center justify-center border-r border-white/10 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
          System Hub
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap flex items-center gap-16 animate-marquee">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <span className="text-neutral-500 text-xl font-black uppercase tracking-widest flex items-center gap-4">
                  <ArrowRight className="w-6 h-6 text-brand-400" /> Watch for
                  your number to pulsate on the matrix.
                </span>
                <span className="text-neutral-500 text-xl font-black uppercase tracking-widest flex items-center gap-4">
                  <ArrowRight className="w-6 h-6 text-brand-400" /> Self-service
                  nodes bridge the check-in gap instantly.
                </span>
                <span className="text-neutral-500 text-xl font-black uppercase tracking-widest flex items-center gap-4">
                  <ArrowRight className="w-6 h-6 text-brand-400" /> Wait times
                  are approximate and reflect current status.
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}

const Activity = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
