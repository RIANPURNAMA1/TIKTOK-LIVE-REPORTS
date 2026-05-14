const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function seedUsers() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "reports_live",
  };

  const conn = await mysql.createConnection(config);
  try {
    const hash = await bcrypt.hash("password", 10);
    await conn.query("INSERT IGNORE INTO users (username, password, nama, role) VALUES ('admin', ?, 'Administrator', 'admin')", [hash]);
    await conn.query("INSERT IGNORE INTO users (username, password, nama, role) VALUES ('user', ?, 'User Biasa', 'user')", [hash]);
    console.log("✅ User seeded: admin/password (admin), user/password (user)");
  } catch (err) {
    console.error("❌ Gagal seed user:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

seedUsers();
