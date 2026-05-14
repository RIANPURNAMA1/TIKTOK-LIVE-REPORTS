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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id: idStr } = await params;
    const id = Number(idStr);
    const { nama, role, password } = await req.json();

    if (!nama || !role) {
      return NextResponse.json({ success: false, error: "Nama dan role harus diisi" }, { status: 400 });
    }
    if (!["admin", "user"].includes(role)) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
    }

    if (password && password.length > 0) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET nama = ?, role = ?, password = ? WHERE id = ?", [nama, role, hash, id]);
    } else {
      await pool.query("UPDATE users SET nama = ?, role = ? WHERE id = ?", [nama, role, id]);
    }

    return NextResponse.json({ success: true, message: "User berhasil diupdate" });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Gagal mengupdate user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (id === admin.id) {
    return NextResponse.json({ success: false, error: "Tidak bisa menghapus akun sendiri" }, { status: 400 });
  }

  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return NextResponse.json({ success: true, message: "User berhasil dihapus" });
}
