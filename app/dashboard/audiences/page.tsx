"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Upload,
  UserCheck,
  UserX,
  Tag,
  Mail,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
} from "lucide-react";

interface Audience {
  id: string;
  name: string;
  description: string | null;
  contacts_count: number;
}

interface Contact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  unsubscribed: boolean;
  tags: string | null;
  createdAt: string;
}

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateAudience, setShowCreateAudience] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  // Form states
  const [newAudienceName, setNewAudienceName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactFirstName, setNewContactFirstName] = useState("");
  const [newContactLastName, setNewContactLastName] = useState("");
  const [newContactTag, setNewContactTag] = useState("Newsletter");
  const [csvText, setCsvText] = useState("");

  useEffect(() => {
    fetchAudiences();
  }, []);

  const fetchAudiences = async () => {
    try {
      const res = await fetch("/api/v1/audiences");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setAudiences(json.data);
        setSelectedAudience(json.data[0].id);
        fetchContacts(json.data[0].id);
      } else {
        // Create initial default audience if empty
        const createRes = await fetch("/api/v1/audiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "General Subscribers",
            description: "Default audience list for product announcements",
          }),
        });
        const created = await createRes.json();
        if (created.data) {
          setAudiences([{ ...created.data, contacts_count: 0 }]);
          setSelectedAudience(created.data.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (audienceId: string) => {
    try {
      const res = await fetch(`/api/v1/audiences/${audienceId}/contacts`);
      const json = await res.json();
      if (json.data) {
        setContacts(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAudience = async () => {
    if (!newAudienceName) return;
    try {
      const res = await fetch("/api/v1/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAudienceName }),
      });
      const json = await res.json();
      if (json.data) {
        setAudiences([
          ...audiences,
          { ...json.data, contacts_count: 0 },
        ]);
        setSelectedAudience(json.data.id);
        setContacts([]);
        setShowCreateAudience(false);
        setNewAudienceName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSingleContact = async () => {
    if (!selectedAudience || !newContactEmail) return;
    try {
      const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newContactEmail,
          firstName: newContactFirstName,
          lastName: newContactLastName,
          tags: newContactTag ? [newContactTag] : [],
        }),
      });
      const json = await res.json();
      if (json.data) {
        setContacts([json.data, ...contacts]);
        setShowAddContact(false);
        setNewContactEmail("");
        setNewContactFirstName("");
        setNewContactLastName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCsvImport = async () => {
    if (!selectedAudience || !csvText) return;
    try {
      const lines = csvText.split("\n");
      const parsedContacts = [];
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts[0] && parts[0].includes("@")) {
          parsedContacts.push({
            email: parts[0],
            firstName: parts[1] || "",
            lastName: parts[2] || "",
            tags: parts[3] ? [parts[3]] : ["CSV Import"],
          });
        }
      }

      if (parsedContacts.length > 0) {
        const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: parsedContacts }),
        });
        const json = await res.json();
        if (json.contacts) {
          fetchContacts(selectedAudience);
          setShowCsvImport(false);
          setCsvText("");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Audiences & Contacts</h1>
          <p className="text-sm text-slate-500">
            Manage subscriber lists, custom attributes, CSV bulk imports, and engagement tags.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCsvImport(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Upload className="w-3.5 h-3.5 text-primary-600" /> Bulk CSV Import
          </button>
          <button
            onClick={() => setShowAddContact(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        </div>
      </div>

      {/* AUDIENCE SELECTOR PILLS */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {audiences.map((aud) => (
            <button
              key={aud.id}
              onClick={() => {
                setSelectedAudience(aud.id);
                fetchContacts(aud.id);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedAudience === aud.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{aud.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedAudience === aud.id ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-500"
              }`}>
                {aud.contacts_count || contacts.length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowCreateAudience(true)}
          className="text-xs text-primary-600 hover:underline font-semibold flex items-center gap-1 shrink-0 ml-4"
        >
          <Plus className="w-3.5 h-3.5" /> New Audience
        </button>
      </div>

      {/* CONTACTS TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredContacts.length} contacts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Tags</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    No contacts found in this audience. Click &quot;Add Contact&quot; or &quot;Bulk CSV Import&quot; to get started.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                      {contact.email}
                    </td>
                    <td className="px-5 py-3.5">
                      {contact.firstName || contact.lastName
                        ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {contact.tags ? (
                        <span className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 border border-primary-100">
                          <Tag className="w-2.5 h-2.5" />
                          {JSON.parse(contact.tags).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {contact.unsubscribed ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100">
                          <UserX className="w-3 h-3" /> Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                          <UserCheck className="w-3 h-3" /> Subscribed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD CONTACT */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Contact</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="subscriber@example.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={newContactFirstName}
                    onChange={(e) => setNewContactFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={newContactLastName}
                    onChange={(e) => setNewContactLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tag / Group</label>
                <input
                  type="text"
                  placeholder="Newsletter, VIP, Beta"
                  value={newContactTag}
                  onChange={(e) => setNewContactTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddContact(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSingleContact}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CSV BULK IMPORT */}
      {showCsvImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Bulk CSV Contact Import
            </h3>
            <p className="text-xs text-slate-500">
              Paste your CSV data below (Format: <code>email, first_name, last_name, tag</code>)
            </p>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="sarah@example.com, Sarah, Connor, VIP&#10;john@continental.hotel, John, Wick, Enterprise"
              className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCsvImport(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                className="rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 shadow-sm"
              >
                Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE AUDIENCE */}
      {showCreateAudience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Audience List</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Audience Name *</label>
              <input
                type="text"
                placeholder="Beta Testers"
                value={newAudienceName}
                onChange={(e) => setNewAudienceName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateAudience(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAudience}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
              >
                Create Audience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
