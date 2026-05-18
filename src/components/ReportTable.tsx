"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Pencil, Trash2, Eye, ChevronUp, ChevronDown, Image } from "lucide-react";
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
      sortDir === "asc" ? <ChevronUp size={12} className="text-gray-600" /> : <ChevronDown size={12} className="text-gray-600" />
    ) : (
      <ChevronDown size={12} className="text-gray-300" />
    );

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none whitespace-nowrap border border-gray-200 bg-gray-50"
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
      <div className="border border-gray-200 rounded overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-4 border-b border-gray-200">
              {[...Array(8)].map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="border border-gray-200 rounded p-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Image size={24} className="text-gray-400" />
        </div>
        <p className="font-semibold text-gray-900">Belum ada laporan</p>
        <p className="text-sm text-gray-500 mt-1">Upload screenshot TikTok LIVE untuk mulai mencatat</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile card view */}
      <div className="sm:hidden flex flex-col gap-3">
        {sorted.map((r, idx) => (
          <div key={r.id} className="bg-white border border-gray-200 rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-mono">#{idx + 1}</span>
              <div className="flex items-center gap-1">
                {r.screenshot_path && (
                  <button onClick={() => onView?.(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Lihat screenshot">
                    <Eye size={14} />
                  </button>
                )}
                <button onClick={() => onEdit?.(r)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title="Edit">
                  <Pencil size={14} />
                </button>
                <button onClick={() => onDelete?.(r.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Hapus">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {(() => {
                try { return format(parseISO(r.tanggal), "dd MMM yyyy", { locale: id }); }
                catch { return r.tanggal; }
              })()}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
              <span className="text-gray-500">Tayangan:</span>
              <span className="text-gray-900 text-right font-medium">{r.tayangan}</span>
              <span className="text-gray-500">Berlian:</span>
              <span className="text-gray-900 text-right font-medium">{r.berlian.toLocaleString("id-ID")}</span>
              <span className="text-gray-500">Pengikut:</span>
              <span className="text-gray-900 text-right font-medium">{r.pengikut_baru}</span>
              <span className="text-gray-500">Komentar:</span>
              <span className="text-gray-900 text-right font-medium">{r.komentar}</span>
              <span className="text-gray-500">Durasi:</span>
              <span className="text-gray-900 text-right font-medium">{r.durasi_live}</span>
              <span className="text-gray-500">Hadiah:</span>
              <span className="text-gray-900 text-right font-medium">{r.pemberi_hadiah}</span>
              <span className="text-gray-500">Leads:</span>
              <span className="text-gray-900 text-right font-medium">{r.leads_tiktok_live_pusat}</span>
            </div>
            {r.uploader_name && (
              <div className="text-[11px] text-gray-400">Oleh: {r.uploader_name}</div>
            )}
            {r.catatan && (
              <div className="text-[11px] text-gray-500 italic truncate">{r.catatan}</div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block border border-gray-200 rounded w-full overflow-hidden min-w-0">
        <div className="w-full max-w-full" style={{ overflowX: 'auto' }}>
          <table className="w-full text-sm bg-white min-w-[900px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 w-8">#</th>
                <Th label="Tanggal" k="tanggal" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border border-gray-200 bg-gray-50">Uploader</th>
                <Th label="Tayangan" k="tayangan" />
                <Th label="Berlian" k="berlian" />
                <Th label="Durasi" k="durasi_live" />
                <Th label="Hadiah" k="pemberi_hadiah" />
                <Th label="Pengikut" k="pengikut_baru" />
                <Th label="Komentar" k="komentar" />
                <Th label="Leads" k="leads_tiktok_live_pusat" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 bg-gray-50">Catatan</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 bg-gray-50 w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, idx) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3 text-gray-500 text-xs border border-gray-200 align-middle">{idx + 1}</td>
                  <td className="px-3 py-3 font-semibold text-gray-900 text-sm whitespace-nowrap border border-gray-200 align-middle">
                    {(() => {
                      try {
                        return format(parseISO(r.tanggal), "dd MMM yyyy", { locale: id });
                      } catch {
                        return r.tanggal;
                      }
                    })()}
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs border border-gray-200 align-middle">
                    {r.uploader_name || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3 text-gray-900 border border-gray-200 align-middle">{r.tayangan}</td>
                  <td className="px-3 py-3 text-gray-900 border border-gray-200 align-middle">{r.berlian.toLocaleString("id-ID")}</td>
                  <td className="px-3 py-3 text-gray-900 whitespace-nowrap border border-gray-200 align-middle">{r.durasi_live}</td>
                  <td className="px-3 py-3 text-gray-900 border border-gray-200 align-middle">{r.pemberi_hadiah}</td>
                  <td className="px-3 py-3 text-gray-900 border border-gray-200 align-middle">{r.pengikut_baru}</td>
                  <td className="px-3 py-3 text-gray-900 border border-gray-200 align-middle">{r.komentar}</td>
                  <td className="px-3 py-3 text-gray-900 text-center border border-gray-200 align-middle">{r.leads_tiktok_live_pusat}</td>
                  <td className="px-3 py-3 text-gray-500 text-xs max-w-[130px] truncate border border-gray-200 align-middle">
                    {r.catatan || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-3 border border-gray-200 align-middle">
                    <div className="flex items-center gap-0.5">
                      {r.screenshot_path && (
                        <button
                          onClick={() => onView?.(r)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Lihat screenshot"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit?.(r)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDelete?.(r.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
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
      </div>
    </>
  );
}