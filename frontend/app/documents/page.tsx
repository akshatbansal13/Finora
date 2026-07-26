"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Trash2, CheckCircle, Clock, X, File } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import SpatialCard from "@/components/SpatialCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import { api } from "@/lib/api";

const reportTypes = ["Annual Report", "Quarterly Report", "10-K", "10-Q", "Earnings Transcript"];

interface Document {
  id: number;
  filename?: string;
  file_name?: string;
  company?: string;
  report_type?: string;
  processed?: boolean;
  is_embedded?: boolean;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState("");
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const res = await api.documents.list();
    if (res.success && Array.isArray(res.data)) setDocuments(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => { await fetchDocs(); };
    load();
  }, [fetchDocs]);

  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragging(true); }
  function handleDragLeave() { setDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]);
  }
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) setFile(e.target.files[0]);
  }

  async function handleUpload() {
    if (!file || !company.trim()) return;
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress((p) => Math.min(p + 15, 90)), 200);
    await api.documents.upload(file, company.trim(), reportType);
    clearInterval(interval);
    setUploadProgress(100);
    setTimeout(() => {
      setUploading(false);
      setUploadProgress(0);
      setFile(null);
      setCompany("");
      fetchDocs();
    }, 500);
  }

  async function handleDelete(id: number) {
    await api.documents.delete(id);
    fetchDocs();
  }

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">Upload financial reports for RAG-powered analysis</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 space-y-5">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${dragging ? "border-emerald-500/40 bg-emerald-500/[0.03]" : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"} ${dragging ? "animate-glow-pulse" : ""}`}
        >
          <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          </motion.div>
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <File className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-white font-medium">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 rounded hover:bg-white/[0.06] cursor-pointer"><X className="w-3 h-3 text-muted-foreground" /></button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Drop a PDF here or click to browse</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Supports financial reports, SEC filings, earnings transcripts</p>
            </>
          )}
        </div>

        {file && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
            <input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/30 transition-all" />
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-emerald-500/30 transition-all cursor-pointer">
              {reportTypes.map((t) => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
            </select>

            {/* Progress Bar */}
            {uploading && (
              <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ type: "spring", stiffness: 50, damping: 20 }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
              </div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpload} disabled={uploading || !company.trim()} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer">
              {uploading ? "Uploading..." : "Upload & Process"}
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Document List */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {!loading && documents.length === 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-muted-foreground" />
            </div>
          </motion.div>
          <p className="text-muted-foreground text-sm">No documents uploaded yet</p>
        </motion.div>
      )}

      {!loading && documents.length > 0 && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc: Document, i: number) => (
            <motion.div key={doc.id || i} variants={staggerItem}>
              <SpatialCard hoverGlow="blue">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/10"><FileText className="w-3.5 h-3.5 text-blue-400" /></div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[160px]">{doc.filename || doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">{doc.company}</p>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
                  </motion.button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{doc.report_type}</p>
                <div className="flex items-center gap-1.5">
                  {doc.processed || doc.is_embedded ? (
                    <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-xs text-emerald-400">Indexed</span></>
                  ) : (
                    <><Clock className="w-3 h-3 text-amber-400 animate-data-pulse" /><span className="text-xs text-amber-400">Processing</span></>
                  )}
                </div>
              </SpatialCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </PageTransition>
  );
}
