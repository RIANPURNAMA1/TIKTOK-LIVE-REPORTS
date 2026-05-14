import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = verifyToken(token);
  if (!user) {
    return NextResponse.json({ success: false, error: "Token invalid" }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: { user } });
}
