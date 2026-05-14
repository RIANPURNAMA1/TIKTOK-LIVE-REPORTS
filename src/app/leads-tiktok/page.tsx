"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Loader2, AlertCircle, TrendingUp, Filter } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";

interface PlatformBreakdown {
  platform: string;
  count: number;
}

interface SummaryData {
  totalLeads: number;
  totalClosing: number;
  averageConversionRate: number;
  platformBreakdown: PlatformBreakdown[];
}

interface LeadsResponse {
  success: boolean;
  summary: SummaryData;
}

export default function LeadsTikTokPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leadsData, setLeadsData] = useState<LeadsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const fetchLeads = async (start?: string, end?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (start) params.set("startDate", start);
      if (end) params.set("endDate", end);
      const qs = params.toString();
      const res = await fetch(`/api/leads${qs ? `?${qs}` : ""}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal ambil leads");
      setLeadsData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(filterStart, filterEnd); }, []);

  const allBreakdown = leadsData?.summary?.platformBreakdown || [];
  const tiktokBreakdown = allBreakdown.filter((p) => p.platform === "TIKTOK LIVE PUSAT");
  const tiktokTotal = tiktokBreakdown.reduce((s, p) => s + p.count, 0);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#F0F2F5]">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
        <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-[72px] lg:pt-[72px]">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
                  <TrendingUp size={24} className="text-[#0866FF]" />
                  Leads TikTok LIVE
                </h1>
                <p className="text-[13px] text-[#65676b] mt-0.5">Pantau leads dari hasil siaran TikTok LIVE berdasarkan keyword</p>
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
                <button onClick={() => fetchLeads(filterStart, filterEnd)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0866FF] hover:bg-[#0759df] rounded-sm transition-colors">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Refresh
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
                    onClick={() => { setFilterStart(""); setFilterEnd(""); fetchLeads(); }}
                    className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                  >
                    Hapus Filter
                  </button>
                  <button
                    onClick={() => fetchLeads(filterStart, filterEnd)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#0866FF] hover:bg-[#0759df] rounded-sm transition-colors"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-sm p-10 text-center">
                <Loader2 size={24} className="animate-spin text-[#0866FF] mx-auto" />
              </div>
            ) : tiktokBreakdown.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-sm p-16 text-center">
                <TrendingUp size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-[#1c1e21]">Belum ada data TIKTOK LIVE PUSAT</p>
                <p className="text-sm text-[#65676b] mt-1">Tidak ada data platform TIKTOK LIVE PUSAT ditemukan.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-[#f5f6f7]">
                  <h3 className="text-sm font-bold text-[#1c1e21] uppercase tracking-wider">Leads hari ini</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-[#65676b] uppercase">Platform</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-[#65676b] uppercase">Jumlah Leads</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-[#65676b] uppercase">Persentase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tiktokBreakdown.map((p, i) => {
                        const pct = tiktokTotal > 0 ? ((p.count / tiktokTotal) * 100).toFixed(1) : "0";
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center gap-2 font-semibold text-rose-700">
                                <TrendingUp size={14} className="text-rose-500" />
                                {p.platform}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-sm font-bold bg-rose-50 text-rose-700">
                                {p.count}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right text-sm text-[#65676b]">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
