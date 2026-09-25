"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  UploadCloud, FileText, CheckCircle2, AlertCircle,
  Loader2, X, Edit2, Save, Trash2
} from "lucide-react";

/* ─── tiny inline toast ─── */
function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  const isErr = type === "error";
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
        isErr
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      }`}
    >
      {isErr ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-auto rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── safe JSON response parsing ─── */
// The resume APIs return JSON, but a Vercel function that times out (or a
// Next.js error page) comes back as HTML. Reading the body as text first lets
// us surface the REAL backend error instead of crashing with
// "Unexpected token '<' ... is not valid JSON" from response.json().
async function readJsonOrThrow(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();

  if (/json/i.test(contentType)) {
    try {
      return JSON.parse(body);
    } catch {
      // Not actually valid JSON — fall through and report the raw text.
    }
  }

  const readable = body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
  const reason = readable || res.statusText || "Request failed";
  // Surface the REAL backend failure (status + response text) instead of a
  // generic "Unexpected token '<' ... is not valid JSON" JSON.parse crash.
  const err = new Error(`${reason} (HTTP ${res.status})`) as Error & { status: number };
  err.status = res.status;
  throw err;
}

/* ─── delete confirmation modal ─── */
function DeleteConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-[100vw] items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 shadow-2xl text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-400/25">
          <Trash2 className="h-6 w-6" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-white">Delete Resume?</h3>
        <p className="mb-6 text-sm text-slate-400">
          This will permanently remove your resume and its parsed data. You will need to upload a new one to continue practicing.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResumePage() {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Ids deleted in this page session. Any fetch/poll response that still
  // contains one of them is stale (it was computed before the DELETE
  // committed) and must never be put back into state.
  const deletedIdsRef = useRef<Set<string>>(new Set());
  // Prevents a double-click on "Yes, Delete" from firing two DELETE requests
  // for the same resume (observed in production: 200 then a 404).
  const deletingRef = useRef(false);

  const activeResume = resumes[0];

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resume");
      const data = await readJsonOrThrow(res);
      if (res.ok) {
        // Drop resumes deleted during this session so a stale GET (one that
        // started before a DELETE committed) cannot restore a deleted card —
        // including one that a late parse marked as FAILED.
        setResumes(
          (data.resumes || []).filter((r: any) => !deletedIdsRef.current.has(r.id))
        );
      }
    } catch {
      console.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input value so selecting the SAME file again (retry after a
    // failed upload/parse, or replacing with an identical filename) still
    // fires a change event. Without this, the browser sees an unchanged value
    // and the second selection is silently ignored.
    e.target.value = "";
    if (!file) return;

    setToast(null);

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File size exceeds 5 MB limit.");
      return;
    }

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      showToast("error", "Only PDF and DOCX files are allowed.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/resume/upload", { method: "POST", body: formData });
      const uploadData = await readJsonOrThrow(uploadRes);
      if (!uploadRes.ok) throw new Error(uploadData.message || "Upload failed");

      setResumes([uploadData.resume, ...resumes]);
      setUploading(false);
      setParsing(true);

      const parseRes = await fetch(`/api/resume/${uploadData.resume.id}/parse`, { method: "POST" });
      const parseData = await readJsonOrThrow(parseRes);
      if (!parseRes.ok) throw new Error(parseData.message || "Parsing failed");

      showToast("success", "Resume uploaded and parsed successfully!");
      fetchResumes();
    } catch (err: any) {
      showToast("error", err.message || "Upload failed. Please try again.");
      fetchResumes();
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || deletingRef.current) return;
    deletingRef.current = true;
    try {
      const res = await fetch(`/api/resume/${deleteId}`, { method: "DELETE" });
      const data = await readJsonOrThrow(res);
      if (res.ok) {
        // Remove from every relevant state so the card, its parsed profile,
        // and the edit form all disappear immediately. Remember the id so a
        // stale refetch can never bring it back (or flip it to FAILED).
        deletedIdsRef.current.add(deleteId);
        setResumes((prev) => prev.filter((r) => r.id !== deleteId));
        setEditing(false);
        setEditForm({});
        showToast("success", "Resume deleted successfully.");
      } else {
        throw new Error(data.message || "Failed to delete");
      }
    } catch (err: any) {
      showToast("error", err.message || "Could not delete. Please try again.");
    } finally {
      deletingRef.current = false;
      setDeleteId(null);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/resume/${activeResume.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await readJsonOrThrow(res);
      if (res.ok) {
        showToast("success", "Changes saved successfully.");
        setEditing(false);
        fetchResumes();
      } else {
        throw new Error(data.message || "Failed to save changes");
      }
    } catch (err: any) {
      showToast("error", err.message || "Could not save. Please try again.");
    }
  };

  const toggleEdit = () => {
    if (!editing) setEditForm(activeResume.parsedData || {});
    setEditing(!editing);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {deleteId && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="relative mx-auto w-full">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
              InterviewAI · Resume
            </p>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Resume Management
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              Upload your resume to let AI personalize your interview experience.
            </p>
          </div>
          {activeResume && (
            <label className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-150 hover:brightness-110 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-400/70">
              <UploadCloud className="h-4 w-4" />
              Replace Resume
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={uploading || parsing}
              />
            </label>
          )}
        </header>

        {/* Toast */}
        {toast && (
          <div className="mb-6">
            <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Upload drop zone */}
        {!activeResume && !uploading && !parsing && (
          <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.1] bg-[#0D1424]/60 p-14 text-center transition-colors hover:border-purple-500/50 hover:bg-[#0D1424]">
            <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-400/20">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Upload your resume</h2>
            <p className="mb-6 max-w-md text-sm text-slate-400">
              Let AI understand your skills, experience, and projects to create personalized interviews.
              Supports PDF and DOCX up to 5 MB.
            </p>
            <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-150 group-hover:brightness-110">
              <UploadCloud className="h-4 w-4" />
              Select File
            </span>
            <input type="file" className="sr-only" accept=".pdf,.docx" onChange={handleFileUpload} />
          </label>
        )}

        {/* Uploading / Parsing state */}
        {(uploading || parsing) && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D1424] p-14 text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-purple-400" />
            <h2 className="mb-1.5 text-xl font-semibold text-white">
              {uploading ? "Uploading resume…" : "Analyzing your resume with AI…"}
            </h2>
            <p className="text-sm text-slate-400">
              {uploading ? "Please wait a moment." : "This usually takes 5–15 seconds."}
            </p>
          </div>
        )}

        {/* Active resume */}
        {activeResume && !uploading && !parsing && (
          <div className="space-y-5">
            {/* File info card */}
            <div className="flex min-w-0 flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-400/20">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-white">
                    {activeResume.fileName}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {formatFileSize(activeResume.fileSize)} ·{" "}
                    {new Date(activeResume.uploadedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                    activeResume.status === "PARSED"
                      ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25"
                      : activeResume.status === "FAILED"
                        ? "bg-red-500/10 text-red-300 ring-red-400/25"
                        : "bg-amber-500/10 text-amber-300 ring-amber-400/25"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      activeResume.status === "PARSED"
                        ? "bg-emerald-400"
                        : activeResume.status === "FAILED"
                          ? "bg-red-400"
                          : "bg-amber-400"
                    }`}
                  />
                  {activeResume.status === "PARSED"
                    ? "Ready"
                    : activeResume.status === "FAILED"
                      ? "Failed"
                      : "Processing"}
                </span>
                <button
                  onClick={() => setDeleteId(activeResume.id)}
                  aria-label="Delete resume"
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Parsed profile */}
            {activeResume.status === "PARSED" && activeResume.parsedData && (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-5">
                  <h2 className="text-xl font-semibold text-white">Resume Profile</h2>
                  <button
                    onClick={editing ? handleSaveEdit : toggleEdit}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-2 text-sm font-semibold text-purple-300 ring-1 ring-inset ring-purple-400/20 transition-colors hover:bg-purple-500/10"
                  >
                    {editing ? (
                      <><Save className="h-3.5 w-3.5" /> Save</>
                    ) : (
                      <><Edit2 className="h-3.5 w-3.5" /> Edit</>
                    )}
                  </button>
                </div>

                <div className="space-y-7">
                  {/* Basic info */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                        Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-[15px] font-medium text-white">
                          {activeResume.parsedData.name || "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </label>
                      {editing ? (
                        <input
                          type="email"
                          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        <p className="min-w-0 break-words text-[15px] font-medium text-white">
                          {activeResume.parsedData.email || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                      Professional Summary
                    </label>
                    {editing ? (
                      <textarea
                        className="w-full min-h-[100px] resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={editForm.summary || ""}
                        onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                      />
                    ) : (
                      <p className="break-words text-sm leading-relaxed text-slate-300">
                        {activeResume.parsedData.summary || "No summary provided."}
                      </p>
                    )}
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                      Skills
                    </label>
                    {editing ? (
                      <textarea
                        className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={(editForm.skills || []).join(", ")}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            skills: e.target.value.split(",").map((s: string) => s.trim()),
                          })
                        }
                        placeholder="Comma separated skills"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {(activeResume.parsedData.skills || []).map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-white/[0.05] px-3 py-1 text-sm text-slate-300 ring-1 ring-inset ring-white/[0.08]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="mb-3 block text-[12px] font-semibold uppercase tracking-wider text-slate-500">
                      Experience
                    </label>
                    <div className="space-y-4">
                      {(activeResume.parsedData.experience || []).map((exp: any, i: number) => (
                        <div key={i} className="border-l-2 border-purple-500/60 pl-4">
                          <h4 className="font-semibold text-white">{exp.role}</h4>
                          <p className="mt-0.5 text-sm text-purple-400">
                            {exp.company} · {exp.startDate} – {exp.endDate}
                          </p>
                          <p className="mt-1.5 line-clamp-3 break-words text-sm leading-relaxed text-slate-400">
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Failed state */}
            {activeResume.status === "FAILED" && (
              <div className="flex items-start gap-4 rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-white">Resume parsing failed</p>
                  <p className="mt-1 text-sm text-slate-400">
                    We couldn&apos;t extract your information. Try uploading a cleaner PDF or DOCX file.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
