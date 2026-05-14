import { NextRequest, NextResponse } from "next/server";
import { verifyLogin, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username dan password harus diisi" }, { status: 400 });
    }

    const user = await verifyLogin(username, password);
    if (!user) {
      return NextResponse.json({ success: false, error: "Username atau password salah" }, { status: 401 });
    }

    const token = signToken(user);
    const res = NextResponse.json({ success: true, data: { user } });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Terjadi kesalahan" }, { status: 500 });
  }
}
