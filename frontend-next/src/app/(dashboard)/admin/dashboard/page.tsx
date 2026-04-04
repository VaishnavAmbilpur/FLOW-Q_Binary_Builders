"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import {
    Users, UserPlus, FileText, CheckCircle, Stethoscope, Power, Activity,
    QrCode, Clock, X, Monitor, Key, Trash2, Shield, Calendar,
    ChevronRight, MapPin, Search, Plus, ShieldCheck, Mail, Lock, Settings
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminDashboard() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Form states
    const [doctorForm, setDoctorForm] = useState({ name: "", email: "", specialization: "", password: "" });
    const [receptionistForm, setReceptionistForm] = useState({ name: "", email: "", password: "", assignedDoctors: [] });

    // Lists
    const [doctors, setDoctors] = useState<any[]>([]);
    const [receptionists, setReceptionists] = useState<any[]>([]);
    const [revealedIds, setRevealedIds] = useState<string[]>([]);
    const [editingAssignmentRec, setEditingAssignmentRec] = useState<any>(null);

    // Scheduling State
    const [editingScheduleDoc, setEditingScheduleDoc] = useState<any>(null);
    const [scheduleForm, setScheduleForm] = useState<any[]>([]);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const meRes = await api.get("/admin/info");
            const userData = meRes.data;

            if (userData.role !== "HOSPITAL_ADMIN") {
                router.push("/login");
                return;
            }
            setAdmin(userData);

            const staffRes = await api.get("/admin/staff");
            const allStaff = staffRes.data || [];
            const doctorsList = allStaff.filter((s: any) => s.role === "DOCTOR");
            const receptionistsList = allStaff.filter((s: any) => s.role === "RECEPTIONIST");
            setDoctors(doctorsList);
            setReceptionists(receptionistsList);

        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) router.push("/login");
        }
    }

    const handleAddDoctor = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/admin/staff/doctor", doctorForm);
            showMsg("Doctor Added Successfully", "success");
            setDoctorForm({ name: "", email: "", specialization: "", password: "" });
            loadAdminData();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Failed to add doctor", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReceptionist = async (e: any) => {
        e.preventDefault();
        if (receptionistForm.assignedDoctors.length === 0) {
            showMsg("Select at least one doctor first!", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post("/admin/staff/receptionist", receptionistForm);
            showMsg("Receptionist Added Successfully", "success");
            setReceptionistForm({ name: "", email: "", password: "", assignedDoctors: [] });
            loadAdminData();
        } catch (err: any) {
            showMsg(err.response?.data?.message || "Failed to add receptionist", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorSelection = (id: string) => {
        setReceptionistForm(prev => ({
            ...prev,
            assignedDoctors: [id] as any
        }));
    };

    const handleToggleReveal = (id: string) => {
        setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleDeleteStaff = async (id: string, name: string) => {
        setLoading(true);
        try {
            await api.delete(`/admin/staff/${id}`);
            showMsg(`Removed: ${name}`, "success");
            loadAdminData();
        } catch (err) {
            showMsg("Removal Failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSchedule = (doc: any) => {
        setEditingScheduleDoc(doc);
        const currentSchedule = doc.schedule || [];
        const initialForm = daysOfWeek.map(day => {
            const found = currentSchedule.find((s: any) => s.day === day);
            return { day, startTime: found?.startTime || "", endTime: found?.endTime || "" };
        });
        setScheduleForm(initialForm);
    };

    const handleScheduleChange = (index: number, field: string, val: string) => {
        const updated = [...scheduleForm];
        updated[index] = { ...updated[index], [field]: val };
        setScheduleForm(updated);
    };

    const handleSaveSchedule = async () => {
        setLoading(true);
        try {
            const finalSchedule = scheduleForm.filter(s => s.startTime && s.endTime);
            await api.put(`/admin/staff/doctor/${editingScheduleDoc._id}/schedule`, { schedule: finalSchedule });
            showMsg("Schedule Updated", "success");
            setEditingScheduleDoc(null);
            loadAdminData();
        } catch (err) {
            showMsg("Sync Failure", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAssignment = async (recId: string, docId: string) => {
        try {
            await api.put(`/admin/staff/receptionist/${recId}/assign`, { doctorId: docId });
            showMsg("Doctor Assigned", "success");
            setEditingAssignmentRec(null);
            loadAdminData();
        } catch (err) {
            showMsg("Reassignment Failure", "error");
        }
    };

    function showMsg(text: string, type: string) {
        setMsg(text);
        setTimeout(() => setMsg(""), 4000);
    }

    if (!admin) return <Loader />;

    return (
        <div className="w-full min-h-screen bg-neutral-950 text-white font-sans relative overflow-x-hidden selection:bg-brand-500/30">


            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-success-600/5 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6 pb-12 relative z-10">

                {/* Sub-Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-down">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl transform -rotate-3">
                            <Activity className="w-6 h-6 md:w-8 md:h-8 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 italic uppercase decoration-brand-500/30 underline-offset-4">Admin Dashboard</h1>
                            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.4em]">{admin.hospitalName} <span className="mx-2 text-neutral-600">/</span> Control Center</p>
                        </div>
                    </div>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 animate-fade-up">
                    {[
                        { label: "Active Doctors", value: doctors.length, icon: <Stethoscope className="w-5 h-5" />, color: "text-brand-400 bg-brand-500/5 border-brand-500/20" },
                        { label: "Receptionists", value: receptionists.length, icon: <Users className="w-5 h-5" />, color: "text-success-400 bg-success-500/5 border-success-500/20" },
                        { label: "Queue Load", value: "84%", icon: <Activity className="w-5 h-5" />, color: "text-info-400 bg-info-500/5 border-info-500/20" },
                        { label: "System Status", value: "Live", icon: <ShieldCheck className="w-5 h-5" />, color: "text-warning-400 bg-warning-500/5 border-warning-500/20" },
                    ].map(({ label, value, icon, color }) => (
                        <div key={label} className={`group relative bg-white/[0.03] border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:bg-white/[0.05] flex flex-col items-center text-center backdrop-blur-xl ${color}`}>
                            <div className="absolute top-4 right-4 sm:top-5 sm:right-5 opacity-40 group-hover:opacity-100 transition-opacity translate-y-[-2px]">{icon}</div>
                            <span className="text-2xl sm:text-4xl font-black tracking-tighter mb-1 font-mono">{value.toString().padStart(2, '0')}</span>
                            <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-neutral-400">{label}</p>
                        </div>
                    ))}
                </div>

                {msg && (
                    <div className="mb-8 p-5 rounded-[2rem] bg-brand-500/10 border border-brand-500/30 text-brand-400 font-black uppercase tracking-widest animate-fade-up flex items-center justify-center gap-3 text-[10px] backdrop-blur-xl">
                        <CheckCircle className="w-4 h-4" /> {msg}
                    </div>
                )}

                <div className="space-y-10">
                    {/* ROW 1: ENROLLMENT FORMS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                        {/* SECTION: DOCTOR ENROLLMENT */}
                        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl relative overflow-hidden animate-fade-up">
                            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-brand-600/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-4 mb-8">
                                <Plus className="w-5 h-5 text-brand-400" />
                                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase tracking-[0.2em]">Add New Doctor</h2>
                            </div>

                            <form onSubmit={handleAddDoctor} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Doctor Name</label>
                                        <input
                                            placeholder="e.g. Dr. Arthur Ledger"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={doctorForm.name}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Specialization</label>
                                        <input
                                            placeholder="e.g. Cardiology"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={doctorForm.specialization}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="doctor@hospital.com"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={doctorForm.email}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Password</label>
                                        <input
                                            type="password"
                                            placeholder="********"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-brand-500/50 focus:bg-white/[0.05] text-[13px] font-mono"
                                            value={doctorForm.password}
                                            onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-5 mt-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : "Add Doctor"}
                                </button>
                            </form>
                        </div>

                        {/* SECTION: RECEPTIONIST ENROLLMENT */}
                        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-6 backdrop-blur-3xl relative overflow-hidden animate-fade-up delay-100">
                            <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-success-600/5 blur-[80px] rounded-full pointer-events-none" />
                            <div className="flex items-center gap-4 mb-8">
                                <Plus className="w-5 h-5 text-success-400" />
                                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase tracking-[0.2em]">Add New Receptionist</h2>
                            </div>

                            <form onSubmit={handleAddReceptionist} className="space-y-4">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Staff Name</label>
                                        <input
                                            placeholder="e.g. John Matrix"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={receptionistForm.name}
                                            onChange={(e) => setReceptionistForm({ ...receptionistForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-5 italic">Work Email</label>
                                        <input
                                            type="email"
                                            placeholder="staff@hospital.com"
                                            className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-[13px]"
                                            value={receptionistForm.email}
                                            onChange={(e) => setReceptionistForm({ ...receptionistForm, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-5">Password</label>
                                    <input
                                        type="password"
                                        placeholder="********"
                                        className="w-full bg-white/[0.03] border border-white/5 p-3.5 sm:p-4 rounded-2xl text-white placeholder-neutral-500 outline-none transition-all focus:border-success-500/50 focus:bg-white/[0.05] text-xs font-mono"
                                        value={receptionistForm.password}
                                        onChange={(e) => setReceptionistForm({ ...receptionistForm, password: e.target.value })}
                                        required
                                    />
                                </div>

                                 <div className="space-y-3">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-5">Assign Doctor</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {doctors.map((d) => (
                                            <button
                                                key={d._id}
                                                type="button"
                                                onClick={() => handleDoctorSelection(d._id)}
                                                className={`p-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all ${receptionistForm.assignedDoctors.includes(d._id as any) ? "bg-white text-black border-white shadow-xl scale-105" : "bg-white/5 border-white/5 text-neutral-400 hover:border-white/20"}`}
                                            >
                                                {d.name.split(' ').pop()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 sm:py-5 mt-2 rounded-2xl bg-success-600 hover:bg-success-500 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-success-600/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : "Add Receptionist"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ROW 2: ACTIVE LISTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                        {/* SECTION: DOCTOR LIST */}
                        <div className="space-y-4 animate-fade-up delay-200">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-6 italic">Active Doctor Protocol Nodes</h3>
                            <div className="space-y-3">
                                {doctors.length === 0 ? (
                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl text-neutral-700 font-bold uppercase tracking-widest text-[9px]">No active clinician nodes</div>
                                ) : (
                                    doctors.map((doc) => (
                                        <div key={doc._id} className="group bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all backdrop-blur-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                        <Stethoscope className="w-4 h-4" />
                                                    </div>
                                                     <div className="min-w-0">
                                                        <h4 className="text-sm font-black truncate text-white">{doc.name}</h4>
                                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">{doc.specialization}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => handleToggleReveal(doc._id)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-500 hover:text-white transition-all" title="Reveal Info"><Key className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleOpenSchedule(doc)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-info-500 hover:text-white transition-all" title="Manage Schedule"><Clock className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteStaff(doc._id, doc.name)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-danger-500 hover:text-white transition-all text-danger-500 hover:border-danger-500" title="Delete Doctor"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                             {revealedIds.includes(doc._id) && (
                                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-fade-down">
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Email Node</p>
                                                        <p className="text-[10px] font-bold text-neutral-300 truncate">{doc.email}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Password</p>
                                                        <p className="text-[10px] font-mono font-bold text-white uppercase">{doc.creationPassword || "Encrypted"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SECTION: RECEPTIONIST LIST */}
                        <div className="space-y-4 animate-fade-up delay-300">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-6 italic">Front Desk Staff</h3>
                            <div className="space-y-3">
                                {receptionists.length === 0 ? (
                                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-3xl text-neutral-700 font-bold uppercase tracking-widest text-[9px]">No active staff nodes</div>
                                ) : (
                                    receptionists.map((rec) => (
                                        <div key={rec._id} className="group bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.06] hover:border-white/20 transition-all backdrop-blur-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 bg-success-500/10 border border-success-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-success-500 group-hover:text-white transition-all">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                     <div className="min-w-0">
                                                        <h4 className="text-sm font-black truncate text-white">{rec.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Office Hub</span>
                                                            {rec.assignedDoctors?.length > 0 && (
                                                                <span className="text-[7px] font-black bg-success-500/20 text-success-400 px-1.5 py-0.5 rounded-full border border-success-500/30">ASSIGNED</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <button onClick={() => setEditingAssignmentRec(rec)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-success-500 hover:text-white transition-all font-bold" title="Update Assignment"><UserPlus className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleToggleReveal(rec._id)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-brand-500 hover:text-white transition-all" title="Recall Info"><Key className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteStaff(rec._id, rec.name)} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-danger-500 hover:text-white transition-all text-danger-500 hover:border-danger-500" title="Terminate Node"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                             {revealedIds.includes(rec._id) && (
                                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 animate-fade-down">
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Email</p>
                                                        <p className="text-[10px] font-bold text-neutral-300 truncate">{rec.email}</p>
                                                    </div>
                                                    <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                                                        <p className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">Password</p>
                                                        <p className="text-[10px] font-mono font-bold text-white uppercase">{rec.creationPassword || "Encrypted"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL: SCHEDULE */}
            {editingScheduleDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-[#0a0a0a] w-full max-w-2xl rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                             <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Work Schedule</h2>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mt-1">Dr. {editingScheduleDoc.name}</p>
                            </div>
                            <button onClick={() => setEditingScheduleDoc(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-neutral-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            {scheduleForm.map((dayObj, i) => (
                                <div key={dayObj.day} className="grid grid-cols-3 gap-6 items-center bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/5 hover:border-brand-500/30 transition-all">
                                    <div className="font-black text-[10px] uppercase tracking-widest text-neutral-400 pl-2">{dayObj.day}</div>
                                     <div className="space-y-1">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">START</p>
                                        <input
                                            type="time"
                                            value={dayObj.startTime}
                                            onChange={(e) => handleScheduleChange(i, "startTime", e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white focus:border-brand-500/50 outline-none font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">END</p>
                                        <input
                                            type="time"
                                            value={dayObj.endTime}
                                            onChange={(e) => handleScheduleChange(i, "endTime", e.target.value)}
                                            className="w-full bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white focus:border-brand-500/50 outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
                            <button onClick={() => setEditingScheduleDoc(null)} className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Back</button>
                            <button onClick={handleSaveSchedule} disabled={loading} className="px-10 py-4 rounded-[1.5rem] bg-brand-600 hover:bg-brand-500 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-600/20 transition-all active:scale-95">Save Schedule</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: ASSIGNMENT */}
            {editingAssignmentRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-[#0a0a0a] w-full max-w-md rounded-[3.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]">
                         <div className="px-10 py-10 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Assign Doctor</h2>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] mt-1">Reassigning {editingAssignmentRec.name}</p>
                        </div>

                        <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                            {doctors.map(d => (
                                <button
                                    key={d._id}
                                    onClick={() => handleUpdateAssignment(editingAssignmentRec._id, d._id)}
                                    className={`w-full flex items-center gap-5 p-6 rounded-[2rem] border transition-all text-left ${editingAssignmentRec.assignedDoctors?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'bg-brand-600 text-white border-brand-500 shadow-2xl' : 'bg-white/5 border-white/5 text-neutral-500 hover:border-white/20'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${editingAssignmentRec.assignedDoctors?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'bg-white/20' : 'bg-white/5'}`}>
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-black truncate">{d.name}</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${editingAssignmentRec.assignedDoctors?.some((ad: any) => ad._id === d._id || ad === d._id) ? 'text-white/60' : 'text-neutral-700'}`}>{d.specialization}</p>
                                    </div>
                                    {editingAssignmentRec.assignedDoctors?.some((ad: any) => ad._id === d._id || ad === d._id) && (
                                        <CheckCircle className="w-5 h-5 ml-auto text-white" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-10 border-t border-white/5 bg-white/[0.02] flex justify-end">
                            <button onClick={() => setEditingAssignmentRec(null)} className="px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:text-white transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
