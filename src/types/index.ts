export interface LiveReport {
  id: number;
  tanggal: string;
  tayangan: string;
  berlian: number;
  durasi_live: string;
  pemberi_hadiah: number;
  pengikut_baru: number;
  komentar: string;
  screenshot_path: string | null;
  ocr_raw_text: string | null;
  user_id: number | null;
  uploader_name: string | null;
  catatan: string | null;
  leads_tiktok_live_pusat: number;
  leads_total: number;
  leads_closing: number;
  leads_organik: number;
  created_at: string;
  updated_at: string;
}

export interface LiveReportInput {
  tanggal: string;
  tayangan: string;
  berlian: number;
  durasi_live: string;
  pemberi_hadiah: number;
  pengikut_baru: number;
  komentar: string;
  screenshot_path?: string | null;
  ocr_raw_text?: string | null;
  catatan?: string | null;
  leads_tiktok_live_pusat?: number;
  leads_total?: number;
  leads_closing?: number;
  leads_organik?: number;
}

export interface OCRResult {
  text: string;
  parsed: ParsedLiveData;
  filename: string;
  confidence?: number;
}

export interface ParsedLiveData {
  tayangan: string;
  berlian: number;
  durasi_live: string;
  pemberi_hadiah: number;
  pengikut_baru: number;
  komentar: string;
}

export interface DashboardStats {
  total_live: number;
  total_tayangan: string;
  total_berlian: number;
  total_pengikut_baru: number;
  avg_komentar: string;
  total_pemberi_hadiah: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
