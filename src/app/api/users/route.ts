import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const token = getTokenFromCookie(req);
  if (!token) return null;
  const user = verifyToken(token);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const [rows] = await pool.query<import("mysql2").RowDataPacket[]>(
    "SELECT id, username, nama, role, created_at FROM users ORDER BY created_at ASC"
  );
  return NextResponse.json({ success: true, data: rows });
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { username, password, nama, role } = await req.json();
    if (!username || !password || !nama || !role) {
      return NextResponse.json({ success: false, error: "Semua field harus diisi" }, { status: 400 });
    }
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, password, nama, role) VALUES (?, ?, ?, ?)",
      [username, hash, nama, role]
    );
    return NextResponse.json({ success: true, message: "User berhasil ditambahkan" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menambahkan user";
    if (msg.includes("Duplicate")) {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
