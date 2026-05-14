"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, ImageIcon, Loader2, CheckCircle2, XCircle, BrainCircuit, Save, X, Info, TrendingUp, Target, BarChart3 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useSidebar } from "@/lib/sidebar-context";
import type { ParsedLiveData } from "@/types";

interface UploadResult {
  filename: string;
  ocrText: string;
  parsed: ParsedLiveData;
}

interface PlatformItem {
  platform: string;
  count: number;
}

interface DeviceItem {
  name: string;
  lead_count: number;
  closing_count: number;
  leads_organik: number;
}

interface LeadsData {
  summary: {
    totalLeads: number;
    totalClosing: number;
    platformBreakdown: PlatformItem[];
  };
  deviceData: DeviceItem[];
}

export default function UploadPage() {
  const { collapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editParsed, setEditParsed] = useState<ParsedLiveData | null>(null);
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState("");
  const [leadsData, setLeadsData] = useState<LeadsData | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setLeadsData(json.data);
      })
      .catch(() => {})
      .finally(() => setLeadsLoading(false));
  }, []);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError("");
    setSaved(false);
    setEditParsed(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setSaved(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "OCR gagal");
      setResult(json.data);
      setEditParsed({ ...json.data.parsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  const tiktokLivePusat = leadsData?.summary?.platformBreakdown?.find(
    (p) => p.platform === "TIKTOK LIVE PUSAT"
  );
  const adminPusatDevice = leadsData?.deviceData?.find(
    (d) => d.name === "ADMIN PUSAT"
  );

  const handleSave = async () => {
    if (!result || !editParsed) return;
    setSaving(true);
    setError("");
    try {
      const body = {
        tanggal,
        ...editParsed,
        screenshot_path: result.filename,
        ocr_raw_text: result.ocrText,
        catatan,
        leads_tiktok_live_pusat: tiktokLivePusat?.count ?? 0,
        leads_total: adminPusatDevice?.lead_count ?? 0,
        leads_closing: adminPusatDevice?.closing_count ?? 0,
        leads_organik: adminPusatDevice?.leads_organik ?? 0,
      };
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal simpan");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setSaved(false);
    setEditParsed(null);
    setCatatan("");
    setTanggal(new Date().toISOString().slice(0, 10));
    if (fileRef.current) fileRef.current.value = "";
  };

  const fieldLabels: Record<keyof ParsedLiveData, string> = {
    tayangan: "Tayangan",
    berlian: "Berlian",
    durasi_live: "Durasi LIVE",
    pemberi_hadiah: "Pemberi Hadiah",
    pengikut_baru: "Pengikut Baru",
    komentar: "Komentar",
  };

  return (
    <AuthGuard><div className="flex min-h-screen bg-[#F0F2F5]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Header onMenuToggle={() => setMobileOpen((p) => !p)} />
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pt-[72px] lg:pt-[72px]">
          
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 mb-6">
            <h1 className="text-xl font-bold text-[#1c1e21] flex items-center gap-2">
              <BrainCircuit size={24} className="text-[#0866FF]" />
              Pusat Unggahan Laporan
            </h1>
            <p className="text-[13px] text-[#65676b] mt-1">Ekstrak data otomatis dari screenshot TikTok LIVE menggunakan teknologi AI Vision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KIRI: Upload Zone */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-sm transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px]
                  ${dragging 
                    ? "border-[#0866FF] bg-blue-50" 
                    : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"}`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {preview ? (
                  <div className="p-4 w-full h-full flex items-center justify-center">
                    <img src={preview} alt="preview" className="max-h-64 object-contain shadow-md" />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-[#65676b]" />
                    </div>
                    <p className="font-bold text-[#1c1e21]">Pilih Gambar atau Seret ke Sini</p>
                    <p className="text-sm text-[#65676b] mt-1 text-center max-w-[200px] mx-auto">Gunakan screenshot resolusi tinggi untuk hasil terbaik</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0866FF] hover:bg-[#0759df] disabled:bg-gray-300 text-white font-semibold rounded-sm transition-all text-sm shadow-sm"
                >
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
                  {uploading ? "Menganalisis Data..." : "Mulai Analisis AI"}
                </button>
                {file && (
                  <button onClick={resetAll} className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-[#1c1e21] font-semibold rounded-sm transition-all text-sm">
                    Reset
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-[#ffebe8] border border-[#f5c6cb] text-[#d93025] text-[13px] px-4 py-3 rounded-sm flex items-start gap-2">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>

            {/* KANAN: OCR Result / Form */}
            <div className="space-y-4">
              {!result && !uploading && (
                <div className="bg-white rounded-sm border border-gray-200 p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Info size={30} className="text-gray-300" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1c1e21]">Belum Ada Data</h3>
                  <p className="text-xs text-[#65676b] mt-1 max-w-[220px]">Data hasil ekstraksi AI Vision akan ditampilkan di panel ini setelah proses unggah selesai.</p>
                </div>
              )}

              {uploading && (
                <div className="bg-white rounded-sm border border-gray-200 p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-100 border-t-[#0866FF] rounded-full animate-spin"></div>
                    <BrainCircuit size={30} className="absolute inset-0 m-auto text-[#0866FF]" />
                  </div>
                  <p className="font-bold text-[#1c1e21] mt-6">AI Vision Berjalan</p>
                  <p className="text-xs text-[#65676b] mt-1">Grog AI sedang mengidentifikasi angka di dalam gambar...</p>
                </div>
              )}

              {result && editParsed && (
                <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-[#f5f6f7] flex justify-between items-center">
                    <p className="font-bold text-[#1c1e21] text-sm uppercase tracking-wide">Hasil Ekstraksi Data</p>
                    {saved && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-200">Tersimpan</span>}
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[12px] font-bold text-[#65676b] uppercase">Tanggal Siaran</label>
                        <input
                          type="date"
                          value={tanggal}
                          onChange={(e) => setTanggal(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                        />
                      </div>
                      
                      {(Object.keys(fieldLabels) as Array<keyof ParsedLiveData>).map((k) => (
                        <div key={k}>
                          <label className="text-[12px] font-bold text-[#65676b] uppercase">{fieldLabels[k]}</label>
                          <input
                            type={["berlian", "pemberi_hadiah", "pengikut_baru"].includes(k) ? "number" : "text"}
                            value={String(editParsed[k])}
                            onChange={(e) =>
                              setEditParsed((prev) => prev ? {
                                ...prev,
                                [k]: ["berlian", "pemberi_hadiah", "pengikut_baru"].includes(k) ? Number(e.target.value) : e.target.value
                              } : prev)
                            }
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-[#65676b] uppercase">Catatan Tambahan</label>
                      <textarea
                        rows={2}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Misal: Sesi live jualan jam 8 malam"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:border-[#0866FF] outline-none"
                      />
                    </div>

                    {/* Leads TIKTOK LIVE PUSAT */}
                    {!leadsLoading && leadsData && tiktokLivePusat && (
                      <div className="border border-rose-200 rounded-sm bg-rose-50 p-4">
                        <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2 mb-3">
                          <Target size={16} /> Leads TIKTOK LIVE PUSAT
                        </h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-rose-700">{tiktokLivePusat.count}</div>
                          <div className="text-[10px] font-bold text-rose-500 uppercase">Leads</div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSave}
                      disabled={saving || saved}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 font-bold rounded-sm transition-all text-sm
                        ${saved 
                          ? "bg-green-600 text-white" 
                          : "bg-[#0866FF] hover:bg-[#0759df] text-white shadow-sm"}`}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                      {saving ? "Memproses..." : saved ? "Data Berhasil Masuk Database" : "Simpan ke Laporan"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-white border border-gray-200 rounded-sm p-5">
            <h4 className="text-sm font-bold text-[#1c1e21] mb-3 flex items-center gap-2">
              <Info size={16} className="text-[#0866FF]" />
              Instruksi Penggunaan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[12px] text-[#65676b]">
              <div>
                <span className="font-bold text-[#1c1e21]">1. Screenshot</span>
                <p>Ambil gambar dari menu Analisis LIVE TikTok di smartphone Anda.</p>
              </div>
              <div>
                <span className="font-bold text-[#1c1e21]">2. Analisis AI</span>
                <p>Gunakan tombol biru untuk menjalankan ekstraksi data otomatis.</p>
              </div>
              <div>
                <span className="font-bold text-[#1c1e21]">3. Verifikasi</span>
                <p>Pastikan angka yang terbaca sudah sesuai sebelum menekan tombol simpan.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div></AuthGuard>
  );
}
