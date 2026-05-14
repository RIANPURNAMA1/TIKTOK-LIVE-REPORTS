import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "tiktok-reporter-secret-key-2026";

export interface UserPayload {
  id: number;
  username: string;
  nama: string;
  role: "admin" | "user";
}

export async function verifyLogin(
  username: string,
  password: string
): Promise<UserPayload | null> {
  const [rows] = await pool.query<import("mysql2").RowDataPacket[]>(
    "SELECT id, username, password, nama, role FROM users WHERE username = ?",
    [username]
  );
  if (rows.length === 0) return null;

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  return { id: user.id, username: user.username, nama: user.nama, role: user.role };
}

export function signToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? match[1] : null;
}
