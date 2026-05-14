"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Download, Search, RefreshCw, Filter, X, Calendar, CheckCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";
import ReportTable from "@/components/ReportTable";
import EditModal from "@/components/EditModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import type { LiveReport } from "@/types";

export default function ReportsPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reports, setReports] = useState<LiveReport[]>([]);
  const [filtered, setFiltered] = useState<LiveReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editReport, setEditReport] = useState<LiveReport | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
        setFiltered(json.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let result = reports;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.tanggal.includes(q) ||
        r.tayangan.toLowerCase().includes(q) ||
        String(r.berlian).includes(q) ||
        String(r.pengikut_baru).includes(q) ||
        (r.catatan ?? "").toLowerCase().includes(q) ||
        String(r.leads_tiktok_live_pusat).includes(q)
      );
    }
    if (filterStart) {
      result = result.filter((r) => r.tanggal >= filterStart);
    }
    if (filterEnd) {
      result = result.filter((r) => r.tanggal <= filterEnd);
    }
    setFiltered(result);
  }, [search, reports, filterStart, filterEnd]);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus laporan ini?")) return;
    const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setSuccess("Laporan berhasil dihapus");
      setTimeout(() => setSuccess(""), 3000);
      fetchAll();
    }
  };

  const handleView = (r: LiveReport) => {
    if (r.screenshot_path) {
      setPreviewSrc(`/uploads/${r.screenshot_path.split("/").pop()}`);
      setPreviewOpen(true);
    }
  };

  const exportCSV = () => {
    const headers = ["Tanggal", "Tayangan", "Berlian", "Durasi LIVE", "Pemberi Hadiah", "Pengikut Baru", "Komentar", "Leads TikTok", "Catatan"];
    const rows = filtered.map((r) => [
      r.tanggal, r.tayangan, r.berlian, r.durasi_live, r.pemberi_hadiah, r.pengikut_baru, r.komentar,
      r.leads_tiktok_live_pusat, r.catatan ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tiktok-live-laporan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthGuard><div className="flex min-h-screen bg-[#F0F2F5]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-[72px] lg:pt-[72px]">
          
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
                <FileText size={24} className="text-[#0866FF]" />
                Log Laporan LIVE
              </h1>
              <p className="text-[13px] text-[#65676b] mt-0.5">Manajemen seluruh data historis siaran TikTok LIVE Anda.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchAll} 
                className="p-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors border border-gray-200"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
              
              <button 
                onClick={exportCSV} 
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1c1e21] bg-white border border-gray-300 hover:bg-gray-50 rounded-sm transition-all"
              >
                <Download size={16} />
                Ekspor CSV
              </button>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white border border-gray-200 rounded-sm p-4 mb-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan tanggal, catatan, atau angka..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 rounded-sm text-sm outline-none transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-sm transition-colors ${filterOpen || filterStart || filterEnd ? "bg-[#ebf5ff] text-[#0866FF]" : "text-[#65676b] hover:bg-gray-100"}`}
              >
                <Filter size={16} />
                Filter
                {(filterStart || filterEnd) && <span className="w-2 h-2 rounded-full bg-[#0866FF]" />}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-white border border-gray-200 rounded-sm p-4 mb-4">
              <div className="flex items-end gap-4 flex-wrap">
                <div>
                  <label className="block text-xs font-semibold text-[#65676b] mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={filterStart}
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="px-3 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 rounded-sm text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#65676b] mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={filterEnd}
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="px-3 py-2 bg-gray-100 border border-transparent focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 rounded-sm text-sm outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => { setFilterStart(""); setFilterEnd(""); }}
                  className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                >
                  Hapus Filter
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
            <div className="p-1">
              <ReportTable
                reports={filtered}
                onEdit={(r) => { setEditReport(r); setEditOpen(true); }}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading}
              />
            </div>
            
            {/* Table Footer / Pagination Style */}
            <div className="px-5 py-4 border-t border-gray-100 bg-[#f5f6f7] flex items-center justify-between">
              <p className="text-[12px] font-medium text-[#65676b]">
                Menampilkan <span className="text-[#1c1e21]">{filtered.length}</span> laporan
              </p>
              <div className="flex gap-1">
                 <button disabled className="px-3 py-1 text-xs font-semibold text-gray-400 border border-gray-200 rounded-sm bg-white cursor-not-allowed">Sebelumnya</button>
                 <button disabled className="px-3 py-1 text-xs font-semibold text-gray-400 border border-gray-200 rounded-sm bg-white cursor-not-allowed">Selanjutnya</button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-sm p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                <Search size={40} />
              </div>
              <h3 className="text-lg font-bold text-[#1c1e21]">Laporan tidak ditemukan</h3>
              <p className="text-sm text-[#65676b] mt-1">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
              <button 
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-[#0866FF] hover:underline"
              >
                Tampilkan semua laporan
              </button>
            </div>
          )}
        </div>
      </main>

      <EditModal
        report={editReport}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={fetchAll}
      />
      <ImagePreviewModal
        src={previewSrc}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </div></AuthGuard>
  );
}