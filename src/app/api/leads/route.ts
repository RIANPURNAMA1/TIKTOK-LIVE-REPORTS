import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

const API_URL = process.env.SATUPINTU_API_URL || "https://api.satupintu.mendunia.id";
const API_TOKEN = process.env.SATUPINTU_API_TOKEN || "";

async function checkAuth(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let apiUrl = `${API_URL}/api/social/media/all/leads`;
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  if (qs) apiUrl += `?${qs}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ success: false, error: `API error: ${res.status}` }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json({ success: true, data: json });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal fetch leads: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
