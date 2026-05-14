"use client";

import { useState } from "react";
import { 
  BrainCircuit, 
  Search, 
  Loader2, 
  PlayCircle, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Sparkles,
  UserPlus,
  AlertCircle
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";

interface TikTokUser {
  username: string;
  nickname: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  avatar: string;
  videos: number;
}

interface TikTokVideo {
  id: string;
  desc: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  thumbnail: string;
  duration: number;
  createTime: number;
}

interface AnalisaData {
  user: TikTokUser | null;
  videos: TikTokVideo[];
  aiAnalysis: string;
  scrapeSuccess: boolean;
  error?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

export default function AnalisaAIPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AnalisaData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setHasData(false);
    setData(null);

    try {
      const res = await fetch("/api/analisa-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menganalisis");
      setData(json.data);
      setHasData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard><div className="flex min-h-screen bg-[#F0F2F5]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pt-[72px] lg:pt-[72px]">
          
          {/* Header & Search Section */}
          <div className="bg-white border border-gray-200 rounded-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
                  <BrainCircuit size={24} className="text-[#0866FF]" />
                  AI Profile Insight
                </h1>
                <p className="text-[13px] text-[#65676b] mt-1">
                  Tempelkan link profil TikTok untuk menganalisis performa video dan statistik akun.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65676b]" />
                <input
                  type="text"
                  placeholder="Paste link akun TikTok (contoh: https://www.tiktok.com/@username)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-transparent focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 rounded-sm text-sm outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#0866FF] hover:bg-[#0759df] disabled:bg-gray-300 text-white font-bold rounded-sm transition-all text-sm flex items-center justify-center gap-2 shadow-sm min-w-[150px]"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Analisis Akun
              </button>
            </form>
          </div>

          {!hasData && !loading && !error ? (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-sm p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                <Search size={40} />
              </div>
              <h3 className="text-lg font-bold text-[#1c1e21]">Mulai Analisis Akun</h3>
              <p className="text-sm text-[#65676b] mt-1 max-w-sm">
                Masukkan URL akun TikTok di atas untuk melihat data postingan, tingkat keterlibatan, dan pertumbuhan konten.
              </p>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="bg-white border border-gray-200 rounded-sm p-20 flex flex-col items-center justify-center text-center">
              <Loader2 size={40} className="text-[#0866FF] animate-spin mb-4" />
              <h3 className="text-lg font-bold text-[#1c1e21]">Mengambil data & menganalisis...</h3>
              <p className="text-sm text-[#65676b] mt-1">AI sedang merangkum performa akun TikTok.</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white border border-gray-200 rounded-sm p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1c1e21]">Gagal Menganalisis</h3>
              <p className="text-sm text-[#65676b] mt-1 max-w-md">{error}</p>
            </div>
          ) : data ? (
            /* Data Result State */
            <div className="space-y-6">
              {/* Scrape Warning */}
              {!data.scrapeSuccess && data.error && (
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{data.error}</p>
                </div>
              )}

              {/* Profile Stats Mini Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Followers", value: data.user ? formatCount(data.user.followers) : "—", icon: UserPlus, color: "text-blue-600" },
                  { label: "Total Likes", value: data.user ? formatCount(data.user.likes) : "—", icon: Heart, color: "text-rose-600" },
                  { label: "Total Videos", value: data.user ? formatCount(data.user.videos) : "—", icon: PlayCircle, color: "text-emerald-600" },
                  { label: "Following", value: data.user ? formatCount(data.user.following) : "—", icon: Sparkles, color: "text-amber-600" },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-bold text-[#65676b] uppercase tracking-wider">{s.label}</span>
                      <s.icon size={16} className={s.color} />
                    </div>
                    <div className="text-xl font-bold text-[#1c1e21]">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              {data.aiAnalysis && (
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-200 bg-[#f5f6f7] flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h3 className="text-sm font-bold text-[#1c1e21] uppercase tracking-wider">Analisis AI</h3>
                  </div>
                  <div className="p-5 text-sm text-[#1c1e21] leading-relaxed whitespace-pre-line">
                    {data.aiAnalysis}
                  </div>
                </div>
              )}

              {/* Video Feed Section */}
              {data.videos.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-gray-200 bg-[#f5f6f7] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#1c1e21] uppercase tracking-wider">Postingan Video Terbaru</h3>
                    <a
                      href={`https://www.tiktok.com/@${data.user?.username || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0866FF] font-semibold hover:underline flex items-center gap-1"
                    >
                      Lihat Semua <ExternalLink size={12} />
                    </a>
                  </div>
                  
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.videos.slice(0, 6).map((v, i) => (
                      <div key={v.id || i} className="border border-gray-200 rounded-sm overflow-hidden group">
                        <a
                          href={`https://www.tiktok.com/@${data.user?.username || ""}/video/${v.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <div className="aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center overflow-hidden">
                            {v.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <PlayCircle size={48} className="text-white/80" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-xs font-bold z-10">
                              <span className="flex items-center gap-1"><PlayCircle size={14}/> {formatCount(v.views)}</span>
                              <span className="flex items-center gap-1"><Heart size={14}/> {formatCount(v.likes)}</span>
                            </div>
                          </div>
                        </a>
                        <div className="p-3 bg-white">
                          <p className="text-sm text-[#1c1e21] line-clamp-2 mb-3 font-medium">
                            {v.desc || "Tidak ada deskripsi"}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex gap-3 text-[#65676b]">
                              <span className="flex items-center gap-1 text-xs"><MessageCircle size={14}/> {formatCount(v.comments)}</span>
                              <span className="flex items-center gap-1 text-xs"><Share2 size={14}/> {formatCount(v.shares)}</span>
                            </div>
                            <ExternalLink size={14} className="text-[#0866FF]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Videos */}
              {data.videos.length === 0 && data.scrapeSuccess && (
                <div className="bg-white border border-gray-200 rounded-sm p-10 flex flex-col items-center justify-center text-center">
                  <PlayCircle size={32} className="text-gray-300 mb-3" />
                  <p className="text-sm text-[#65676b]">Tidak ada data video yang ditemukan.</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div></AuthGuard>
  );
}