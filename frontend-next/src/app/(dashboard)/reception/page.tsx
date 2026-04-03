"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { io } from "socket.io-client";
import {
    Users, FileText, CheckCircle, Clock, Stethoscope, Power, Activity,
    ShieldAlert, ArrowUp, ArrowDown, GripVertical, Smartphone, Copy,
    Calendar, UserPlus, RefreshCw, CalendarPlus, MonitorSmartphone, X,
    ChevronRight, MapPin, Search, Bell
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

export default function ReceptionDashboard() {
    const [receptionist, setReceptionist] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<string>("add"); // add, queue
    const [form, setForm] = useState({ name: "", phoneNumber: "", notes: "", doctorId: "" });
    const [lastAddedLink, setLastAddedLink] = useState<string>("");
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadReceptionist();
    }, []);
    useEffect(() => {
        if (!receptionist) return;

        const socket = io("http://localhost:5000", {
            transports: ["websocket"],
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log("Receptionist connected to hospital stream");
        });

        socket.on("queueUpdated", () => {
            console.log("Queue update triggered via socket!");
            loadQueue();
        });

        socket.on("staffAssignmentUpdated", (payload: any) => {
            console.log("Assignment updated:", payload);
            loadReceptionist(); // Reload full profile to get new assignedDoctors
        });

        socket.on("doctorAvailabilityChanged", (payload: any) => {
            console.log("Doctor status changed:", payload);
            setReceptionist((prev: any) => {
                if (!prev) return prev;
                const updatedDoctors = prev.assignedDoctors.map((d: any) =>
                    d._id === payload.doctorId ? { ...d, availability: payload.availability } : d
                );
                return { ...prev, assignedDoctors: updatedDoctors };
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [receptionist]);

    async function loadReceptionist() {
        try {
            const meRes = await api.get("/auth/me");
            const userData = meRes.data;

            if (userData.role !== "RECEPTIONIST" && userData.role !== "HOSPITAL_ADMIN") {
                router.push("/doctor");
                return;
            }

            if (userData.role === 'HOSPITAL_ADMIN') {
                const staffRes = await api.get("/admin/staff");
                const allStaff = staffRes.data || [];
                const receptionistsList = allStaff.filter((s: any) => s.role === "RECEPTIONIST");
                if (receptionistsList.length > 0) {
                    setReceptionist(receptionistsList[0]);
                } else {
                    router.push("/admin/dashboard");
                }
            } else {
                setReceptionist(userData);
            }
        } catch (err: any) {
            if (err.response?.status === 401) router.push("/login");
        }
    }

    useEffect(() => {
        if (receptionist) {
            loadQueue();
            // Auto-select the first assigned doctor if not already set or reassigned
            if (receptionist.assignedDoctors?.length > 0) {
                setForm(prev => ({ ...prev, doctorId: receptionist.assignedDoctors[0]._id }));
            }
        }
    }, [receptionist]);
    async function loadQueue() {
        try {
            let allQueues: any[] = [];
            let totalCompleted = 0;
            const today = new Date().toISOString().split('T')[0];

            for (let doc of receptionist.assignedDoctors || []) {
                // Fetch waiting queue
                const res = await api.get(`/queue/${doc._id}`);
                allQueues = [...allQueues, ...res.data];

                // Fetch completed/cancelled for metrics
                const histRes = await api.get(`/queue/history/?doctorId=${doc._id}&date=${today}&status=completed`);
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

    async function handleAddPatient(e: any) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/queue/add", {
                name: form.name,
                number: form.phoneNumber,
                notes: form.notes,
                doctorId: form.doctorId,
                description: "NORMAL"
            });

            const link = res.data.patient?.uniqueLinkId || "";
            setLastAddedLink(link);

            showMsg("Patient Enrolled Successfully", "success");
            setForm({ name: "", phoneNumber: "", notes: "", doctorId: form.doctorId });
            loadQueue();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Error enrolling patient", "error");
        } finally {
            setLoading(false);
        }
    }

    async function callPatient(id: string) {
        try {
            await api.post(`/queue/call/${id}`);
            showMsg("Patient Called Successfully", "success");
        } catch (err) {
            showMsg("Error calling patient", "error");
        }
    }

    async function completeVisit(id: string) {
        try {
            await api.put(`/queue/complete/${id}`);
            showMsg("Visit Committed Successfully", "success");
            loadQueue();
        } catch (err) {
            showMsg("Error committed visit", "error");
        }
    }

    async function cancelVisit(id: string) {
        if (!confirm("Are you sure you want to cancel this patient's visit? This action is irreversible.")) return;
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

        const doctorId = active.data.current?.doctorId;
        if (!doctorId) return;

        const doctorQueue = newQueue.filter(p => (p.doctorId?._id || p.doctorId) === doctorId);
        const top3Ids = doctorQueue.slice(0, 3).map(p => p._id);

        try {
            await api.put(`/queue/reorder/${doctorId}`, { newOrder: top3Ids });
        } catch (err) {
            console.error("Reorder failed", err);
            loadQueue(); // revert
        }
    }

    const copyStatusLink = (uid: string) => {
        const url = `${window.location.origin}/status/${uid}`;
        navigator.clipboard.writeText(url);
        showMsg("Matrix Link Copied to Clipboard", "success");
    };

    if (!receptionist) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">

            {/* Ambient Background - Architect Ledger Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-info-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-2 md:py-4 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 animate-fade-down relative z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center shadow-2xl transform rotate-1">
                            <MonitorSmartphone className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-0.5 uppercase italic">Registry Desk</h1>
                            <p className="text-neutral-500 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em]">Patient Check-in Terminal <span className="mx-2 text-white/10">|</span> Ver 2.04</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Live Sync Active</span>
                        </div>
                        <button
                            onClick={() => router.push("/login")}
                            className="flex items-center gap-2 px-3 py-1.5 bg-danger-500/10 hover:bg-danger-500/20 text-danger-400 border border-danger-500/20 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                            <Power className="w-3 h-3" /> Logout
                        </button>
                    </div>
                </div>

                {/* Today's Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 animate-fade-up">
                    {[
                        { label: "Today's Total", value: queue.length + completedCount, icon: <Users className="w-4 h-4" />, color: "text-brand-400 bg-brand-500/5 border-brand-500/20" },
                        { label: "Waiting Now", value: queue.length, icon: <Activity className="w-4 h-4" />, color: "text-info-400 bg-info-500/5 border-info-500/10" },
                        { label: "Completed", value: completedCount, icon: <FileText className="w-4 h-4" />, color: "text-success-400 bg-success-500/5 border-success-500/10" },
                        { label: "Active Doctors", value: receptionist.assignedDoctors?.length || 0, icon: <Stethoscope className="w-4 h-4" />, color: "text-warning-400 bg-warning-500/5 border-warning-500/10" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative rounded-xl sm:rounded-2xl border shadow-sm p-4 md:p-5 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 opacity-40 group-hover:opacity-100 transition-opacity hidden sm:block">{icon}</div>
                            <span className="text-2xl sm:text-3xl font-black tracking-tighter mb-0.5 font-mono sm:leading-none">{value.toString().padStart(2, '0')}</span>
                            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider opacity-80 text-neutral-400">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-3 sm:p-4 lg:p-5 backdrop-blur-3xl shadow-2xl relative overflow-hidden animate-fade-up">

                    {/* Clinician Status Matrix */}
                    <div className="mb-8 px-4 flex flex-wrap items-center justify-center gap-4 animate-fade-in group/matrix">
                        <div className="w-full flex items-center justify-center gap-2 mb-2 opacity-50 group-hover/matrix:opacity-100 transition-opacity">
                            <Stethoscope className="w-3.5 h-3.5 text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Live Clinician Status Matrix</span>
                        </div>
                        {receptionist.assignedDoctors?.map((doc: any) => (
                            <div
                                key={doc._id}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500 scale-95 hover:scale-100 backdrop-blur-xl ${doc.availability === "Not Available"
                                    ? "bg-danger-500/10 border-danger-500/30 text-danger-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                    : "bg-success-500/10 border-success-500/30 text-success-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${doc.availability === "Not Available"
                                    ? "bg-danger-500 shadow-[0_0_8px_#ef4444] animate-pulse"
                                    : "bg-success-500 shadow-[0_0_8px_#22c55e]"
                                    }`} />
                                <span className="text-[11px] font-black uppercase tracking-widest">{doc.name}</span>
                                <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-60 ml-1">
                                    {doc.availability === "Not Available" ? "OFFLINE" : "READY"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-1 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit mx-auto">
                        {[
                            { id: "add", label: "Enroll", icon: <UserPlus className="w-4 h-4" /> },
                            { id: "queue", label: "Queue", icon: <ShieldAlert className="w-4 h-4" /> },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-[2rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id
                                    ? "bg-brand-600 text-white shadow-xl shadow-brand-600/20"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-white"}`}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {msg && (
                        <div className="mb-6 p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black uppercase tracking-widest animate-fade-up flex flex-col items-center justify-center gap-3 text-[9px] backdrop-blur-xl relative overflow-hidden">
                            <div className="flex items-center gap-2.5">
                                <CheckCircle className="w-3.5 h-3.5" /> {msg}
                            </div>

                            {tab === "add" && lastAddedLink && (
                                <button
                                    onClick={() => copyStatusLink(lastAddedLink)}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-lg flex items-center gap-2 hover:bg-brand-400 transition-all font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-lg shadow-brand-500/20"
                                >
                                    <Copy className="w-2.5 h-2.5" /> Copy Tracking Link
                                </button>
                            )}
                        </div>
                    )}

                    <div className="p-3 lg:p-4">
                        {tab === "add" && (
                            <div className="max-w-5xl mx-auto animate-fade-up py-2 lg:py-3">
                                <div className="text-center mb-4">
                                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">New Enrollment</h2>
                                    <p className="text-neutral-500 text-[11px] font-bold uppercase tracking-[0.3em]">Patient Registration System</p>
                                </div>

                                <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider ml-5 italic">Legal Name</label>
                                        <input
                                            placeholder="e.g. Arthur Ledger"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 rounded-xl text-[13px] text-white placeholder-neutral-700 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05]"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5 italic">Contact Mobile</label>
                                        <input
                                            placeholder="91 00000 00000"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05]"
                                            value={form.phoneNumber}
                                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5 italic">Medical Concern</label>
                                        <input
                                            placeholder="e.g. Routine Consult"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 rounded-xl text-xs text-white placeholder-neutral-700 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05]"
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] ml-5 italic">Clinician Hub</label>
                                        <div className="relative">
                                            <select
                                                className="w-full bg-white/[0.03] border border-white/5 p-3.5 rounded-xl text-xs text-white outline-none appearance-none transition-all cursor-pointer focus:border-brand-500/50 focus:bg-white/[0.05]"
                                                value={form.doctorId}
                                                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                                                required
                                            >
                                                <option value="" disabled className="bg-neutral-900 border-none">Pick Specialist...</option>
                                                {receptionist.assignedDoctors?.map((d: any) => (
                                                    <option key={d._id} value={d._id} className="bg-neutral-900">
                                                        {d.name} ({d.specialization}) {d.availability === "Not Available" ? "— PAUSED ⏸️" : "— ACTIVE ✅"}
                                                    </option>
                                                ))}
                                            </select>
                                            < ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-700 pointer-events-none rotate-90" />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 mt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-4.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-[13px] uppercase tracking-wider shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                        >
                                            {loading ? <Activity className="w-4 h-4 animate-spin" /> : "Register Patient"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {tab === "queue" && (
                            <div className="max-w-5xl mx-auto animate-fade-up py-2 lg:py-3">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                    <h3 className="text-xl font-black text-white px-2 uppercase tracking-tight italic">Patient Queue</h3>
                                    <button onClick={loadQueue} className="p-3 bg-white/5 border border-white/10 rounded-xl text-neutral-500 hover:text-white transition-colors shadow-sm">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                </div>

                                {queue.length === 0 ? (
                                    <div className="py-32 flex flex-col items-center text-center">
                                        <Activity className="w-12 h-12 text-neutral-800 mb-6 animate-pulse" />
                                        <h4 className="text-xl font-black text-neutral-600">Queue is Empty</h4>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={queue.map(p => p._id)} strategy={verticalListSortingStrategy}>
                                                {queue.map((p: any) => (
                                                    <SortableItem
                                                        key={p._id}
                                                        patient={p}
                                                        onCall={() => callPatient(p._id)}
                                                        onComplete={() => completeVisit(p._id)}
                                                        onCancel={() => cancelVisit(p._id)}
                                                        onCopyLink={() => copyStatusLink(p.uniqueLinkId)}
                                                        onCopyPhone={() => {
                                                            navigator.clipboard.writeText(p.number);
                                                            showMsg("Phone Number Copied to Clipboard", "success");
                                                        }}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SortableItem({ patient, onCall, onComplete, onCancel, onCopyLink, onCopyPhone }: { patient: any; onCall: () => void; onComplete: () => void; onCancel: () => void; onCopyLink: () => void; onCopyPhone: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: patient._id,
        data: { doctorId: patient.doctorId?._id || patient.doctorId }
    });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1, zIndex: isDragging ? 100 : 1 };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${isDragging ? "bg-brand-500/10 border-brand-500/30 shadow-2xl" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06] backdrop-blur-xl"}`}
        >
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded-lg text-neutral-500 hover:text-white transition-all">
                    <GripVertical className="w-4 h-4 pointer-events-none" />
                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-mono font-black text-lg sm:text-2xl shadow-xl shadow-brand-500/20 flex-shrink-0 transform -rotate-2 group-hover:rotate-0 transition-transform">
                    {patient.tokenNumber}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-black text-white truncate mb-1 group-hover:text-brand-400 transition-colors uppercase tracking-tight italic">{patient.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5">
                        <span className="w-fit text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                            <Activity className="w-3 h-3 text-info-400" /> {patient.status}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-300 group-hover:text-brand-400 transition-colors">
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-brand-500/30" />
                            <Stethoscope className="w-3 h-3 text-brand-500" />
                            <span className="truncate max-w-[120px] sm:max-w-none italic">Assigned to Dr. {patient.doctorId?.name || "Node"}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
                <button
                    onClick={onCopyLink}
                    className="p-2.5 sm:p-3 rounded-lg bg-white/5 text-neutral-500 border border-white/5 hover:bg-info-500/20 hover:text-info-400 hover:border-info-500/30 transition-all active:scale-90"
                    title="Copy Tracking Link"
                >
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                    onClick={onCopyPhone}
                    className="p-2.5 sm:p-3 rounded-lg bg-white/5 text-neutral-500 border border-white/5 hover:bg-brand-500/20 hover:text-brand-400 hover:border-brand-500/30 transition-all active:scale-90"
                    title="Copy Phone Number"
                >
                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                    onClick={onComplete}
                    className="p-2.5 sm:p-3 rounded-lg bg-white/5 text-neutral-500 border border-white/5 hover:bg-success-500/20 hover:text-success-400 hover:border-success-500/30 transition-all active:scale-90"
                    title="Commit Visit"
                >
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                    onClick={onCancel}
                    className="p-2.5 sm:p-3 rounded-lg bg-white/5 text-neutral-500 border border-white/5 hover:bg-danger-500/20 hover:text-danger-400 hover:border-danger-500/30 transition-all active:scale-90"
                    title="Cancel Visit"
                >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </div>
    );
}
