"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { io } from "socket.io-client";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Power,
  Activity,
  ShieldAlert,
  GripVertical,
  Smartphone,
  Copy,
  Calendar,
  UserPlus,
  RefreshCw,
  CalendarPlus,
  MonitorSmartphone,
  X,
  Bell,
  User as UserIcon,
  Briefcase,
  Layers,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ScrollReveal from "@/components/ScrollReveal";

export default function OperatorDashboard() {
  const [operator, setOperator] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [availabilities, setAvailabilities] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("add"); // add, queue, appointments
  const [activeTab, setActiveTab] = useState("walkin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    priority: "NORMAL",
    agentId: "",
  });
  const [appointmentForm, setAppointmentForm] = useState({
    name: "",
    email: "",
    phone: "",
    scheduledAt: "",
    notes: "",
    agentId: "",
  });
  const [lastAddedLink, setLastAddedLink] = useState("");
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function loadOperator() {
    try {
      const meRes = await api.get("/auth/me");
      const userData = meRes.data;

      if (userData.role !== "OPERATOR" && userData.role !== "ORG_ADMIN") {
        router.push("/agent");
        return;
      }
      if (userData.role === "ORG_ADMIN") {
        const staffRes = await api.get("/organizations/staff");
        const allStaff = staffRes.data || [];
        const operatorsList = allStaff.filter((s) => s.role === "OPERATOR");
        if (operatorsList.length > 0) {
          setOperator(operatorsList[0]);
        } else {
          router.push("/org-admin/dashboard");
        }
      } else {
        setOperator(userData);
      }
    } catch (err) {
      if (err.response?.status === 401) router.push("/login");
    }
  }

  useEffect(() => {
    loadOperator();
  }, []);

  useEffect(() => {
    if (!operator) return;
    api
      .get("/organizations/info")
      .then((res) => {
        setOrganization(res.data?.organizationId);
      })
      .catch(() => {});

    if (operator.assignedAgents) {
      const initial = {};
      operator.assignedAgents.forEach((a) => {
        initial[a._id] = {
          availability: a.availability || "Available",
          pauseMessage: a.pauseMessage || "",
        };
      });
      setAvailabilities(initial);
    }
  }, [operator]);

  const appointmentsEnabled = organization
    ? organization.settings?.allowAppointments !== false
    : true;

  useEffect(() => {
    if (!operator) return;

    const socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
      },
    );

    socket.on("connect", () => {
      loadQueue();
      if (appointmentsEnabled) loadAppointments();
    });

    socket.on("queue.updated", loadQueue);
    socket.on("queueUpdated", loadQueue);
    socket.on("agentAvailabilityChanged", (data) => {
      setAvailabilities((prev) => ({
        ...prev,
        [data.agentId]: {
          availability: data.availability,
          pauseMessage: data.pauseMessage,
        },
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [operator, appointmentsEnabled]);

  useEffect(() => {
    if (operator) {
      loadQueue();
      if (appointmentsEnabled) loadAppointments();
    }
  }, [operator, appointmentsEnabled]);

  async function loadQueue() {
    try {
      let allQueues = [];
      let totalCompleted = 0;
      const today = new Date().toISOString().split("T")[0];

      const agents = operator.assignedAgents || [];
      for (let agent of agents) {
        const res = await api.get(`/queue/${agent._id}`);
        allQueues = [...allQueues, ...res.data];

        const histRes = await api.get(
          `/queue/history/?agentId=${agent._id}&date=${today}&status=completed`,
        );
        totalCompleted += histRes.data.length;
      }

      allQueues.sort((a, b) => {
        const pMap = { EMERGENCY: 1, HIGH: 2, NORMAL: 3 };
        if (pMap[a.priority] !== pMap[b.priority])
          return pMap[a.priority] - pMap[b.priority];
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setQueue(allQueues);
      setCompletedCount(totalCompleted);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadAppointments() {
    try {
      let allApps = [];
      const agents = operator.assignedAgents || [];
      for (let agent of agents) {
        const res = await api.get(`/appointments/agent/${agent._id}/upcoming`);
        allApps = [...allApps, ...res.data];
      }
      allApps.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
      setAppointments(allApps);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddCustomer(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/queue/add", {
        name: form.name,
        number: form.phone,
        email: form.email,
        agentId: form.agentId,
        priority: form.priority,
        notes: form.notes,
      });
      const link =
        res.data.entry?.uniqueLinkId || res.data.customer?.uniqueLinkId || "";
      setLastAddedLink(link);
      showMsg("Customer enrolled successfully", "success");
      setForm({
        name: "",
        email: "",
        phone: "",
        notes: "",
        priority: "NORMAL",
        agentId: form.agentId,
      });
      loadQueue();
    } catch (err) {
      showMsg(
        err.response?.data?.message || "Error enrolling customer",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function bookAppointment(e) {
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
      showMsg("Appointment booked successfully", "success");
      setAppointmentForm({
        name: "",
        email: "",
        phone: "",
        scheduledAt: "",
        notes: "",
        agentId: appointmentForm.agentId,
      });
      loadAppointments();
    } catch (err) {
      showMsg(
        err.response?.data?.message || "Error booking appointment",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  async function markArrived(appointmentId) {
    try {
      const res = await api.put(`/appointments/${appointmentId}/arrive`);
      const appt = res.data.appointment;

      await api.post("/queue/add", {
        name: appt.clientName || appt.customerName,
        number: appt.clientPhone || appt.phone,
        email: appt.clientEmail || appt.email,
        agentId: appt.agentId,
        priority: "NORMAL",
        notes: `[Appt] ${appt.notes || ""}`,
      });
      showMsg("Client marked arrived and enqueued", "success");
      loadAppointments();
      loadQueue();
    } catch (err) {
      showMsg(err.response?.data?.message || "Error marking arrival", "error");
    }
  }

  async function completeVisit(id) {
    try {
      await api.put(`/queue/complete/${id}`);
      showMsg("Visit completed successfully", "success");
      loadQueue();
    } catch (err) {
      showMsg("Error finalizing visit", "error");
    }
  }

  async function cancelVisit(id) {
    if (
      !confirm(
        "Are you sure you want to cancel this visit? This action is irreversible.",
      )
    )
      return;
    try {
      await api.put(`/queue/cancel/${id}`);
      showMsg("Visit cancelled successfully", "success");
      loadQueue();
    } catch (err) {
      showMsg("Error cancelling visit", "error");
    }
  }

  function showMsg(text, type) {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = queue.findIndex((q) => q._id === active.id);
    const newIndex = queue.findIndex((q) => q._id === over.id);
    if (oldIndex > 2 || newIndex > 2) {
      showMsg("Manual reorder restricted to top 3 slots", "error");
      return;
    }

    const newQueue = arrayMove(queue, oldIndex, newIndex);
    setQueue(newQueue);

    const agentId = active.data.current?.agentId;
    if (!agentId) return;

    const agentQueue = newQueue.filter(
      (p) => (p.agentId?._id || p.agentId) === agentId,
    );
    const top3Ids = agentQueue.slice(0, 3).map((p) => p._id);

    try {
      await api.put(`/queue/reorder/${agentId}`, { newOrder: top3Ids });
    } catch (err) {
      console.error("Reorder failed", err);
      loadQueue();
    }
  }

  const copyStatusLink = (uid) => {
    const url = `${window.location.origin}/status/${uid}`;
    navigator.clipboard.writeText(url);
    showMsg("Live Tracking Link Copied", "success");
  };

  if (!operator) return <Loader message="Loading Operator Desk..." />;

  const agents = operator.assignedAgents || [];

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
                <MonitorSmartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Operator Desk
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Front Desk Check-in • {organization?.name || "Standard Registry"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Connected
              </div>
              <button
                onClick={() => router.push("/login")}
                className="btn-secondary-white text-xs px-4 py-2 text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <Power className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Metrics Bar */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Today's Total",
                value: queue.length + completedCount,
                icon: Users,
              },
              {
                label: "Waiting in Line",
                value: queue.length,
                icon: Activity,
              },
              {
                label: "Completed Visits",
                value: completedCount,
                icon: CheckCircle,
              },
              {
                label: "Active Desks",
                value: agents.length,
                icon: Briefcase,
              },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {m.label}
                    </span>
                    <Icon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900">
                    {m.value}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Main Work Area */}
        <ScrollReveal direction="up" delay={150}>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            {/* Mode Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-8 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200/80">
              <button
                onClick={() => {
                  setTab("add");
                  setActiveTab("walkin");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === "add" && activeTab === "walkin"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Walk-in Enrollment
              </button>
              {appointmentsEnabled && (
                <button
                  onClick={() => {
                    setTab("add");
                    setActiveTab("appointment");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === "add" && activeTab === "appointment"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <CalendarPlus className="w-3.5 h-3.5" /> Book Appointment
                </button>
              )}
              <button
                onClick={() => setTab("queue")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === "queue"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Live Queue Monitor ({queue.length})
              </button>
            </div>

            {msg && (
              <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> {msg}
                </div>
                {lastAddedLink && (
                  <button
                    onClick={() => copyStatusLink(lastAddedLink)}
                    className="btn-secondary-white text-[11px] px-3 py-1 text-slate-900"
                  >
                    <Copy className="w-3 h-3" /> Copy Tracking Link
                  </button>
                )}
              </div>
            )}

            {/* TAB: WALK-IN ENROLLMENT */}
            {tab === "add" && activeTab === "walkin" && (
              <div className="max-w-2xl mx-auto py-4">
                <div className="mb-6">
                  <span className="eyebrow-tag mb-2">
                    ← RAPID ENROLLMENT
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Add Walk-in Visitor
                  </h2>
                </div>

                <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Visitor Full Name</label>
                    <input
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone</label>
                    <input
                      placeholder="Phone number"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="visitor@email.com"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Assign Agent Desk</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white cursor-pointer"
                      value={form.agentId}
                      onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select assigned agent...</option>
                      {agents.map((a) => {
                        const status = availabilities[a._id]?.availability;
                        const isOff = status === "Not Available" || status === "Unavailable";
                        return (
                          <option key={a._id} value={a._id}>
                            {a.name} ({a.serviceCategory || "General"}) {isOff ? " [PAUSED]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Visit Notes / Reason</label>
                    <input
                      placeholder="Reason for visit or special notes..."
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary-obsidian w-full py-3.5 text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Enroll & Generate Ticket"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: BOOK APPOINTMENT */}
            {tab === "add" && activeTab === "appointment" && (
              <div className="max-w-2xl mx-auto py-4">
                <div className="mb-6">
                  <span className="eyebrow-tag mb-2">
                    ← ADVANCED SCHEDULING
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Schedule Future Appointment
                  </h2>
                </div>

                <form onSubmit={bookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Customer Name</label>
                    <input
                      placeholder="Full Name"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={appointmentForm.name}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Contact Phone</label>
                    <input
                      placeholder="10-digit number"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={appointmentForm.phone}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Assign Agent</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white cursor-pointer"
                      value={appointmentForm.agentId}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, agentId: e.target.value })}
                      required
                    >
                      <option value="" disabled>Select Agent...</option>
                      {agents.map((a) => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Date &amp; Time</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={appointmentForm.scheduledAt}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, scheduledAt: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Requirements / Notes</label>
                    <textarea
                      placeholder="Special requirements..."
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white h-24 resize-none"
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                    />
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary-obsidian w-full py-3.5 text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Confirm Appointment Booking"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: LIVE QUEUE & MONITOR */}
            {tab === "queue" && (
              <div className="grid lg:grid-cols-12 gap-8 py-2">
                {/* Drag & Drop Queue */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Active Live Lineup
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Drag to prioritize top 3 slots
                    </span>
                  </div>

                  {queue.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">No customers currently waiting.</p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={queue.map((p) => p._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {queue.map((p) => (
                          <SortableItem
                            key={p._id}
                            item={p}
                            onComplete={() => completeVisit(p._id)}
                            onCancel={() => cancelVisit(p._id)}
                            onCopyLink={() => copyStatusLink(p.uniqueLinkId)}
                            agentStatus={availabilities[p.agentId?._id || p.agentId]}
                            onCopyPhone={() => {
                              navigator.clipboard.writeText(p.phone || p.number);
                              showMsg("Phone copied to clipboard", "success");
                            }}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </div>

                {/* Upcoming Appointments List */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Scheduled Arrivals
                    </span>
                    <button
                      onClick={loadAppointments}
                      className="text-xs font-bold text-slate-900 hover:underline"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                    {appointments.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        No appointments scheduled for upcoming days.
                      </div>
                    ) : (
                      appointments.map((a) => (
                        <div key={a._id} className="p-4 hover:bg-white transition-colors flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {a.customerName || a.guestName}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {new Date(a.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })} at {new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Agent: {a.agentName || a.agentId?.name || "Standard"}
                            </p>
                          </div>
                          <button
                            onClick={() => markArrived(a._id)}
                            className="btn-primary-obsidian text-xs px-3 py-1.5"
                            title="Mark Arrived"
                          >
                            Arrived
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function SortableItem({
  item,
  onComplete,
  onCancel,
  onCopyLink,
  onCopyPhone,
  agentStatus,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item._id,
    data: {
      agentId: item.agentId?._id || item.agentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        isDragging
          ? "bg-slate-100 border-slate-400 shadow-lg"
          : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-800"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center">
          {item.tokenNumber}
        </span>

        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {item.customerName || item.name}
          </h4>
          <p className="text-xs text-slate-500">
            Desk: {item.agentId?.name || item.agentName || "Agent"} • Status: {item.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onCopyLink}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
          title="Copy Live Status Link"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onComplete}
          className="p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
          title="Mark Completed"
        >
          <CheckCircle className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
          title="Cancel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
