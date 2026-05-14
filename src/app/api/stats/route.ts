import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

function parseToNum(s: string | null | undefined): number {
  if (!s) return 0;
  const clean = String(s).trim().toLowerCase().replace(/,/g, "");
  if (clean.endsWith("k")) return Math.round(parseFloat(clean) * 1000);
  if (clean.endsWith("m")) return Math.round(parseFloat(clean) * 1_000_000);
  return parseInt(clean) || 0;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT tayangan, berlian, pengikut_baru, pemberi_hadiah, komentar FROM live_reports"
    ) as [Array<{ tayangan: string; berlian: number; pengikut_baru: number; pemberi_hadiah: number; komentar: string }>, unknown];

    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM live_reports") as [Array<{ total: number }>, unknown];

    let totalTayangan = 0;
    let totalBerlian = 0;
    let totalPengikut = 0;
    let totalPemberi = 0;
    let totalKomentar = 0;

    for (const r of rows) {
      totalTayangan += parseToNum(r.tayangan);
      totalBerlian += Number(r.berlian);
      totalPengikut += Number(r.pengikut_baru);
      totalPemberi += Number(r.pemberi_hadiah);
      totalKomentar += parseToNum(r.komentar);
    }

    const count = countRows[0]?.total ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        total_live: count,
        total_tayangan: formatNum(totalTayangan),
        total_berlian: totalBerlian,
        total_pengikut_baru: totalPengikut,
        avg_komentar: count > 0 ? formatNum(Math.round(totalKomentar / count)) : "0",
        total_pemberi_hadiah: totalPemberi,
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
