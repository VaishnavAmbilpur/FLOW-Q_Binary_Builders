"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowLeft,
  Code,
  Key,
  Globe,
  Lock,
  Copy,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Zap,
  ShieldCheck,
  Terminal,
  Sparkles,
  Loader2,
  RefreshCw,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionData, setProvisionData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [provisionError, setProvisionError] = useState(null);

  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleGenerateKey = async () => {
    setIsProvisioning(true);
    setProvisionError(null);
    try {
      const res = await fetch("http://localhost:5000/api/v2/demo/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setProvisionData(data);
      } else {
        setProvisionError(data.message || "Failed to provision sandbox key");
      }
    } catch (err) {
      setProvisionError("Could not connect to backend server. Make sure backend is running on port 5000.");
    } finally {
      setIsProvisioning(false);
    }
  };

  const copyKeyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/v2/demo/provision",
      title: "1. Instant API Key & Sandbox Provisioning",
      desc: "Instantly create a sandbox organization with demo services and generate an active x-api-key for testing.",
      headers: [{ key: "Content-Type", val: "application/json" }],
      curl: `curl -X POST http://localhost:5000/api/v2/demo/provision \\
  -H "Content-Type: application/json"`,
      response: `{
  "success": true,
  "message": "Sandbox environment provisioned",
  "apiKey": "sq_test_NmFhNDBhN2RiMjVjOTk3YjExYjA..._a8fecf26081132ad",
  "organizationId": "6aa40a7db25c997b11b0533e",
  "organizationName": "Sandbox Organization #A4B29"
}`,
    },
    {
      method: "GET",
      path: "/api/v2/info",
      title: "2. Inspect Organization & Quota Details",
      desc: "Fetch organization subscription tier, settings, and location metadata using your API key.",
      headers: [
        { key: "x-api-key", val: "<YOUR_API_KEY>" },
        { key: "Accept", val: "application/json" },
      ],
      curl: `curl -X GET http://localhost:5000/api/v2/info \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE"`,
      response: `{
  "success": true,
  "organization": {
    "id": "6aa40a7db25c997b11b0533e",
    "name": "Sandbox Organization #A4B29",
    "subscriptionPlan": "Growth",
    "status": "Active",
    "settings": {
      "allowWalkIn": true,
      "allowAppointments": true,
      "kioskEnabled": true
    }
  }
}`,
    },
    {
      method: "GET",
      path: "/api/v2/services",
      title: "3. Discover Active Service Categories",
      desc: "List all service types, average session durations, and current live queue lengths for your organization.",
      headers: [{ key: "x-api-key", val: "<YOUR_API_KEY>" }],
      curl: `curl -X GET http://localhost:5000/api/v2/services \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE"`,
      response: `{
  "success": true,
  "data": [
    {
      "id": "6aa40a7db25c997b11b0533e",
      "name": "General Consultation",
      "category": "General",
      "avgSessionDuration": 15,
      "currentQueueLength": 2,
      "estimatedWaitMins": 30
    }
  ],
  "total": 1
}`,
    },
    {
      method: "POST",
      path: "/api/v2/queue",
      title: "4. Enqueue Customer / Create Ticket",
      desc: "Add a walk-in or API visitor to the real-time queue. Automatically calculates wait times and issues a live tracking link.",
      headers: [
        { key: "x-api-key", val: "<YOUR_API_KEY>" },
        { key: "Content-Type", val: "application/json" },
      ],
      curl: `curl -X POST http://localhost:5000/api/v2/queue \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "6aa40a7db25c997b11b0533e",
    "clientName": "Jane Doe",
    "clientPhone": "+1 (555) 019-2831",
    "priority": "HIGH",
    "notes": "VIP Priority Consult"
  }'`,
      response: `{
  "success": true,
  "tokenNumber": 1,
  "uniqueLinkId": "55257fa2-e2e4-4dd0-960a-8365f7e591ce",
  "queueEntryId": "6aa40a7db25c997b11b05342",
  "statusLink": "/v2/queue/55257fa2-e2e4-4dd0-960a-8365f7e591ce",
  "estimatedWaitMins": 0
}`,
    },
    {
      method: "GET",
      path: "/api/v2/queue/:uniqueLinkId",
      title: "5. Real-Time Ticket Status & Queue Position",
      desc: "Poll or fetch the live position, servicing agent, and countdown state for a specific customer ticket link.",
      headers: [{ key: "x-api-key", val: "<YOUR_API_KEY>" }],
      curl: `curl -X GET http://localhost:5000/api/v2/queue/55257fa2-e2e4-4dd0-960a-8365f7e591ce \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE"`,
      response: `{
  "success": true,
  "data": {
    "status": "waiting",
    "tokenNumber": 1,
    "clientName": "Jane Doe",
    "position": 1,
    "estimatedWaitMins": 0,
    "createdAt": "2026-09-11T14:04:50.000Z"
  }
}`,
    },
    {
      method: "POST",
      path: "/api/v2/webhooks/test",
      title: "6. Test Webhook Event Dispatcher",
      desc: "Simulate a live webhook event (queue.created, queue.updated, queue.completed) to verify your receiver endpoint.",
      headers: [
        { key: "x-api-key", val: "<YOUR_API_KEY>" },
        { key: "Content-Type", val: "application/json" },
      ],
      curl: `curl -X POST http://localhost:5000/api/v2/webhooks/test \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "queue.created"
  }'`,
      response: `{
  "success": true,
  "message": "Test webhook for 'queue.created' dispatched."
}`,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-sm">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-black">
                FLOW-Q
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-0.5">
                B2B REST API &amp; SDK
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="btn-secondary-white text-xs px-4 py-2 font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <a
              href="http://localhost:5000/api-docs/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-obsidian text-xs px-4 py-2 font-bold flex items-center gap-2"
            >
              Swagger UI <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <ScrollReveal direction="up" delay={50}>
          {/* Eyebrow & Hero */}
          <div className="mb-4">
            <span className="eyebrow-tag">
              ← DEVELOPER &amp; B2B INTEGRATION SPEC
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-4">
            FLOW-Q API Reference
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mb-8">
            Build zero-friction queue check-ins, realtime wallboards, and patient waitlist sync directly inside your application using our headless REST and WebSocket API.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800">
              <Globe className="w-3.5 h-3.5 text-slate-500" /> Base URL: http://localhost:5000/api
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> AES-256 PII Protection
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
              <Zap className="w-3.5 h-3.5 text-slate-500" /> Sub-5ms WebSocket Broadcasts
            </div>
          </div>
        </ScrollReveal>

        {/* Live Instant API Key Generator Box */}
        <ScrollReveal direction="up" delay={100}>
          <div className="surface-card p-6 sm:p-8 bg-slate-900 text-white rounded-2xl mb-12 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
                  <Key className="w-3.5 h-3.5" /> Instant API Key Generation
                </div>
                <h2 className="text-xl font-black text-white">
                  Generate Live Sandbox API Key
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Provision an isolated sandbox tenant and get an instant <code className="text-slate-200 font-mono">x-api-key</code> to test any endpoint.
                </p>
              </div>

              <button
                onClick={handleGenerateKey}
                disabled={isProvisioning}
                className="btn-secondary-white text-xs px-5 py-3 font-bold bg-white text-black hover:bg-slate-100 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" /> Provisioning...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" /> Generate API Key
                  </>
                )}
              </button>
            </div>

            {provisionError && (
              <div className="mt-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {provisionError}
              </div>
            )}

            {provisionData && (
              <div className="mt-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Your Active API Key (Use in <code className="text-emerald-400">x-api-key</code> Header):
                  </span>
                  <div className="flex items-center gap-2 bg-black/80 border border-slate-700 p-3 rounded-xl">
                    <code className="text-xs font-mono text-emerald-400 flex-1 break-all select-all">
                      {provisionData.apiKey}
                    </code>
                    <button
                      onClick={() => copyKeyText(provisionData.apiKey)}
                      className="btn-secondary-white text-[11px] px-3 py-1.5 font-bold flex items-center gap-1.5 flex-shrink-0"
                    >
                      {copiedKey ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Key
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Organization ID
                    </span>
                    <span className="font-mono text-white font-bold">
                      {provisionData.organizationId}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Tenant Name
                    </span>
                    <span className="text-white font-bold">
                      {provisionData.organizationName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Authentication Scheme Card */}
        <ScrollReveal direction="up" delay={120}>
          <div className="surface-card p-6 sm:p-8 bg-white border border-slate-200 mb-12">
            <div className="flex items-center gap-2 text-black font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <Lock className="w-4 h-4" /> Header Authentication Protocol
            </div>
            <h2 className="text-xl font-black text-black mb-3">
              How to Authenticate B2B API Requests
            </h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              All B2B v2 endpoints require the <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs text-black font-bold">x-api-key</code> HTTP request header. Keys are scoped directly to your organization and automatically enforce multi-tenant database isolation.
            </p>

            <div className="bg-black text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {`# Example Authenticated Request
curl -X GET http://localhost:5000/api/v2/info \\
  -H "x-api-key: sq_test_YOUR_KEY_HERE" \\
  -H "Accept: application/json"`}
            </div>
          </div>
        </ScrollReveal>

        {/* Endpoints List */}
        <div className="space-y-10">
          {endpoints.map((ep, idx) => (
            <ScrollReveal key={ep.path} direction="up" delay={150 + idx * 40}>
              <div className="surface-card p-6 sm:p-8 bg-white border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono text-xs font-black px-2.5 py-1 rounded-md text-white ${
                        ep.method === "POST" ? "bg-black" : "bg-slate-700"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-bold text-black">
                      {ep.path}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700">
                    {ep.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {ep.desc}
                </p>

                {/* Headers */}
                {ep.headers && ep.headers.length > 0 && (
                  <div className="mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Required Headers
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {ep.headers.map((h, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-bold text-black">{h.key}:</span>
                          <span className="text-slate-500">{h.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Snippet */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Request Example
                    </span>
                    <button
                      onClick={() => copyCode(ep.curl, idx)}
                      className="btn-secondary-white text-[11px] px-2.5 py-1 flex items-center gap-1.5"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy cURL
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-black text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                    {ep.curl}
                  </pre>

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pt-2">
                    Response Payload (200 / 201)
                  </span>
                  <pre className="bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                    {ep.response}
                  </pre>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Swagger Footer Banner */}
        <ScrollReveal direction="up" delay={300}>
          <div className="mt-16 p-8 bg-black text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-xl font-black mb-1">
                Explore Full Interactive Swagger Console
              </h3>
              <p className="text-xs text-slate-300">
                Execute live requests, test endpoints, and view JSON schemas in real-time.
              </p>
            </div>
            <a
              href="http://localhost:5000/api-docs/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-slate-100 text-xs flex items-center gap-2 flex-shrink-0"
            >
              Launch Swagger UI <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </ScrollReveal>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} FLOW-Q Queue System. Headless B2B SaaS Architecture.</p>
      </footer>
    </div>
  );
}
