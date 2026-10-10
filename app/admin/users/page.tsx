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
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editRole, setEditRole] = useState("USER");
  const [editPlan, setEditPlan] = useState("STARTER");
  const [editQuota, setEditQuota] = useState(500);
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditRole(user.role);
    const ws = user.workspaces?.[0]?.workspace;
    setEditPlan(ws?.plan || "STARTER");
    setEditQuota(ws?.dailyQuota || 100);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setUpdating(true);
      const ws = selectedUser.workspaces?.[0]?.workspace;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          workspaceId: ws?.id,
          role: editRole,
          plan: editPlan,
          dailyQuota: Number(editQuota),
        }),
      });

      if (res.ok) {
        setSelectedUser(null);
        setToastMsg(`Updated permissions for ${selectedUser.email}`);
        setTimeout(() => setToastMsg(""), 3500);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
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

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            Registered Platform Users & Workspaces
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global directory of all Sendport accounts, active roles, workspace daily quotas, and sending permissions.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Users
        </button>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-white mt-1">{stats?.totalUsers || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Accounts registered in platform</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workspaces</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-amber-400 mt-1">{stats?.activeWorkspacesCount || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Isolated customer environments</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Admins</span>
          {loading ? (
            <div className="h-9 w-16 bg-slate-800 rounded animate-pulse my-1" />
          ) : (
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats?.totalAdmins || 0}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Users with ADMIN authority</p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Account List ({loading ? "Loading..." : filtered.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Direct Quota & Plan Overrides</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No users found matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Workspace & Plan</th>
                  <th className="p-4">Daily Quota</th>
                  <th className="p-4">Resources</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((user) => {
                  const ws = user.workspaces?.[0]?.workspace;
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white">{user.email}</p>
                        <p className="text-[11px] text-slate-400">{user.name || "No display name"}</p>
                        <p className="text-[10px] font-mono text-slate-500">{user.id}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === "ADMIN"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-200">{ws?.name || "Default Workspace"}</p>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            ws?.plan === "SCALE_PRO"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : ws?.plan === "GROWTH"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {ws?.plan || "STARTER"}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-amber-400">
                          {ws?.dailyQuota ? ws.dailyQuota.toLocaleString() : "100"} emails/day
                        </p>
                        <p className="text-[10px] text-slate-500">Used today: {ws?.usedToday || 0}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <p>{user._count?.domains || 0} Domains</p>
                          <p>{user._count?.apiKeys || 0} API Keys</p>
                          <p>{user._count?.payments || 0} Invoices</p>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleResetQuota(user)}
                          title="Reset Used Today to 0"
                          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors inline-flex items-center gap-1.5 text-[11px]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Manage
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Manage Account & Quotas
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-xs font-bold text-white">{selectedUser.email}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedUser.id}</p>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">User Role Authority</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-bold focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                >
                  <option value="USER" className="bg-slate-900 text-white">USER (Regular Customer)</option>
                  <option value="ADMIN" className="bg-slate-900 text-amber-300 font-bold">ADMIN (Superadmin Root Authority)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Workspace Plan Tier</label>
                <select
                  value={editPlan}
                  onChange={(e) => {
                    const p = e.target.value;
                    setEditPlan(p);
                    if (p === "SCALE_PRO") setEditQuota(25000);
                    else if (p === "GROWTH") setEditQuota(3000);
                    else setEditQuota(100);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-bold focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                >
                  <option value="STARTER" className="bg-slate-900 text-white">STARTER (Free - 100 emails/day)</option>
                  <option value="GROWTH" className="bg-slate-900 text-white">GROWTH ($20/mo - 3,000 emails/day)</option>
                  <option value="SCALE_PRO" className="bg-slate-900 text-white">SCALE_PRO ($79/mo - 25,000 emails/day)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold">Custom Daily Sending Quota</label>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    {editQuota.toLocaleString()} emails/day
                  </span>
                </div>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={editQuota}
                  onChange={(e) => setEditQuota(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono font-bold focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                />

                {/* Quick Quota Preset Chips */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Presets:</span>
                  {[
                    { label: "1k", val: 1000 },
                    { label: "5k", val: 5000 },
                    { label: "10k", val: 10000 },
                    { label: "25k", val: 25000 },
                    { label: "50k", val: 50000 },
                    { label: "100k", val: 100000 },
                    { label: "1M", val: 1000000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setEditQuota(preset.val)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold border transition-all ${
                        editQuota === preset.val
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                          : "bg-slate-950/80 border-slate-700/80 text-slate-400 hover:text-white hover:border-slate-600"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditQuota((prev) => prev + 5000)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  >
                    +5k
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-colors shadow-lg shadow-amber-500/20"
                >
                  {updating ? "Saving..." : "Update Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
