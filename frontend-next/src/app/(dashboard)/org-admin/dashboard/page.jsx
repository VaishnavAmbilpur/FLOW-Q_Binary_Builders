"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import {
  Users,
  UserPlus,
  CheckCircle,
  Briefcase,
  Activity,
  Clock,
  X,
  Key,
  Trash2,
  Plus,
  ShieldCheck,
  Layers,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [agentForm, setAgentForm] = useState({
    name: "",
    email: "",
    serviceCategory: "",
    password: "",
  });
  const [operatorForm, setOperatorForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedAgents: [],
  });

  // Lists
  const [agents, setAgents] = useState([]);
  const [operators, setOperators] = useState([]);
  const [revealedIds, setRevealedIds] = useState([]);
  const [editingAssignmentOp, setEditingAssignmentOp] = useState(null);

  // Scheduling State
  const [editingScheduleAgent, setEditingScheduleAgent] = useState(null);
  const [scheduleForm, setScheduleForm] = useState([]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const meRes = await api.get("/organizations/info");
      const userData = meRes.data;

      if (userData.role !== "ORG_ADMIN") {
        router.push("/login");
        return;
      }
      setAdmin(userData);

      const staffRes = await api.get("/organizations/staff");
      const allStaff = staffRes.data || [];
      const agentsList = allStaff.filter((s) => s.role === "AGENT");
      const operatorsList = allStaff.filter((s) => s.role === "OPERATOR");
      setAgents(agentsList);
      setOperators(operatorsList);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        showMsg("Failed to load dashboard data. Please refresh.", "error");
      }
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/organizations/staff/agent", agentForm);
      showMsg("Agent added successfully", "success");
      setAgentForm({ name: "", email: "", serviceCategory: "", password: "" });
      loadAdminData();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add agent", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = async (e) => {
    e.preventDefault();
    if (operatorForm.assignedAgents.length === 0) {
      showMsg("Select at least one agent first!", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/organizations/staff/operator", operatorForm);
      showMsg("Operator added successfully", "success");
      setOperatorForm({
        name: "",
        email: "",
        password: "",
        assignedAgents: [],
      });
      loadAdminData();
    } catch (err) {
      showMsg(err.response?.data?.message || "Failed to add operator", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelection = (id) => {
    setOperatorForm((prev) => ({
      ...prev,
      assignedAgents: [id],
    }));
  };

  const handleToggleReveal = (id) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleDeleteStaff = async (id, name) => {
    if (!confirm(`Are you sure you want to remove staff member: ${name}?`)) return;
    setLoading(true);
    try {
      await api.delete(`/organizations/staff/${id}`);
      showMsg(`Removed: ${name}`, "success");
      loadAdminData();
    } catch (err) {
      showMsg("Removal failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSchedule = (agent) => {
    setEditingScheduleAgent(agent);
    const currentSchedule = agent.schedule || [];
    const initialForm = daysOfWeek.map((day) => {
      const found = currentSchedule.find((s) => s.day === day);
      return {
        day,
        startTime: found?.startTime || "",
        endTime: found?.endTime || "",
      };
    });
    setScheduleForm(initialForm);
  };

  const handleScheduleChange = (index, field, val) => {
    const updated = [...scheduleForm];
    updated[index] = { ...updated[index], [field]: val };
    setScheduleForm(updated);
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      const finalSchedule = scheduleForm.filter(
        (s) => s.startTime && s.endTime,
      );
      await api.put(
        `/organizations/staff/${editingScheduleAgent._id}/schedule`,
        { schedule: finalSchedule },
      );
      showMsg("Schedule updated successfully", "success");
      setEditingScheduleAgent(null);
      loadAdminData();
    } catch (err) {
      showMsg("Failed to update schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (opId, agentId) => {
    try {
      await api.put(`/organizations/staff/${opId}/assign`, { agentId });
      showMsg("Agent assigned successfully", "success");
      setEditingAssignmentOp(null);
      loadAdminData();
    } catch (err) {
      showMsg("Reassignment failed", "error");
    }
  };

  function showMsg(text, type) {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  }

  if (!admin) return <Loader message="Loading Organization Dashboard..." />;

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header Area */}
        <ScrollReveal direction="up" delay={50}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Organization Dashboard
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  {admin.organizationId?.name || "Organization Overview"} • Admin Console
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                System Active
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* System Metrics */}
        <ScrollReveal direction="up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Active Agents", value: agents.length, icon: Activity },
              { label: "Operators", value: operators.length, icon: Users },
              { label: "Staff Nodes", value: agents.length + operators.length, icon: Briefcase },
              { label: "System Status", value: "Operational", icon: ShieldCheck },
            ].map(({ label, value, icon: Icon }, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {label}
                  </span>
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-3xl font-black font-mono text-slate-900">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {msg && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-2.5 shadow-md">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {msg}
          </div>
        )}

        {/* Enrollment Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Add Agent */}
          <ScrollReveal direction="up" delay={150}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
              <div className="mb-6">
                <span className="eyebrow-tag mb-2">
                  ← STAFF PROVISIONING
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Add Service Agent
                </h2>
              </div>

              <form onSubmit={handleAddAgent} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Agent Name</label>
                      <input
                        placeholder="e.g. Dr. Sarah Jenkins"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={agentForm.name}
                        onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Service Category</label>
                      <input
                        placeholder="e.g. Consultation"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={agentForm.serviceCategory}
                        onChange={(e) => setAgentForm({ ...agentForm, serviceCategory: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Login Email</label>
                      <input
                        type="email"
                        placeholder="agent@org.com"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={agentForm.email}
                        onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Temporary Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={agentForm.password}
                        onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-obsidian w-full py-3.5 text-xs font-bold mt-4 shadow-sm disabled:opacity-50"
                >
                  Create Agent Counter
                </button>
              </form>
            </div>
          </ScrollReveal>

          {/* Add Operator */}
          <ScrollReveal direction="up" delay={200}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm h-full flex flex-col">
              <div className="mb-6">
                <span className="eyebrow-tag mb-2">
                  ← DESK PROVISIONING
                </span>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Add Front Desk Operator
                </h2>
              </div>

              <form onSubmit={handleAddOperator} className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Operator Name</label>
                      <input
                        placeholder="e.g. John Operator"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={operatorForm.name}
                        onChange={(e) => setOperatorForm({ ...operatorForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Work Email</label>
                      <input
                        type="email"
                        placeholder="operator@org.com"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                        value={operatorForm.email}
                        onChange={(e) => setOperatorForm({ ...operatorForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 focus:bg-white"
                      value={operatorForm.password}
                      onChange={(e) => setOperatorForm({ ...operatorForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Assign to Agent Desk</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {agents.map((d) => (
                        <button
                          key={d._id}
                          type="button"
                          onClick={() => handleAgentSelection(d._id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            operatorForm.assignedAgents.includes(d._id)
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-obsidian w-full py-3.5 text-xs font-bold mt-4 shadow-sm disabled:opacity-50"
                >
                  Create Operator Account
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Staff Management Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Agents */}
          <ScrollReveal direction="up" delay={250}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Active Agents ({agents.length})
                </h3>
              </div>

              {agents.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No agents registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{agent.name}</h4>
                        <p className="text-xs text-slate-500">{agent.serviceCategory} • {agent.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleReveal(agent._id)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900"
                          title="Reveal Info"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenSchedule(agent)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900"
                          title="Manage Schedule"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(agent._id, agent.name)}
                          className="p-2 bg-white border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Active Operators */}
          <ScrollReveal direction="up" delay={300}>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Active Operators ({operators.length})
                </h3>
              </div>

              {operators.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No operators registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {operators.map((op) => (
                    <div key={op._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{op.name}</h4>
                        <p className="text-xs text-slate-500">{op.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingAssignmentOp(op)}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900"
                          title="Reassign Agent"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(op._id, op.name)}
                          className="p-2 bg-white border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* SCHEDULE MODAL */}
      {editingScheduleAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Work Hours Schedule</h3>
                <p className="text-xs text-slate-500">Agent: {editingScheduleAgent.name}</p>
              </div>
              <button
                onClick={() => setEditingScheduleAgent(null)}
                className="p-2 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {scheduleForm.map((dayObj, i) => (
                <div key={dayObj.day} className="grid grid-cols-3 gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900">{dayObj.day}</span>
                  <input
                    type="time"
                    value={dayObj.startTime}
                    onChange={(e) => handleScheduleChange(i, "startTime", e.target.value)}
                    className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="time"
                    value={dayObj.endTime}
                    onChange={(e) => handleScheduleChange(i, "endTime", e.target.value)}
                    className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-mono"
                  />
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingScheduleAgent(null)}
                className="btn-secondary-white text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="btn-primary-obsidian text-xs px-5 py-2"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGNMENT MODAL */}
      {editingAssignmentOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6">
            <h3 className="text-lg font-black text-slate-900 mb-1">Assign Agent</h3>
            <p className="text-xs text-slate-500 mb-6">Select desk agent for {editingAssignmentOp.name}</p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {agents.map((d) => (
                <button
                  key={d._id}
                  onClick={() => handleUpdateAssignment(editingAssignmentOp._id, d._id)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-colors flex items-center justify-between text-xs font-bold"
                >
                  <span>{d.name} ({d.serviceCategory})</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEditingAssignmentOp(null)}
                className="btn-secondary-white text-xs px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
