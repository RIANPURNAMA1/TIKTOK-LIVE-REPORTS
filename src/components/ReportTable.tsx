"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Pencil, Trash2, Eye, ImageIcon, ChevronUp, ChevronDown } from "lucide-react";
import type { LiveReport } from "@/types";

interface ReportTableProps {
  reports: LiveReport[];
  onEdit?: (report: LiveReport) => void;
  onDelete?: (id: number) => void;
  onView?: (report: LiveReport) => void;
  loading?: boolean;
}

type SortKey = keyof LiveReport;

export default function ReportTable({
  reports,
  onEdit,
  onDelete,
  onView,
  loading,
}: ReportTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("tanggal");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...reports].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? <ChevronUp size={13} className="text-rose-500" /> : <ChevronDown size={13} className="text-rose-500" />
    ) : (
      <ChevronDown size={13} className="text-gray-300" />
    );

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon k={k} />
      </span>
    </th>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-gray-50">
              {[...Array(8)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // if (reports.length === 0) {
  //   return (
  //     <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
  //       <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
  //         <ImageIcon size={28} className="text-gray-300" />
  //       </div>
  //       <p className="font-semibold text-gray-800">Belum ada laporan</p>
  //       <p className="text-sm text-gray-400 mt-1">Upload screenshot TikTok LIVE untuk mulai mencatat</p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
            <Th label="Tanggal" k="tanggal" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Diunggah Oleh</th>
            <Th label="Tayangan" k="tayangan" />
            <Th label="Berlian" k="berlian" />
            <Th label="Durasi LIVE" k="durasi_live" />
            <Th label="Pemberi Hadiah" k="pemberi_hadiah" />
            <Th label="Pengikut Baru" k="pengikut_baru" />
            <Th label="Komentar" k="komentar" />
            <Th label="Leads TikTok Live" k="leads_tiktok_live_pusat" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Catatan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((r, idx) => (
            <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3.5 text-gray-400 font-medium text-xs">{idx + 1}</td>
              <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">
                {(() => {
                  try {
                    return format(parseISO(r.tanggal), "dd MMM yyyy", { locale: id });
                  } catch {
                    return r.tanggal;
                  }
                })()}
              </td>
              <td className="px-4 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                {r.uploader_name || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3.5">
                <span className="badge bg-blue-50 text-blue-700">{r.tayangan}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="badge bg-amber-50 text-amber-700">💎 {r.berlian}</span>
              </td>
              <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{r.durasi_live}</td>
              <td className="px-4 py-3.5">
                <span className="badge bg-violet-50 text-violet-700">🎁 {r.pemberi_hadiah}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="badge bg-emerald-50 text-emerald-700">+{r.pengikut_baru}</span>
              </td>
              <td className="px-4 py-3.5">
                <span className="badge bg-rose-50 text-rose-700">💬 {r.komentar}</span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className="badge bg-blue-50 text-blue-700">{r.leads_tiktok_live_pusat}</span>
              </td>
              <td className="px-4 py-3.5 text-gray-500 text-xs max-w-[140px] truncate">
                {r.catatan || <span className="text-gray-300">—</span>}
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  {r.screenshot_path && (
                    <button
                      onClick={() => onView?.(r)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Lihat screenshot"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit?.(r)}
                    className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete?.(r.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
