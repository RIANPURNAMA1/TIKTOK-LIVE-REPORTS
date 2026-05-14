import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { LiveReportInput } from "@/types";

export const dynamic = "force-dynamic";

// PUT /api/reports/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const body: LiveReportInput = await req.json();
    const {
      tanggal,
      tayangan,
      berlian,
      durasi_live,
      pemberi_hadiah,
      pengikut_baru,
      komentar,
      catatan,
    } = body;

    await pool.query(
      `UPDATE live_reports SET
        tanggal = ?, tayangan = ?, berlian = ?, durasi_live = ?,
        pemberi_hadiah = ?, pengikut_baru = ?, komentar = ?, catatan = ?
       WHERE id = ?`,
      [tanggal, tayangan, berlian, durasi_live, pemberi_hadiah, pengikut_baru, komentar, catatan ?? null, id]
    );

    return NextResponse.json({ success: true, message: "Laporan berhasil diperbarui" });
  } catch (error) {
    console.error("PUT /api/reports/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data" }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await pool.query("DELETE FROM live_reports WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Laporan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/reports/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus data" }, { status: 500 });
  }
}
