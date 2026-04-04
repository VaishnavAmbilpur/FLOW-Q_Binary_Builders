'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Users, CheckCircle, Stethoscope, Activity, Copy, UserPlus,
  RefreshCw, X, ChevronDown, Phone, Clock, Share2, HeartPulse, ShieldAlert
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v2';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'sq_test_NjljZmJiOGU3ODQ0NTgyYjZmOTQ5YmZh_73d51f3f88a95e5de0dcddf867eb0f4c0614bf44b96ffbb589ecf1e883c35453';

export default function ReceptionistDashboard() {
  const [mounted, setMounted] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'add' | 'queue'>('add');
  const [form, setForm] = useState({ name: '', phone: '', serviceId: '' });
  const [error, setError] = useState('');

  // 1. Mount & Initial Load
  useEffect(() => {
    setMounted(true);
    const init = async () => {
      try {
        // Fetch Org Info
        const infoRes = await axios.get(`${API_BASE}/info`, {
          headers: { 'x-api-key': API_KEY }
        });
        setOrgData(infoRes.data.organization);

        const sRes = await axios.get(`${API_BASE}/services`, {
          headers: { 'x-api-key': API_KEY }
        });
        const svcData = (sRes.data.data || []).slice(0, 1);
        setServices(svcData);
        if (svcData.length > 0) {
          setForm(f => ({ ...f, serviceId: svcData[0].id }));
        }

        await loadQueue();
        setReady(true);
      } catch (err: any) {
        console.error('Init failed:', err.message);
        setError(`Connection failed: ${err.message}. Ensure backend is on 5000.`);
      }
    };
    init();
  }, []);

  // 2. Polling Effect
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      loadQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, [ready]);

  const [emptyCount, setEmptyCount] = useState(0);

  const sanitize = (text: string) => {
    if (!text) return '';
    return text
      .replace(/Doctor/gi, 'Merchant')
      .replace(/Patient/gi, 'Customer')
      .replace(/Clinic/gi, 'Store')
      .replace(/Hospital/gi, 'Merchant Hub');
  };

  const loadQueue = async () => {
    try {
      const res = await axios.get(`${API_BASE}/queue`, {
        headers: { 'x-api-key': API_KEY }
      });

      const newEntries = res.data.data || [];

      // Intelligent Sync Guard: To prevent flicker, we only clear the queue
      // if we get 2 consecutive empty results.
      if (queue.length > 0 && newEntries.length === 0) {
        if (emptyCount < 1) {
          console.warn('[Sync Guard] Ignoring first empty response to prevent UI flicker.');
          setEmptyCount(1);
          return;
        }
      }

      setQueue(newEntries);
      setEmptyCount(0); // Reset on data
    } catch (err) {
      console.error('Poll failed:', err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/queue/check-in`, {
        serviceId: form.serviceId,
        clientName: form.name.trim(),
        clientPhone: form.phone.trim()
      }, { headers: { 'x-api-key': API_KEY } });

      toast('Patient registered ✓');
      setForm({ ...form, name: '', phone: '' });
      await loadQueue();
      setTab('queue');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (uid: string, action: 'call' | 'complete' | 'cancel') => {
    try {
      await axios.patch(`${API_BASE}/queue/${uid}/action`, { action }, {
        headers: { 'x-api-key': API_KEY }
      });
      toast(`Patient ${action}ed ✓`);
      await loadQueue();
    } catch (err) {
      toast('Action failed');
    }
  };

  const toast = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const copyPhone = (phone: string) => {
    if (!phone) return toast('No phone');
    navigator.clipboard.writeText(phone);
    toast('Phone copied ✓');
  };

  const copyLink = (uid: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/status/${uid}`);
    toast('Link copied ✓');
  };

  if (!mounted) return null;

  const handleProvision = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/demo/provision`);
      const newKey = res.data.apiKey;
      // In a real app we'd save to .env or cookie, here we just refresh with a hint
      setError(`New Key Generated: ${newKey}. Update your .env.local and reload.`);
      console.log("PROVISIONED:", res.data);
      alert(`NEW API KEY GENERATED:\n\n${newKey}\n\nPlease copy this into your .env.local then refresh.`);
    } catch (err: any) {
      setError(`Provision failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#0a0a12] text-center p-6 text-white font-sans">
      <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 mb-8">
        <ShieldAlert className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black italic uppercase tracking-tight">Security Protocol Violation</h2>
      <p className="text-neutral-500 text-xs mt-3 max-w-sm font-bold uppercase tracking-widest leading-loose">
        {error.includes('401') ? 'The provided API Key is invalid or has been revoked by the security matrix.' : error}
      </p>

      <div className="flex flex-col gap-4 mt-12">
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Retry Current Key</button>
        {error.includes('401') && (
          <button onClick={handleProvision} disabled={loading} className="px-10 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:scale-105 transition-all">
            {loading ? 'Generating Node...' : 'Provision Fresh Sandbox'}
          </button>
        )}
      </div>
    </div>
  );

  if (!ready && queue.length === 0) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a12]">
      <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white font-sans selection:bg-blue-500/30">

      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-md sticky top-0 z-40 bg-[#0a0a12]/80">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl transform -rotate-3 border-2 border-white/10">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight uppercase italic">{sanitize(orgData?.name) || 'Reception Matrix'}</h1>
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em]">Merchant Support Wing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full text-[9px] text-emerald-500 font-bold uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit mb-12">
          <button
            onClick={() => setTab('add')}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'add' ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)]' : 'text-neutral-500 hover:text-white'
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Customer
          </button>
          <button
            onClick={() => setTab('queue')}
            className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'queue' ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.3)]' : 'text-neutral-500 hover:text-white'
              }`}
          >
            <Users className="w-3.5 h-3.5" /> Customer Queue {queue.length > 0 && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-[9px] font-mono">{queue.length}</span>}
          </button>
        </div>

        {tab === 'add' ? (
          /* Enrollment Form */
          <div className="animate-fade-up max-w-2xl">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">New Enrollment</h2>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Customer Registration System</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest italic ml-1 font-sans">Customer Name</label>
                  <input
                    placeholder="Enter full name"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[13px] text-white placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all shadow-inner"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest italic ml-1 font-sans">Contact Mobile</label>
                  <input
                    placeholder="e.g. 91 00000 00000"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[13px] text-white placeholder-neutral-800 outline-none focus:border-blue-500/40 transition-all shadow-inner"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest italic ml-1 font-sans">Agent Hub</label>
                <div className="relative">
                  <select
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[13px] text-white outline-none appearance-none cursor-pointer focus:border-blue-500/40 transition-all shadow-inner"
                    value={form.serviceId}
                    onChange={e => setForm({ ...form, serviceId: e.target.value })}
                    required
                  >
                    {services.map(s => {
                      const displayTitle = sanitize(s.name.toLowerCase().includes('dental') ? 'Barber' : s.name);
                      return (
                        <option key={s.id} value={s.id} className="bg-[#0a0a12]">{displayTitle}</option>
                      );
                    })}
                    {services.length === 0 && <option value="" className="bg-[#0a0a12]">No Specialization Found</option>}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !form.name.trim()}
                className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(37,99,235,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Activity className="w-4 h-4 animate-spin" /> : 'Register Customer'}
              </button>
            </form>
          </div>
        ) : (
          /* Active Queue */
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Active Queue</h3>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mt-1">{queue.length} Active in Service-Flow</p>
              </div>
              <button
                onClick={loadQueue}
                className="p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {queue.length === 0 ? (
              <div className="py-32 text-center rounded-[2.5rem] border border-dashed border-white/5 bg-white/[0.01]">
                <Activity className="w-12 h-12 text-neutral-800 mx-auto mb-6 animate-pulse" />
                <h4 className="text-base font-black text-neutral-700 uppercase tracking-widest italic opacity-50">Lounge Empty</h4>
              </div>
            ) : (
              <div className="space-y-4">
                {queue.filter(e => e.status === 'waiting' || e.status === 'serving').map((entry) => (
                  <div
                    key={entry.uniqueLinkId}
                    className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
                      {entry.tokenNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white truncate uppercase italic tracking-tight">{entry.clientName}</h4>
                      <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                          <Activity className={`w-3 h-3 ${entry.status === 'serving' ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`} />
                          <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">{entry.status}</span>
                        </div>
                        <span className="text-[10px] text-blue-500/70 font-bold uppercase tracking-widest italic truncate max-w-[200px]">
                          {sanitize((entry.serviceId?.name || 'General').toLowerCase().includes('dental') ? 'Barber' : (entry.serviceId?.name || 'General'))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => copyPhone(entry.clientPhone)} className="p-3 rounded-xl hover:bg-blue-500/10 text-neutral-600 hover:text-blue-400 transition-all"><Phone size={14} /></button>
                      <button onClick={() => copyLink(entry.uniqueLinkId)} className="p-3 rounded-xl hover:bg-blue-500/10 text-neutral-600 hover:text-blue-400 transition-all"><Share2 size={14} /></button>
                      <div className="h-4 w-px bg-white/5 mx-1" />
                      <button onClick={() => handleAction(entry.uniqueLinkId, entry.status === 'waiting' ? 'call' : 'complete')} className="p-3 rounded-xl hover:bg-emerald-500/10 text-neutral-600 hover:text-emerald-400 transition-all"><CheckCircle size={14} /></button>
                      <button onClick={() => handleAction(entry.uniqueLinkId, 'cancel')} className="p-3 rounded-xl hover:bg-red-500/10 text-neutral-600 hover:text-red-400 transition-all"><X size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Diagnostics Hub (Hidden in HUD) */}
      <div className="max-w-4xl mx-auto px-6 mt-12 mb-12">
        <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-dashed border-amber-500/20">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert size={16} className="text-amber-500" />
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Diagnostic Telemetry</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-[9px] text-neutral-600 leading-relaxed tabular-nums">
            <div className="space-y-1">
              <p>📍 ORG_ID: {orgData?.id || 'UNSET'}</p>
              <p>🔍 ORG_NAME: {orgData?.name || 'UNSET'}</p>
              <p>📡 PORT_BIND: localhost:5000</p>
            </div>
            <div className="space-y-1">
              <p>👥 QUEUE_LOCAL_COUNT: {queue.length}</p>
              <p>⚠️ LAST_SYNC: {new Date().toLocaleTimeString()}</p>
              <p>🧪 SERVICES_LOADED: {services.length ? 'YES' : 'NO'}</p>
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-4 bg-blue-600 text-white rounded-[2rem] shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] transform transition-all z-50 animate-fade-up">
          {msg}
        </div>
      )}

      <style jsx>{`
        .animate-fade-up {
          animation: fadeUp 0.5s ease-out forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
