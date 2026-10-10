"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Download,
  Edit2,
  Send,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  FileText,
  Filter,
  Layers,
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

interface ParsedRow {
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  isValid: boolean;
  error?: string;
}

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SUBSCRIBED" | "UNSUBSCRIBED">("ALL");
  const [loading, setLoading] = useState(true);

  // Selection for Batch Actions
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [batchActionLoading, setBatchActionLoading] = useState(false);

  // Modals
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showCreateAudience, setShowCreateAudience] = useState(false);
  const [showEditAudience, setShowEditAudience] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);

  // Form states - Contact
  const [contactEmail, setContactEmail] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactTag, setContactTag] = useState("Newsletter");

  // Form states - Audience
  const [audienceName, setAudienceName] = useState("");
  const [audienceDescription, setAudienceDescription] = useState("");

  // CSV Import State
  const [importTab, setImportTab] = useState<"UPLOAD" | "PASTE">("UPLOAD");
  const [csvText, setCsvText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast Campaign Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastFromName, setBroadcastFromName] = useState("Sendport Team");
  const [broadcastFromEmail, setBroadcastFromEmail] = useState("");
  const [broadcastHtml, setBroadcastHtml] = useState(
    "<h1>Hello {{first_name}},</h1>\n<p>We're thrilled to share our latest product updates with you.</p>\n<p>Best regards,<br/>Team</p>"
  );
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    sent: number;
    failed: number;
    total: number;
    finished: boolean;
  } | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/audiences");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setAudiences(json.data);
        const activeId = selectedAudience || json.data[0].id;
        setSelectedAudience(activeId);
        fetchContacts(activeId);
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
      setSelectedContactIds([]);
      const res = await fetch(`/api/v1/audiences/${audienceId}/contacts`);
      const json = await res.json();
      if (json.data) {
        setContacts(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- CSV PARSING ENGINE ---
  const parseCsvContent = (content: string) => {
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Check if first line is a header
    const firstLineLower = lines[0].toLowerCase();
    const startIndex = firstLineLower.includes("email") ? 1 : 0;

    const results: ParsedRow[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Split on comma or tab
      const parts = line.includes("\t")
        ? line.split("\t").map((p) => p.trim())
        : line.split(",").map((p) => p.trim());

      const email = parts[0]?.replace(/^["']|["']$/g, "") || "";
      const firstName = parts[1]?.replace(/^["']|["']$/g, "") || "";
      const lastName = parts[2]?.replace(/^["']|["']$/g, "") || "";
      const rawTags = parts[3]?.replace(/^["']|["']$/g, "") || "CSV Import";
      const tags = rawTags
        ? rawTags.split(";").map((t) => t.trim()).filter(Boolean)
        : ["CSV Import"];

      const emailValid = email.includes("@") && email.includes(".");

      results.push({
        email,
        firstName,
        lastName,
        tags: tags.length > 0 ? tags : ["CSV Import"],
        isValid: emailValid,
        error: !emailValid ? "Invalid email format" : undefined,
      });
    }

    setParsedRows(results);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        parseCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setCsvText(text);
    parseCsvContent(text);
  };

  const handleExecuteImport = async () => {
    if (!selectedAudience) return;
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showToast("No valid contacts found to import.", "error");
      return;
    }

    try {
      setImporting(true);
      const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts: validRows.map((r) => ({
            email: r.email,
            firstName: r.firstName,
            lastName: r.lastName,
            tags: r.tags,
          })),
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(`Successfully imported ${validRows.length} contacts!`);
        setShowCsvImport(false);
        setUploadedFile(null);
        setCsvText("");
        setParsedRows([]);
        fetchContacts(selectedAudience);
        fetchAudiences();
      } else {
        showToast(json.error || "Failed to import contacts.", "error");
      }
    } catch (e: any) {
      showToast("Network error importing contacts.", "error");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sample = `email,first_name,last_name,tags\nsarah.connor@example.com,Sarah,Connor,VIP;Newsletter\njohn.wick@continental.hotel,John,Wick,Enterprise\nalex.turner@arcticmonkeys.io,Alex,Turner,Beta-User\n`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sendport_contacts_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- CONTACT ACTIONS ---
  const handleSaveContact = async () => {
    if (!selectedAudience || !contactEmail) return;

    try {
      if (editingContact) {
        // PATCH
        const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contactId: editingContact.id,
            firstName: contactFirstName,
            lastName: contactLastName,
            tags: contactTag ? contactTag.split(",").map((t) => t.trim()) : [],
          }),
        });

        if (res.ok) {
          showToast("Contact updated successfully!");
          setShowAddContact(false);
          setEditingContact(null);
          fetchContacts(selectedAudience);
        } else {
          showToast("Failed to update contact.", "error");
        }
      } else {
        // POST Single
        const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: contactEmail,
            firstName: contactFirstName,
            lastName: contactLastName,
            tags: contactTag ? contactTag.split(",").map((t) => t.trim()) : [],
          }),
        });

        if (res.ok) {
          showToast("Contact added successfully!");
          setShowAddContact(false);
          setContactEmail("");
          setContactFirstName("");
          setContactLastName("");
          fetchContacts(selectedAudience);
          fetchAudiences();
        } else {
          showToast("Failed to add contact.", "error");
        }
      }
    } catch (err) {
      showToast("Error saving contact.", "error");
    }
  };

  const handleToggleUnsubscribed = async (contact: Contact) => {
    if (!selectedAudience) return;
    try {
      const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          unsubscribed: !contact.unsubscribed,
        }),
      });

      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, unsubscribed: !c.unsubscribed } : c))
        );
        showToast(
          `${contact.email} is now ${!contact.unsubscribed ? "Unsubscribed" : "Subscribed"}!`
        );
      }
    } catch (err) {
      showToast("Failed to update subscription status.", "error");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedAudience) return;
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts?contactId=${contactId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        showToast("Contact deleted successfully.");
        fetchAudiences();
      }
    } catch (err) {
      showToast("Failed to delete contact.", "error");
    }
  };

  // --- BATCH ACTIONS ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedAudience || selectedContactIds.length === 0) return;
    if (!confirm(`Permanently delete ${selectedContactIds.length} selected contacts?`)) return;

    try {
      setBatchActionLoading(true);
      const res = await fetch(`/api/v1/audiences/${selectedAudience}/contacts`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedContactIds }),
      });

      if (res.ok) {
        showToast(`${selectedContactIds.length} contacts deleted.`);
        setSelectedContactIds([]);
        fetchContacts(selectedAudience);
        fetchAudiences();
      } else {
        showToast("Failed to delete selected contacts.", "error");
      }
    } catch (e) {
      showToast("Network error executing batch delete.", "error");
    } finally {
      setBatchActionLoading(false);
    }
  };

  const handleExportCsv = (onlySelected = false) => {
    const listToExport = onlySelected
      ? contacts.filter((c) => selectedContactIds.includes(c.id))
      : filteredContacts;

    if (listToExport.length === 0) {
      showToast("No contacts available to export.", "error");
      return;
    }

    let csv = "email,first_name,last_name,status,tags,created_at\n";
    for (const c of listToExport) {
      const tagsStr = c.tags ? JSON.parse(c.tags).join(";") : "";
      csv += `"${c.email}","${c.firstName || ""}","${c.lastName || ""}","${
        c.unsubscribed ? "Unsubscribed" : "Subscribed"
      }","${tagsStr}","${c.createdAt}"\n`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${listToExport.length} contacts to CSV.`);
  };

  // --- AUDIENCE MANAGEMENT ---
  const handleCreateAudience = async () => {
    if (!audienceName.trim()) return;
    try {
      const res = await fetch("/api/v1/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: audienceName.trim(),
          description: audienceDescription.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        showToast(`Audience list '${json.data.name}' created!`);
        setAudiences([...audiences, { ...json.data, contacts_count: 0 }]);
        setSelectedAudience(json.data.id);
        setContacts([]);
        setShowCreateAudience(false);
        setAudienceName("");
        setAudienceDescription("");
      }
    } catch (err) {
      showToast("Failed to create audience.", "error");
    }
  };

  const handleUpdateAudience = async () => {
    if (!selectedAudience || !audienceName.trim()) return;
    try {
      const res = await fetch(`/api/v1/audiences/${selectedAudience}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: audienceName.trim(),
          description: audienceDescription.trim() || undefined,
        }),
      });

      if (res.ok) {
        showToast("Audience details updated!");
        setShowEditAudience(false);
        fetchAudiences();
      }
    } catch (err) {
      showToast("Failed to update audience.", "error");
    }
  };

  const handleDeleteAudience = async () => {
    if (!selectedAudience) return;
    const current = audiences.find((a) => a.id === selectedAudience);
    if (!confirm(`Delete audience '${current?.name}' and all associated contacts?`)) return;

    try {
      const res = await fetch(`/api/v1/audiences/${selectedAudience}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast(`Audience '${current?.name}' deleted.`);
        const remaining = audiences.filter((a) => a.id !== selectedAudience);
        setAudiences(remaining);
        if (remaining.length > 0) {
          setSelectedAudience(remaining[0].id);
          fetchContacts(remaining[0].id);
        } else {
          setSelectedAudience(null);
          setContacts([]);
        }
      }
    } catch (err) {
      showToast("Failed to delete audience.", "error");
    }
  };

  const handleLaunchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudience || !broadcastSubject.trim() || !broadcastFromEmail.trim() || !broadcastHtml.trim()) {
      showToast("Please provide subject, sender email, and HTML message.", "error");
      return;
    }

    try {
      setBroadcastSending(true);
      setBroadcastProgress({
        sent: 0,
        failed: 0,
        total: totalSubscribed,
        finished: false,
      });

      const res = await fetch("/api/v1/broadcasts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audienceId: selectedAudience,
          subject: broadcastSubject.trim(),
          fromName: broadcastFromName.trim() || undefined,
          fromEmail: broadcastFromEmail.trim(),
          htmlContent: broadcastHtml,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setBroadcastProgress({
          sent: json.sentCount || 0,
          failed: json.failedCount || 0,
          total: json.totalRecipients || 0,
          finished: true,
        });
        showToast(json.message || "Broadcast successfully sent to your audience!");
      } else {
        showToast(json.error || "Failed to launch broadcast.", "error");
        setBroadcastProgress(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to dispatch broadcast.", "error");
      setBroadcastProgress(null);
    } finally {
      setBroadcastSending(false);
    }
  };

  // --- FILTERED CONTACTS ---
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.firstName && c.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastName && c.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.tags && c.tags.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "SUBSCRIBED") return !c.unsubscribed;
    if (statusFilter === "UNSUBSCRIBED") return c.unsubscribed;
    return true;
  });

  const activeAudienceObj = audiences.find((a) => a.id === selectedAudience);
  const totalSubscribed = contacts.filter((c) => !c.unsubscribed).length;
  const totalUnsubscribed = contacts.filter((c) => c.unsubscribed).length;

  return (
    <div className="space-y-6">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold border animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-emerald-500/50"
              : "bg-rose-950 text-rose-100 border-rose-500/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Audiences & Contacts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage subscriber lists, custom attributes, CSV bulk imports, and engagement tags.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadSampleCsv}
            title="Download formatted sample template"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Sample CSV
          </button>
          <button
            onClick={() => {
              setParsedRows([]);
              setUploadedFile(null);
              setCsvText("");
              setShowCsvImport(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-primary-600" /> Bulk CSV Import
          </button>
          <button
            onClick={() => {
              setEditingContact(null);
              setContactEmail("");
              setContactFirstName("");
              setContactLastName("");
              setContactTag("Newsletter");
              setShowAddContact(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
          <button
            onClick={() => {
              setBroadcastProgress(null);
              setShowBroadcastModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Send Broadcast
          </button>
        </div>
      </div>

      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contacts</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{contacts.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">In selected audience list</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subscribed</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalSubscribed}</div>
          <div className="text-[11px] text-emerald-700/80 font-medium">Eligible for broadcasts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Unsubscribed</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{totalUnsubscribed}</div>
          <div className="text-[11px] text-slate-400 font-medium">Suppressed from mailings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Audience Lists</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">{audiences.length}</div>
          <div className="text-[11px] text-slate-400 font-medium">Segmented lists active</div>
        </div>
      </div>

      {/* AUDIENCE SELECTOR PILLS & AUDIENCE SETTINGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {audiences.map((aud) => (
            <button
              key={aud.id}
              onClick={() => {
                setSelectedAudience(aud.id);
                fetchContacts(aud.id);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                selectedAudience === aud.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{aud.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedAudience === aud.id
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {selectedAudience === aud.id ? contacts.length : aud.contacts_count || 0}
              </span>
            </button>
          ))}

          <button
            onClick={() => {
              setAudienceName("");
              setAudienceDescription("");
              setShowCreateAudience(true);
            }}
            className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New Audience
          </button>
        </div>

        {/* Selected audience actions */}
        {activeAudienceObj && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <Link
              href="/dashboard/playground"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
              title="Compose email to this audience"
            >
              <Send className="w-3 h-3 text-indigo-600" />
              <span>Send Campaign</span>
            </Link>

            <button
              onClick={() => {
                setAudienceName(activeAudienceObj.name);
                setAudienceDescription(activeAudienceObj.description || "");
                setShowEditAudience(true);
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Rename audience"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {audiences.length > 1 && (
              <button
                onClick={handleDeleteAudience}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                title="Delete this audience"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* SEARCH, STATUS FILTER & EXPORT BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, name, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center border border-slate-200 bg-white rounded-xl p-1 text-xs font-semibold text-slate-600 shrink-0">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === "ALL" ? "bg-slate-900 text-white" : "hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("SUBSCRIBED")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === "SUBSCRIBED" ? "bg-slate-900 text-white" : "hover:text-slate-900"
              }`}
            >
              Subscribed
            </button>
            <button
              onClick={() => setStatusFilter("UNSUBSCRIBED")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === "UNSUBSCRIBED" ? "bg-slate-900 text-white" : "hover:text-slate-900"
              }`}
            >
              Unsubscribed
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredContacts.length} contacts
          </span>
          <button
            onClick={() => handleExportCsv(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
          </button>
        </div>
      </div>

      {/* FLOATING BATCH ACTION BAR (When contacts are selected) */}
      {selectedContactIds.length > 0 && (
        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold">
              {selectedContactIds.length}
            </span>
            <span>contacts selected</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleExportCsv(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={batchActionLoading}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>

            <button
              onClick={() => setSelectedContactIds([])}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CONTACTS TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredContacts.length > 0 &&
                      selectedContactIds.length === filteredContacts.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                  />
                </th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">No contacts in this list</div>
                      <p className="text-xs text-slate-500">
                        Get started by adding individual subscribers or drag & drop a .csv file to bulk import.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => setShowCsvImport(true)}
                          className="px-3.5 py-2 rounded-xl bg-primary-50 text-primary-700 border border-primary-200 font-semibold text-xs hover:bg-primary-100"
                        >
                          Upload CSV File
                        </button>
                        <button
                          onClick={() => setShowAddContact(true)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
                        >
                          + Add Single
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  let parsedTagsList: string[] = [];
                  if (contact.tags) {
                    try {
                      parsedTagsList = JSON.parse(contact.tags);
                    } catch (e) {
                      parsedTagsList = [contact.tags];
                    }
                  }

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-primary-50/30" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(contact.id)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                        />
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {contact.email}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {contact.firstName || contact.lastName
                          ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        {parsedTagsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {parsedTagsList.map((tagItem, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/80"
                              >
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                {tagItem}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleUnsubscribed(contact)}
                          title="Click to toggle subscription status"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-transform active:scale-95 cursor-pointer ${
                            contact.unsubscribed
                              ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {contact.unsubscribed ? (
                            <>
                              <UserX className="w-3 h-3" />
                              <span>Unsubscribed</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3" />
                              <span>Subscribed</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setContactEmail(contact.email);
                              setContactFirstName(contact.firstName || "");
                              setContactLastName(contact.lastName || "");
                              setContactTag(
                                parsedTagsList.length > 0 ? parsedTagsList.join(", ") : ""
                              );
                              setShowAddContact(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            title="Edit contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DUAL-MODE MODAL: BULK CSV CONTACT IMPORT */}
      {showCsvImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bulk CSV Contact Ingestion</h3>
                  <p className="text-xs text-slate-500">
                    Import to list: <strong className="text-slate-800">{activeAudienceObj?.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCsvImport(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Tab Selector & Sample Download */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setImportTab("UPLOAD")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      importTab === "UPLOAD"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Drag & Drop File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportTab("PASTE")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      importTab === "PASTE"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Quick Paste Text
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:underline"
                >
                  <Download className="w-3 h-3" /> Download Sample CSV
                </button>
              </div>

              {/* TAB 1: DRAG & DROP FILE */}
              {importTab === "UPLOAD" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-primary-500 bg-primary-50/50 scale-[0.99]"
                        : uploadedFile
                        ? "border-emerald-400 bg-emerald-50/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    {uploadedFile ? (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm">{uploadedFile.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Click or drop new file to replace
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-sm">
                          Drag and drop your .csv file here
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Supports CSV, TSV, or TXT (Columns: email, first_name, last_name, tags)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* TAB 2: QUICK PASTE TEXT */
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-700">
                    Paste Raw CSV / Delimited Lines:
                  </label>
                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="sarah@example.com, Sarah, Connor, VIP;Newsletter&#10;john@continental.hotel, John, Wick, Enterprise"
                    className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* PRE-IMPORT PARSED PREVIEW BOX */}
              {parsedRows.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      Parsed Verification Preview
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {parsedRows.filter((r) => r.isValid).length} Valid
                      </span>
                      {parsedRows.filter((r) => !r.isValid).length > 0 && (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                          {parsedRows.filter((r) => !r.isValid).length} Invalid Skipped
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-36 border border-slate-200 rounded-lg bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                        <tr>
                          <th className="px-2.5 py-1.5">Email</th>
                          <th className="px-2.5 py-1.5">Name</th>
                          <th className="px-2.5 py-1.5">Tags</th>
                          <th className="px-2.5 py-1.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className={!row.isValid ? "bg-rose-50/50" : ""}>
                            <td className="px-2.5 py-1.5 font-mono text-slate-900 truncate max-w-[150px]">
                              {row.email}
                            </td>
                            <td className="px-2.5 py-1.5 text-slate-600 truncate max-w-[100px]">
                              {row.firstName} {row.lastName}
                            </td>
                            <td className="px-2.5 py-1.5 text-slate-500">
                              {row.tags.join(", ")}
                            </td>
                            <td className="px-2.5 py-1.5">
                              {row.isValid ? (
                                <span className="text-emerald-600 font-semibold">Ready</span>
                              ) : (
                                <span className="text-rose-600 font-semibold">{row.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 5 && (
                    <div className="text-[10px] text-slate-400 text-center">
                      + {parsedRows.length - 5} more rows detected
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowCsvImport(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={importing || parsedRows.filter((r) => r.isValid).length === 0}
                onClick={handleExecuteImport}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-all flex items-center gap-2"
              >
                {importing ? (
                  "Importing Contacts..."
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      Import {parsedRows.filter((r) => r.isValid).length} Valid Contacts
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SINGLE CONTACT */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingContact ? "Edit Subscriber Details" : "Add Single Contact"}
              </h3>
              <button
                onClick={() => setShowAddContact(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={!!editingContact}
                  placeholder="subscriber@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Smith"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="VIP, Newsletter, Beta"
                  value={contactTag}
                  onChange={(e) => setContactTag(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContact}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm transition-colors"
              >
                {editingContact ? "Update Contact" : "Save Contact"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW AUDIENCE */}
      {showCreateAudience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Audience List</h3>
              <button
                onClick={() => setShowCreateAudience(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audience Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Early Beta Testers"
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VIP customers who joined in Q1"
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateAudience(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAudience}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
              >
                Create Audience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AUDIENCE */}
      {showEditAudience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Audience Details</h3>
              <button
                onClick={() => setShowEditAudience(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audience Name *</label>
                <input
                  type="text"
                  required
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={audienceDescription}
                  onChange={(e) => setAudienceDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditAudience(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateAudience}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LAUNCH EMAIL BROADCAST */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Send className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Launch Email Broadcast</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Send a personalized email campaign directly to all subscribed contacts in this list.
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Audience & Subscriber Summary Badge */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">Target Audience</span>
                <div className="text-xs font-extrabold text-indigo-950">
                  {activeAudienceObj?.name || "Selected Audience"}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Recipients</span>
                <div className="text-xs font-black text-emerald-700">
                  {totalSubscribed} Subscribed Contacts
                </div>
              </div>
            </div>

            {broadcastProgress && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  broadcastProgress.finished
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {broadcastProgress.finished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {broadcastProgress.finished
                      ? "Broadcast Dispatch Complete!"
                      : "Dispatching batch emails across high-speed MTA..."}
                  </span>
                </div>
                <div className="flex gap-4 text-[11px] font-semibold text-slate-700 pt-1">
                  <span>Sent: <strong className="text-emerald-700">{broadcastProgress.sent}</strong></span>
                  <span>Failed: <strong className="text-rose-600">{broadcastProgress.failed}</strong></span>
                  <span>Total: <strong>{broadcastProgress.total}</strong></span>
                </div>
              </div>
            )}

            <form onSubmit={handleLaunchBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major Product Update: What's new in Sendport 2.0"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Muhammad from Sendport"
                    value={broadcastFromName}
                    onChange={(e) => setBroadcastFromName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. team@yourdomain.com"
                    value={broadcastFromEmail}
                    onChange={(e) => setBroadcastFromEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">HTML Message Body *</label>
                  <span className="text-[10px] text-indigo-600 font-medium">
                    Available tags: <code>{"{{first_name}}"}</code>, <code>{"{{email}}"}</code>
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={broadcastHtml}
                  onChange={(e) => setBroadcastHtml(e.target.value)}
                  className="w-full font-mono text-[11px] rounded-xl border border-slate-200 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="<p>Hi {{first_name}},</p><p>Your message content here...</p>"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={broadcastSending || totalSubscribed === 0}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {broadcastSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Broadcast...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Campaign ({totalSubscribed})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
