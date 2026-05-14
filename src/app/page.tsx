"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Eye, Diamond, Gift, Users, MessageCircle,
  Upload, RefreshCw, TrendingUp, Calendar, MoreHorizontal, CheckCircle
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";
import StatCard from "@/components/StatCard";
import EditModal from "@/components/EditModal";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import ReportTable from "@/components/ReportTable";
import type { LiveReport, DashboardStats } from "@/types";

function parseNum(s: string | number): number {
  if (typeof s === "number") return s;
  const clean = String(s).trim().toLowerCase().replace(/[.,\s]/g, "");
  if (clean.endsWith("k")) return parseFloat(clean) * 1000;
  if (clean.endsWith("m")) return parseFloat(clean) * 1_000_000;
  return parseInt(clean) || 0;
}

export default function DashboardPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reports, setReports] = useState<LiveReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editReport, setEditReport] = useState<LiveReport | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [repRes, statRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/stats"),
      ]);
      const repJson = await repRes.json();
      const statJson = await statRes.json();
      if (repJson.success) setReports(repJson.data);
      if (statJson.success) setStats(statJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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

  const chartData = [...reports]
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(-10)
    .map((r) => ({
      date: (() => { try { return format(parseISO(r.tanggal), "dd MMM", { locale: idLocale }); } catch { return r.tanggal; } })(),
      tayangan: parseNum(r.tayangan),
      pengikut: r.pengikut_baru,
      berlian: r.berlian,
      komentar: parseNum(r.komentar),
      leads: r.leads_tiktok_live_pusat,
    }));

  return (
    <AuthGuard><div className="flex min-h-screen bg-[#F0F2F5]"> {/* Warna background FB asli */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-20 lg:pt-[72px]">
          
          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
                <TrendingUp size={24} className="text-[#0866FF]" />
                Ringkasan Profesional
              </h1>
              <p className="text-[13px] text-[#65676b] mt-0.5">Pantau pertumbuhan dan performa konten TikTok LIVE Anda secara real-time.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchAll} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1c1e21] bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Perbarui Data
              </button>
              <Link 
                href="/upload" 
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0866FF] hover:bg-[#0759df] rounded-sm transition-colors shadow-sm"
              >
                <Upload size={16} />
                Unggah Laporan
              </Link>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {/* Stat Card Khusus dengan desain FB Pro */}
            <div className="bg-white border border-gray-200 rounded-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-[#65676b]">Total Jangkauan (Tayangan)</p>
                <Eye size={18} className="text-[#0866FF]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1c1e21]">{stats?.total_tayangan ?? "0"}</h3>
              <p className="text-[12px] text-green-600 font-semibold mt-1">↑ 12% dari periode sebelumnya</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-[#65676b]">Total Berlian</p>
                <Diamond size={18} className="text-[#f59e0b]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1c1e21]">💎 {stats?.total_berlian ?? "0"}</h3>
              <p className="text-[12px] text-[#65676b] mt-1">Akumulasi pendapatan</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-[#65676b]">Pengikut Baru</p>
                <Users size={18} className="text-[#10b981]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1c1e21]">+{stats?.total_pengikut_baru ?? "0"}</h3>
              <p className="text-[12px] text-green-600 font-semibold mt-1">Tren positif terdeteksi</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-gray-200 rounded-sm p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-[#1c1e21]">Tren Performa</h3>
                  <p className="text-[12px] text-[#65676b]">Visualisasi tayangan dan pengikut</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full"><MoreHorizontal size={18}/></button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                  <Tooltip contentStyle={{ border: "none", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                  <Area type="monotone" dataKey="tayangan" name="Tayangan" stroke="#0866FF" fillOpacity={1} fill="url(#colorView)" strokeWidth={3} />
                  <defs>
                    <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0866FF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0866FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm p-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-[#1c1e21]">Interaksi & Hadiah</h3>
                  <p className="text-[12px] text-[#65676b]">Data berlian dan komentar terbaru</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full"><MoreHorizontal size={18}/></button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                  <Tooltip cursor={{fill: '#f5f6f7'}} contentStyle={{ border: "none", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                  <Bar dataKey="berlian" name="Berlian" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="komentar" name="Komentar" fill="#0866FF" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads Chart */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-[#1c1e21]">Leads TikTok LIVE Pusat</h3>
                <p className="text-[12px] text-[#65676b]">Data leads dari TIKTOK LIVE PUSAT</p>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-full"><MoreHorizontal size={18}/></button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#65676b" }} />
                <Tooltip contentStyle={{ border: "none", borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} />
                <Area type="monotone" dataKey="leads" name="Leads TikTok" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={3} />
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Table */}
          <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-[#1c1e21]">Aktivitas LIVE Terbaru</h3>
                <p className="text-[12px] text-[#65676b]">Menampilkan {reports.slice(0, 7).length} data terakhir</p>
              </div>
              <Link href="/reports" className="px-3 py-1.5 text-[13px] font-semibold text-[#0866FF] hover:bg-blue-50 rounded-sm transition-colors">
                Lihat Semua Laporan
              </Link>
            </div>
            <div className="p-1">
              <ReportTable
                reports={reports.slice(0, 7)}
                onEdit={(r) => { setEditReport(r); setEditOpen(true); }}
                onDelete={handleDelete}
                onView={handleView}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals tetap menggunakan logic yang sama */}
      <EditModal report={editReport} open={editOpen} onClose={() => setEditOpen(false)} onSaved={fetchAll} />
      <ImagePreviewModal src={previewSrc} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div></AuthGuard>
  );
}