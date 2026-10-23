"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Edit,
  Sliders,
  RotateCcw,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  Sparkles,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight,
  Filter,
  Download,
  Zap,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("ALL");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("USER");
  const [editPlan, setEditPlan] = useState("STARTER");
  const [editQuota, setEditQuota] = useState(500);
  const [editExpiryDays, setEditExpiryDays] = useState<string>("30");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [recoveryCodeInfo, setRecoveryCodeInfo] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
    const timer = setInterval(() => {
      fetchUsers(false);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role);
    const ws = user.workspaces?.[0]?.workspace;
    setEditPlan(ws?.plan || "STARTER");
    setEditQuota(ws?.dailyQuota || 100);
    if (ws?.daysRemaining !== null && ws?.daysRemaining !== undefined && ws?.daysRemaining > 0) {
      setEditExpiryDays(String(ws.daysRemaining));
    } else if (ws?.planExpiresAt) {
      setEditExpiryDays("0");
    } else {
      setEditExpiryDays(ws?.plan === "STARTER" ? "0" : "30");
    }
    setNewPassword("");
    setShowPassword(false);
    setRecoveryCodeInfo(null);
    setCopiedCode(false);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setShowPassword(true);
  };

  const handleSendResetEmail = async () => {
    if (!selectedUser) return;
    try {
      setSendingReset(true);
      const res = await fetch("/api/admin/users/send-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecoveryCodeInfo(data.recoveryCode || "CODE_SENT");
        setToastMsg(`Password reset verification email sent to ${selectedUser.email}`);
        setTimeout(() => setToastMsg(""), 4500);
      } else {
        alert(data.error || "Failed to dispatch reset email");
      }
    } catch (e) {
      console.error(e);
      alert("Network error sending reset email");
    } finally {
      setSendingReset(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdating(true);
      const ws = selectedUser.workspaces?.[0]?.workspace;
      const payload: any = {
        userId: selectedUser.id,
        workspaceId: ws?.id,
        role: editRole,
        plan: editPlan,
        dailyQuota: Number(editQuota),
        expiryDays: editExpiryDays !== "" ? Number(editExpiryDays) : null,
      };

      if (newPassword.trim()) {
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok) {
        setSelectedUser(null);
        setToastMsg(
          newPassword.trim()
            ? `Updated permissions & reset password for ${selectedUser.email}`
            : `Updated permissions for ${selectedUser.email}`
        );
        setTimeout(() => setToastMsg(""), 3500);
        fetchUsers();
      } else {
        alert(resData.error || "Failed to update account settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error updating account.");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetQuota = async (user: any) => {
    const ws = user.workspaces?.[0]?.workspace;
    if (!ws) return;
    if (!confirm(`Reset today's used quota for ${user.email} back to 0?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          resetUsedToday: true,
        }),
      });
      if (res.ok) {
        setToastMsg(`Reset used quota counter for ${user.email}`);
        setTimeout(() => setToastMsg(""), 3500);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const ws = u.workspaces?.[0]?.workspace;
    const matchesPlan = filterPlan === "ALL" || (ws?.plan || "STARTER") === filterPlan;
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesPlan && matchesRole;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            Registered Platform Users & Workspaces
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of all Sendport accounts, active roles, workspace daily quotas, and sending permissions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchUsers(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1424] px-3.5 py-2 text-xs font-bold text-white hover:bg-white/5 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-20 bg-slate-800/60 rounded animate-pulse my-2" />
          ) : (
            <p className="text-3xl font-black text-white mt-2">{stats?.totalUsers || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Registered tenant accounts</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workspaces</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-20 bg-slate-800/60 rounded animate-pulse my-2" />
          ) : (
            <p className="text-3xl font-black text-amber-400 mt-2">{stats?.activeWorkspacesCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Isolated client workspaces</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-5 shadow-xl hover:border-white/10 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Admins</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-20 bg-slate-800/60 rounded animate-pulse my-2" />
          ) : (
            <p className="text-3xl font-black text-emerald-400 mt-2">{stats?.totalAdmins || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Root administrator accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by email, name, or workspace ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#080d19] pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-[#080d19] p-1 rounded-xl border border-white/5 text-xs">
            {(["ALL", "STARTER", "GROWTH", "SCALE_PRO"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlan(p)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  filterPlan === p
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p === "ALL" ? "All Plans" : p}
              </button>
            ))}
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#080d19] px-3 py-1.5 text-xs text-slate-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Regular Users</option>
            <option value="ADMIN">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1424] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-[#080d19] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Accounts Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-400">
              {filtered.length} found
            </span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Direct Quota & Plan Overrides Active
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-white/[0.02] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No users found matching current search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-[#080d19] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Workspace & Plan</th>
                  <th className="p-4">Plan Validity</th>
                  <th className="p-4">Daily Sending Limit</th>
                  <th className="p-4">Resources</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((user) => {
                  const ws = user.workspaces?.[0]?.workspace;
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-xs">{user.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{user.name || "No display name"}</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">{user.id}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            user.role === "ADMIN"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800/80 text-slate-300 border border-white/5"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{ws?.name || "Default Workspace"}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            ws?.plan === "SCALE_PRO"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : ws?.plan === "GROWTH"
                              ? "bg-primary-500/15 text-primary-300 border border-primary-500/30"
                              : "bg-slate-800 text-slate-400 border border-white/5"
                          }`}
                        >
                          {ws?.plan || "STARTER"}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap" suppressHydrationWarning>
                        {ws?.planExpiresAt ? (
                          ws.daysRemaining !== null && ws.daysRemaining > 0 ? (
                            <div className="space-y-0.5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold ${
                                  ws.daysRemaining <= 5
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                ⏳ {ws.daysRemaining} {ws.daysRemaining === 1 ? "day" : "days"} left
                              </span>
                              <p className="text-[10px] font-mono text-slate-400">
                                Until {new Date(ws.planExpiresAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                ⚠️ Expired
                              </span>
                              <p className="text-[10px] font-mono text-rose-500/80">
                                Ended {new Date(ws.planExpiresAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </p>
                            </div>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                            Lifetime / Free
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold font-mono text-amber-400">
                          {ws?.dailyQuota ? ws.dailyQuota.toLocaleString() : "100"} <span className="font-sans text-[11px] text-slate-400 font-normal">emails/day</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">Used today: {ws?.usedToday || 0}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p><span className="text-white font-bold">{user._count?.domains || 0}</span> Domains</p>
                          <p><span className="text-white font-bold">{user._count?.apiKeys || 0}</span> API Keys</p>
                          <p><span className="text-white font-bold">{user._count?.payments || 0}</span> Slips</p>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleResetQuota(user)}
                          title="Reset today's used quota back to 0"
                          className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#080d19] hover:bg-white/5 text-slate-300 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 text-[11px] font-bold cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black transition-all inline-flex items-center gap-1.5 text-[11px] shadow-sm cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User & Quotas Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-6 shadow-2xl space-y-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Manage User Account & Permissions
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-0.5">
              <p className="text-xs font-bold text-white">{selectedUser.email}</p>
              <p className="text-[11px] text-slate-400 font-mono">User ID: {selectedUser.id}</p>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Role Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">User Role Authority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole("USER")}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                      editRole === "USER"
                        ? "bg-white/10 border-white/30 text-white"
                        : "bg-[#080d19] border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div>USER</div>
                    <div className="text-[10px] font-normal text-slate-500">Regular Tenant Customer</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditRole("ADMIN")}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer ${
                      editRole === "ADMIN"
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-[#080d19] border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-amber-400 font-black">ADMIN</div>
                    <div className="text-[10px] font-normal text-amber-500/80">Superadmin Root Access</div>
                  </button>
                </div>
              </div>

              {/* Plan Tier Selection */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Assigned Subscription Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["STARTER", "GROWTH", "SCALE_PRO"] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        setEditPlan(tier);
                        if (tier === "STARTER") setEditQuota(100);
                        if (tier === "GROWTH") setEditQuota(3000);
                        if (tier === "SCALE_PRO") setEditQuota(10000);
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        editPlan === tier
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-[#080d19] border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily Quota */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-bold">Daily Email Quota (Overridable)</label>
                  <span className="font-mono text-amber-400 font-bold">{editQuota.toLocaleString()} emails/day</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000000"
                  value={editQuota}
                  onChange={(e) => setEditQuota(parseInt(e.target.value, 10) || 100)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d19] px-3.5 py-2.5 font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Plan Validity Remaining Days */}
              <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Plan Validity / Remaining Days</span>
                  </label>
                  <span className="font-mono font-bold text-xs text-amber-400">
                    {Number(editExpiryDays) > 0 ? `⏳ ${editExpiryDays} days remaining` : "Lifetime (No Expiry)"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "7 Days", val: "7" },
                    { label: "30 Days", val: "30" },
                    { label: "90 Days", val: "90" },
                    { label: "Lifetime", val: "0" },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setEditExpiryDays(preset.val)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        editExpiryDays === preset.val
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-white/5 border-white/5 text-slate-300 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  min="0"
                  max="3650"
                  placeholder="Remaining days (e.g. 24 or 30). 0 for Lifetime."
                  value={editExpiryDays}
                  onChange={(e) => setEditExpiryDays(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0d1424] px-3.5 py-2 font-mono text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Calculated dynamically from today. Enter number of days until subscription expires.
                </p>
              </div>

              {/* Password Override */}
              <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant Password Reset (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (or leave blank to keep unchanged)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0d1424] pl-3.5 pr-10 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Reset Email Trigger */}
              <div className="p-3.5 rounded-xl bg-[#080d19] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-300">Dispatch Password Reset Email</p>
                    <p className="text-[11px] text-slate-500">Sends standard security reset link directly to recipient</p>
                  </div>
                  <button
                    type="button"
                    disabled={sendingReset}
                    onClick={handleSendResetEmail}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d1424] hover:bg-white/10 text-xs font-bold text-slate-200 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {sendingReset ? "Sending..." : "Send Reset Email"}
                  </button>
                </div>

                {recoveryCodeInfo && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase block">Verification Code</span>
                      <span className="font-mono font-black text-amber-300 text-sm">{recoveryCodeInfo}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(recoveryCodeInfo);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-white/5 bg-transparent text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "Saving Changes..." : "Save Account Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
