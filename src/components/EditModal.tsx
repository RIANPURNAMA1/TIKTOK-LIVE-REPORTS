"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import type { LiveReport, LiveReportInput } from "@/types";

interface EditModalProps {
  report: LiveReport | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditModal({ report, open, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState<LiveReportInput>({
    tanggal: "",
    tayangan: "",
    berlian: 0,
    durasi_live: "",
    pemberi_hadiah: 0,
    pengikut_baru: 0,
    komentar: "",
    catatan: "",
    leads_tiktok_live_pusat: 0,
    leads_total: 0,
    leads_closing: 0,
    leads_organik: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (report) {
      setForm({
        tanggal: report.tanggal?.slice(0, 10) ?? "",
        tayangan: report.tayangan,
        berlian: report.berlian,
        durasi_live: report.durasi_live,
        pemberi_hadiah: report.pemberi_hadiah,
        pengikut_baru: report.pengikut_baru,
        komentar: report.komentar,
        catatan: report.catatan ?? "",
        leads_tiktok_live_pusat: report.leads_tiktok_live_pusat,
        leads_total: report.leads_total,
        leads_closing: report.leads_closing,
        leads_organik: report.leads_organik,
      });
    }
  }, [report]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: ["berlian", "pemberi_hadiah", "pengikut_baru", "leads_tiktok_live_pusat", "leads_total", "leads_closing", "leads_organik"].includes(name) ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menyimpan");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const Field = ({ label, name, type = "text", step }: { label: string; name: string; type?: string; step?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        value={String(form[name as keyof LiveReportInput] ?? "")}
        onChange={handleChange}
        className="input-field"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Edit Laporan LIVE</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl border border-rose-100">
              {error}
            </div>
          )}
          <Field label="Tanggal" name="tanggal" type="date" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tayangan" name="tayangan" />
            <Field label="Berlian" name="berlian" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Durasi LIVE" name="durasi_live" />
            <Field label="Pemberi Hadiah" name="pemberi_hadiah" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pengikut Baru" name="pengikut_baru" type="number" />
            <Field label="Komentar" name="komentar" />
          </div>
          <hr className="border-gray-100" />
          <p className="text-xs font-bold text-[#0866FF] uppercase tracking-wider">Data Leads</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Leads TikTok" name="leads_tiktok_live_pusat" type="number" />
            <Field label="Total Leads" name="leads_total" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Closing" name="leads_closing" type="number" />
            <Field label="Leads Organik" name="leads_organik" type="number" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Catatan</label>
            <textarea
              name="catatan"
              rows={3}
              value={form.catatan ?? ""}
              onChange={handleChange}
              className="input-field resize-none"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
