"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { io } from "socket.io-client";
import { 
    Users, FileText, CheckCircle, Clock, Power, Activity, 
    ShieldAlert, ArrowUp, ArrowDown, GripVertical, Smartphone, Copy, 
    Calendar, UserPlus, RefreshCw, CalendarPlus, MonitorSmartphone, X,
    ChevronRight, MapPin, Search, Bell, User as UserIcon, Briefcase
} from "lucide-react";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
    useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function OperatorDashboard() {
    const [operator, setOperator] = useState<any>(null);
    const [organization, setOrganization] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [availabilities, setAvailabilities] = useState<Record<string, any>>({});
    const [completedCount, setCompletedCount] = useState(0);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<string>("add"); // add, queue, appointments
    const [activeTab, setActiveTab] = useState<'walkin' | 'appointment'>('walkin');
    
    const [form, setForm] = useState({ 
        name: "", 
        email: "", 
        phone: "", 
        notes: "", 
        priority: "NORMAL", 
        agentId: "" 
    });
    
    const [appointmentForm, setAppointmentForm] = useState({ 
        name: "", 
        email: "", 
        phone: "", 
        scheduledAt: "", 
        notes: "", 
        agentId: "" 
    });
    
    const [lastAddedLink, setLastAddedLink] = useState<string>("");
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    async function loadOperator() {
        try {
            const meRes = await api.get("/auth/me");
            const userData = meRes.data;

            if (userData.role !== "OPERATOR" && userData.role !== "ORG_ADMIN") {
                router.push("/agent");
                return;
            }
            
            if (userData.role === 'ORG_ADMIN') {
                const staffRes = await api.get("/organizations/staff");
                const allStaff = staffRes.data || [];
                const operatorsList = allStaff.filter((s: any) => s.role === "OPERATOR");
                if (operatorsList.length > 0) {
                    setOperator(operatorsList[0]);
                } else {
                    router.push("/org-admin/dashboard");
                }
            } else {
                setOperator(userData);
            }
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/login");
        }
    }

    useEffect(() => {
        loadOperator();
    }, []);

    useEffect(() => {
        if (!operator) return;
        api.get("/organizations/info").then((res) => {
            setOrganization(res.data?.organizationId);
        }).catch(() => {});

        if (operator.assignedAgents) {
            const initial: Record<string, any> = {};
            operator.assignedAgents.forEach((a: any) => {
                initial[a._id] = { availability: a.availability || 'Available', pauseMessage: a.pauseMessage || '' };
            });
            setAvailabilities(initial);
        }
    }, [operator]);

    const appointmentsEnabled = organization
        ? (organization.settings?.allowAppointments !== false)
        : true;

    useEffect(() => {
        if (!operator) return;

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            console.log("Connected to operator socket");
            loadQueue();
            if (appointmentsEnabled) loadAppointments();
        });

        socket.on("queue.updated", loadQueue);
        socket.on("queueUpdated", loadQueue);
        
        socket.on("agentAvailabilityChanged", (data: any) => {
            setAvailabilities(prev => ({
                ...prev,
                [data.agentId]: { availability: data.availability, pauseMessage: data.pauseMessage }
            }));
        });

        return () => { socket.disconnect(); };
    }, [operator, appointmentsEnabled]);

    useEffect(() => {
        if (operator) {
            loadQueue();
            if (appointmentsEnabled) loadAppointments();
        }
    }, [operator, appointmentsEnabled]);

    async function loadQueue() {
        try {
            let allQueues: any[] = [];
            let totalCompleted = 0;
            const today = new Date().toISOString().split('T')[0];

            const agents = operator.assignedAgents || operator.assignedAgents || [];
            for (let agent of agents) {
                const res = await api.get(`/queue/${agent._id}`);
                allQueues = [...allQueues, ...res.data];

                const histRes = await api.get(`/queue/history/?agentId=${agent._id}&date=${today}&status=completed`);
                totalCompleted += histRes.data.length;
            }

            allQueues.sort((a, b) => {
                const pMap: any = { EMERGENCY: 1, HIGH: 2, NORMAL: 3 };
                if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });

            setQueue(allQueues);
            setCompletedCount(totalCompleted);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadAppointments() {
        try {
            let allApps: any[] = [];
            const agents = operator.assignedAgents || operator.assignedAgents || [];
            for (let agent of agents) {
                const res = await api.get(`/appointments/agent/${agent._id}/upcoming`);
                allApps = [...allApps, ...res.data];
            }
            allApps.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
            setAppointments(allApps);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddCustomer(e: any) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/queue/add", {
                name: form.name,
                number: form.phone,
                email: form.email,
                agentId: form.agentId,
                priority: form.priority,
                notes: form.notes
            });
            
            const link = res.data.entry?.uniqueLinkId || res.data.customer?.uniqueLinkId || "";
            setLastAddedLink(link);
            
            showMsg("Customer Enrollment Success", "success");
            setForm({ name: "", email: "", phone: "", notes: "", priority: "NORMAL", agentId: form.agentId });
            loadQueue();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Error enrolling customer", "error");
        } finally {
            setLoading(false);
        }
    }

    async function bookAppointment(e: any) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/appointments/book", {
                customerName: appointmentForm.name,
                customerPhone: appointmentForm.phone,
                customerEmail: appointmentForm.email,
                scheduledAt: appointmentForm.scheduledAt,
                notes: appointmentForm.notes,
                agentId: appointmentForm.agentId,
            });
            showMsg("Appointment Booked Successfully", "success");
            setAppointmentForm({ name: "", email: "", phone: "", scheduledAt: "", notes: "", agentId: appointmentForm.agentId });
            loadAppointments();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Error booking appointment", "error");
        } finally {
            setLoading(false);
        }
    }

    async function markArrived(appointmentId: string) {
        try {
            const res = await api.put(`/appointments/${appointmentId}/arrive`);
            const appt = res.data.appointment;

            // Instantly transfer to live queue if not already done by backend
            await api.post("/queue/add", {
                name: appt.clientName || appt.customerName,
                number: appt.clientPhone || appt.phone,
                email: appt.clientEmail || appt.email,
                agentId: appt.agentId || appt.agentId,
                priority: 'NORMAL',
                notes: `[Appt] ${appt.notes || ''}`
            });
            showMsg("Client Arrived & Enqueued", "success");
            loadAppointments();
            loadQueue();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Error marking arrival", "error");
        }
    }

    async function completeVisit(id: string) {
        try {
            await api.put(`/queue/complete/${id}`);
            showMsg("Visit Finalized Successfully", "success");
            loadQueue();
        } catch (err) {
            showMsg("Error finalizing visit", "error");
        }
    }

    async function cancelVisit(id: string) {
        if (!confirm("Are you sure you want to cancel this visit? This action is irreversible.")) return;
        try {
            await api.put(`/queue/cancel/${id}`);
            showMsg("Visit Cancelled Successfully", "success");
            loadQueue();
        } catch (err) {
            showMsg("Error cancelling visit", "error");
        }
    }

    function showMsg(text: string, type: string) {
        setMsg(text);
        setTimeout(() => setMsg(""), 4000);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = queue.findIndex(q => q._id === active.id);
        const newIndex = queue.findIndex(q => q._id === over.id);
        
        if (oldIndex > 2 || newIndex > 2) {
            showMsg("Manual reorder restricted to top 3 slots", "error");
            return;
        }

        const newQueue = arrayMove(queue, oldIndex, newIndex);
        setQueue(newQueue);

        const agentId = active.data.current?.agentId;
        if (!agentId) return;

        const agentQueue = newQueue.filter(p => (p.agentId?._id || p.agentId) === agentId);
        const top3Ids = agentQueue.slice(0, 3).map(p => p._id);

        try {
            await api.put(`/queue/reorder/${agentId}`, { newOrder: top3Ids });
        } catch (err) {
            console.error("Reorder failed", err);
            loadQueue();
        }
    }

    const copyStatusLink = (uid: string) => {
        const url = `${window.location.origin}/status/${uid}`;
        navigator.clipboard.writeText(url);
        showMsg("Live Tracking Link Copied", "success");
    };

    if (!operator) return <Loader />;

    const agents = operator.assignedAgents || operator.assignedAgents || [];

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">
            
            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-4 md:py-6 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-down relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-1">
                            <MonitorSmartphone className="w-6 h-6 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-0.5 uppercase italic">Registry Desk</h1>
                            <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider">Customer Enrollment Terminal <span className="mx-2 text-white/10">|</span> {organization?.name || "Standard Registry"}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sync Active</span>
                        </div>
                        <button 
                            onClick={() => router.push("/login")}
                            className="flex items-center gap-2 px-4 py-2 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                            <Power className="w-3.5 h-3.5" /> Logout
                        </button>
                    </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-fade-up">
                    {[
                        { label: "Today Total", value: queue.length + completedCount, icon: <Users className="w-5 h-5" />, color: "text-brand-400 bg-brand-500/5 border-brand-500/20" },
                        { label: "Waiting Now", value: queue.length, icon: <Activity className="w-5 h-5" />, color: "text-info-400 bg-info-500/5 border-info-500/10" },
                        { label: "Finalized", value: completedCount, icon: <CheckCircle className="w-5 h-5" />, color: "text-success-400 bg-success-500/5 border-success-500/10" },
                        { label: "Active Agents", value: agents.length, icon: <Briefcase className="w-5 h-5" />, color: "text-warning-400 bg-warning-500/5 border-warning-500/10" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative rounded-2xl border shadow-sm p-5 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-4 right-4 opacity-40 group-hover:opacity-100 transition-opacity hidden sm:block">{icon}</div>
                            <span className="text-3xl font-black tracking-tighter mb-1 font-mono">{value.toString().padStart(2, '0')}</span>
                            <p className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Dashboard Terminal */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-4 lg:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-up">
                    
                    {/* Mode Selectors */}
                    <div className="flex flex-wrap items-center gap-3 mb-10 p-2 bg-white/[0.03] rounded-[2rem] border border-white/5 w-fit mx-auto lg:mx-0">
                        <button
                            onClick={() => { setTab("add"); setActiveTab("walkin"); }}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${tab === "add" && activeTab === "walkin"
                                ? "bg-brand-600 text-white shadow-xl shadow-brand-600/20"
                                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"}`}
                        >
                            <UserPlus className="w-4 h-4" /> Enrollment
                        </button>
                        {appointmentsEnabled && (
                            <button
                                onClick={() => { setTab("add"); setActiveTab("appointment"); }}
                                className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${tab === "add" && activeTab === "appointment"
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"}`}
                            >
                                <CalendarPlus className="w-4 h-4" /> Booking
                            </button>
                        )}
                        <div className="w-px h-8 bg-white/10 mx-2" />
                        <button
                            onClick={() => setTab("queue")}
                            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${tab === "queue"
                                ? "bg-white/10 text-brand-400 border border-brand-500/30"
                                : "text-neutral-500 hover:text-neutral-300"}`}
                        >
                            <ShieldAlert className="w-4 h-4" /> Live Queue
                        </button>
                    </div>

                    {msg && (
                        <div className="mb-10 p-6 rounded-[2rem] bg-brand-500/10 border border-brand-500/30 text-brand-400 font-bold uppercase tracking-wider animate-fade-up flex items-center justify-center gap-4 text-[12px] shadow-2xl backdrop-blur-xl">
                            <CheckCircle className="w-5 h-5" /> {msg}
                            {lastAddedLink && (
                                <button 
                                    onClick={() => copyStatusLink(lastAddedLink)}
                                    className="ml-auto px-5 py-2.5 bg-brand-500 text-white rounded-xl flex items-center gap-3 hover:bg-brand-400 transition-all shadow-lg active:scale-95"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy Link
                                </button>
                            )}
                        </div>
                    )}

                    <div className="min-h-[600px]">
                        {tab === "add" && activeTab === "walkin" && (
                            <div className="max-w-4xl mx-auto animate-fade-down py-10">
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-3 uppercase italic">Enroll Customer</h2>
                                    <p className="text-neutral-500 text-[12px] font-bold uppercase tracking-wider">Direct Walk-in Registration</p>
                                </div>
                                <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormInput label="Legal Name" icon={<UserIcon className="w-3 h-3"/>}>
                                        <input
                                            placeholder="e.g. John Doe"
                                            className="custom-input"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </FormInput>
                                    <FormInput label="Mobile Contact" icon={<Smartphone className="w-3 h-3"/>}>
                                        <input
                                            placeholder="+91 00000 00000"
                                            className="custom-input"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            required
                                        />
                                    </FormInput>
                                    <FormInput label="Email Sync" icon={<Bell className="w-3 h-3"/>}>
                                        <input
                                            type="email"
                                            placeholder="sync@customer.com"
                                            className="custom-input"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </FormInput>
                                    <FormInput label="Select Agent" icon={<Briefcase className="w-3 h-3"/>}>
                                        <select
                                            className="custom-input cursor-pointer"
                                            value={form.agentId}
                                            onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Pick available agent...</option>
                                            {agents.map((a: any) => {
                                                const status = availabilities[a._id]?.availability;
                                                const isOff = status === "Not Available" || status === "Unavailable";
                                                return (
                                                    <option key={a._id} value={a._id} className="bg-neutral-900">
                                                        {a.name} ({a.serviceCategory || a.role}) {isOff ? " [OFFLINE]" : ""}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </FormInput>

                                    <FormInput label="Brief Notes" icon={<FileText className="w-3 h-3"/>}>
                                        <input
                                            placeholder="Reason for visit..."
                                            className="custom-input"
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </FormInput>
                                    <div className="md:col-span-2 mt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-6 rounded-[2rem] bg-brand-600 hover:bg-brand-500 text-white font-bold text-[14px] uppercase tracking-widest shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                        >
                                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Commit Enrollment"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {tab === "add" && activeTab === "appointment" && (
                            <div className="max-w-4xl mx-auto animate-fade-up py-10">
                                <div className="text-center mb-12">
                                    <h2 className="text-4xl font-black tracking-tight text-white mb-3 uppercase italic">Book Appointment</h2>
                                    <p className="text-neutral-500 text-[11px] font-black uppercase tracking-[0.4em]">Future Schedule Protocol</p>
                                </div>
                                <form onSubmit={bookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormInput label="Customer Name" icon={<UserIcon className="w-3 h-3"/>}>
                                        <input
                                            placeholder="Full Name"
                                            className="custom-input"
                                            value={appointmentForm.name}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                                            required
                                        />
                                    </FormInput>
                                    <FormInput label="Contact Mobile" icon={<Smartphone className="w-3 h-3"/>}>
                                        <input
                                            placeholder="10-digit number"
                                            className="custom-input"
                                            value={appointmentForm.phone}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                                            required
                                        />
                                    </FormInput>
                                    <FormInput label="Assignment" icon={<Briefcase className="w-3 h-3"/>}>
                                        <select
                                            className="custom-input cursor-pointer"
                                            value={appointmentForm.agentId}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, agentId: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select Agent...</option>
                                            {agents.map((a: any) => (
                                                <option key={a._id} value={a._id} className="bg-neutral-900">{a.name}</option>
                                            ))}
                                        </select>
                                    </FormInput>
                                    <FormInput label="Schedule Code" icon={<Calendar className="w-3 h-3"/>}>
                                        <input
                                            type="datetime-local"
                                            className="custom-input"
                                            value={appointmentForm.scheduledAt}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledAt: e.target.value })}
                                            required
                                        />
                                    </FormInput>
                                    <FormInput label="Protocol Notes" icon={<FileText className="w-3 h-3"/>} fullWidth>
                                        <textarea
                                            placeholder="Metadata or requirements..."
                                            className="custom-input h-32 py-4 resize-none"
                                            value={appointmentForm.notes}
                                            onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                                        />
                                    </FormInput>
                                    <div className="md:col-span-2 mt-8">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-6 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Commit Booking"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {tab === "queue" && (
                            <div className="animate-fade-up py-4">
                                <div className="flex items-center gap-3 mb-10">
                                    <Activity className="w-6 h-6 text-brand-400" />
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Active Matrix Monitor</h3>
                                    <div className="ml-auto flex items-center gap-4">
                                        {[
                                            { label: 'Live', count: queue.length, color: 'text-brand-400' },
                                            { label: 'Next 7D Appointments', count: appointments.length, color: 'text-indigo-400' }
                                        ].map(m => (
                                            <div key={m.label} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${m.color}`}>{m.label}</span>
                                                <span className="font-mono font-black text-white">{m.count.toString().padStart(2, '0')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-10">
                                    {/* Live Queue Container */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="flex items-center justify-between mb-2 px-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">Live Stream (Queue)</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Manual Reorder Active [Top 3]</span>
                                        </div>
                                        {queue.length === 0 ? (
                                            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-32 flex flex-col items-center opacity-30">
                                                <MonitorSmartphone className="w-16 h-16 mb-4" />
                                                <p className="text-xs font-black uppercase tracking-widest">No Active Sessions</p>
                                            </div>
                                        ) : (
                                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                                <SortableContext items={queue.map(p => p._id)} strategy={verticalListSortingStrategy}>
                                                    {queue.map((p: any) => (
                                                        <SortableItem 
                                                            key={p._id} 
                                                            item={p} 
                                                            onComplete={() => completeVisit(p._id)} 
                                                            onCancel={() => cancelVisit(p._id)}
                                                            onCopyLink={() => copyStatusLink(p.uniqueLinkId)}
                                                            agentStatus={availabilities[p.agentId?._id || p.agentId]}
                                                            onCopyPhone={() => {
                                                                navigator.clipboard.writeText(p.phone || p.number);
                                                                showMsg("Phone Copied", "success");
                                                            }}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </DndContext>
                                        )}
                                    </div>

                                    {/* Appts Container */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="flex items-center justify-between mb-2 px-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">Upcoming Flow</span>
                                            <button onClick={loadAppointments} className="text-[10px] font-black text-brand-400 uppercase tracking-widest hover:underline">Refresh</button>
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] overflow-hidden">
                                            {appointments.length === 0 ? (
                                                <div className="p-20 text-center opacity-20">
                                                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Empty Flow</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {appointments.map((a: any) => (
                                                        <div key={a._id} className="p-6 hover:bg-white/[0.03] transition-all group">
                                                            <div className="flex items-center gap-5">
                                                                <div className="flex flex-col items-center justify-center p-3 h-16 w-16 bg-white/5 rounded-2xl border border-white/10 group-hover:border-brand-500/30 transition-all">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{new Date(a.scheduledAt).toLocaleDateString([], { month: 'short' })}</span>
                                                                    <span className="text-xl font-black text-white leading-none mt-1">{new Date(a.scheduledAt).getDate()}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-black text-white italic uppercase tracking-tight truncate group-hover:text-brand-400 transition-colors">{a.customerName || a.customerName || a.guestName}</p>
                                                                    <div className="flex items-center gap-4 mt-1.5">
                                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                                                            <Clock className="w-3 h-3" /> {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-500/60">
                                                                            <UserIcon className="w-3 h-3" /> {a.agentName || a.agentName || a.agentId?.name || "Agent"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    onClick={() => markArrived(a._id)}
                                                                    className="p-3 bg-success-500/10 border border-success-500/20 text-success-400 rounded-xl hover:bg-success-600 hover:text-white transition-all shadow-sm active:scale-90"
                                                                    title="Mark Arrived"
                                                                >
                                                                    <Power className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 1rem 1.5rem;
                    border-radius: 1.25rem;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 700;
                    outline: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .custom-input:focus {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(99, 102, 241, 0.5);
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
                }
                .custom-input::placeholder {
                    color: #404040;
                }
            `}</style>
        </div>
    );
}

function FormInput({ label, icon, children, fullWidth = false }: { label: string, icon: any, children: any, fullWidth?: boolean }) {
    return (
        <div className={`space-y-3 ${fullWidth ? 'md:col-span-2' : ''}`}>
            <label className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 ml-6 italic">
                <span className="opacity-40">{icon}</span> {label}
            </label>
            {children}
        </div>
    );
}

function SortableItem({ item, onComplete, onCancel, onCopyLink, onCopyPhone, agentStatus }: { item: any; onComplete: () => void; onCancel: () => void; onCopyLink: () => void; onCopyPhone: () => void; agentStatus?: any }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
        id: item._id,
        data: { agentId: item.agentId?._id || item.agentId || item.agentId?._id || item.agentId }
    });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 100 : 1 };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`group flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all duration-300 ${isDragging ? "bg-brand-500/10 border-brand-500/30 shadow-2xl" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl"}`}
        >
            <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-2 text-neutral-600 hover:text-white transition-all">
                <GripVertical className="w-5 h-5 pointer-events-none" />
            </div>
            
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-[1.5rem] flex items-center justify-center font-mono font-black text-2xl shadow-xl shadow-brand-500/20 flex-shrink-0 transform -rotate-2 group-hover:rotate-0 transition-transform">
                {item.tokenNumber}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black text-white truncate mb-1 group-hover:text-brand-400 transition-colors uppercase tracking-tight italic">{item.customerName || item.name}</h4>
                <div className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        <Activity className="w-3.5 h-3.5 text-info-400" /> {item.status}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${agentStatus?.availability === "Not Available" || agentStatus?.availability === "Unavailable" ? 'text-danger-400' : 'text-neutral-500'} group-hover:text-brand-400 transition-colors italic`}>
                        <Briefcase className="w-3.5 h-3.5" /> Assigned to: {item.agentId?.name || item.agentName || "Standard Agent"}
                        {(agentStatus?.availability === "Not Available" || agentStatus?.availability === "Unavailable") && (
                            <span className="ml-2 px-1.5 py-0.5 bg-danger-500/10 border border-danger-500/20 rounded text-[7px] animate-pulse">OFFLINE</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={onCopyLink}
                    className="p-3.5 rounded-2xl bg-white/5 text-neutral-500 border border-white/5 hover:bg-info-500/10 hover:text-info-400 transition-all active:scale-90"
                    title="Live Link"
                >
                    <Copy className="w-4 h-4" />
                </button>
                <button 
                    onClick={onCopyPhone}
                    className="p-3.5 rounded-2xl bg-white/5 text-neutral-500 border border-white/5 hover:bg-brand-500/10 hover:text-brand-400 transition-all active:scale-90"
                    title="Copy Phone"
                >
                    <Smartphone className="w-4 h-4" />
                </button>
                <button 
                    onClick={onComplete}
                    className="p-3.5 rounded-2xl bg-white/5 text-neutral-500 border border-white/5 hover:bg-success-500/20 hover:text-success-400 transition-all active:scale-90"
                    title="Finalize"
                >
                    <CheckCircle className="w-4 h-4" />
                </button>
                <button 
                    onClick={onCancel}
                    className="p-3.5 rounded-2xl bg-white/5 text-neutral-500 border border-white/5 hover:bg-danger-500/20 hover:text-danger-400 transition-all active:scale-90"
                    title="Cancel"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
