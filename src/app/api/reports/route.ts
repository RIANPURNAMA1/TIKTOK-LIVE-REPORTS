import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import type { LiveReportInput } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/reports
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT r.*, u.nama as uploader_name
       FROM live_reports r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.tanggal DESC, r.created_at DESC`
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data" }, { status: 500 });
  }
}

// POST /api/reports
export async function POST(req: NextRequest) {
  try {
    const body: LiveReportInput = await req.json();
    const {
      tanggal,
      tayangan,
      berlian,
      durasi_live,
      pemberi_hadiah,
      pengikut_baru,
      komentar,
      screenshot_path,
      ocr_raw_text,
      catatan,
      leads_tiktok_live_pusat,
      leads_total,
      leads_closing,
      leads_organik,
    } = body;

    if (!tanggal || !tayangan) {
      return NextResponse.json({ success: false, error: "Tanggal dan tayangan wajib diisi" }, { status: 400 });
    }

    // Get current user from cookie
    let userId: number | null = null;
    const token = getTokenFromCookie(req);
    if (token) {
      const user = verifyToken(token);
      if (user) userId = user.id;
    }

    const [result] = await pool.query(
      `INSERT INTO live_reports
        (tanggal, tayangan, berlian, durasi_live, pemberi_hadiah, pengikut_baru, komentar, screenshot_path, ocr_raw_text, catatan, user_id, leads_tiktok_live_pusat, leads_total, leads_closing, leads_organik)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tanggal, tayangan, berlian ?? 0, durasi_live ?? "0 jam", pemberi_hadiah ?? 0, pengikut_baru ?? 0, komentar ?? "0", screenshot_path ?? null, ocr_raw_text ?? null, catatan ?? null, userId, leads_tiktok_live_pusat ?? 0, leads_total ?? 0, leads_closing ?? 0, leads_organik ?? 0]
    );

    return NextResponse.json({ success: true, data: result, message: "Laporan berhasil disimpan" });
  } catch (error) {
    console.error("POST /api/reports error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan data" }, { status: 500 });
  }
}
