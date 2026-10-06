"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, RefreshCw, ShieldCheck, UserCheck, Mail, Database, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <p className="text-3xl font-black text-white mt-1">{stats.totalUsers}</p>
            <p className="text-[11px] text-slate-500 mt-1">Accounts registered in platform</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Workspaces</span>
            <p className="text-3xl font-black text-amber-400 mt-1">{stats.activeWorkspacesCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Isolated customer environments</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Admins</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.totalAdmins}</p>
            <p className="text-[11px] text-slate-500 mt-1">Users with ADMIN authority</p>
          </div>
        </div>
      )}

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
            Account List ({filtered.length})
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Role & Quota Management</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">User Details</th>
                <th className="p-4">Role</th>
                <th className="p-4">Workspace & Plan</th>
                <th className="p-4">Daily Quota</th>
                <th className="p-4">Resources</th>
                <th className="p-4 text-right">Joined</th>
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
                      <span className="inline-block mt-0.5 text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ws?.plan || "STARTER"}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-amber-400">
                        {ws?.dailyQuota ? ws.dailyQuota.toLocaleString() : "500"} emails/day
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
                    <td className="p-4 text-right text-[11px] text-slate-400 font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
