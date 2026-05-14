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

  try {
    const res = await fetch(`${API_URL}/keywords`, {
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
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal fetch keywords" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await checkAuth(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const res = await fetch(`${API_URL}/keywords/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal simpan keyword" }, { status: 500 });
  }
}
