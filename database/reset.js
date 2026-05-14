/**
 * Database Reset - seperti migrate:fresh di Laravel
 * Hapus semua tabel & jalankan ulang schema.sql
 *
 * Usage: node database/reset.js
 */

const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

async function reset() {
  const config = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  };

  const dbName = process.env.DB_NAME || "tiktok_live_reporter";
  const schemaPath = path.resolve(__dirname, "schema.sql");

  console.log("🗃️  Menghubungkan ke database...");
  const conn = await mysql.createConnection(config);

  try {
    // Drop & create database
    console.log(`🗑️  Menghapus database ${dbName}...`);
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    console.log(`✅ Database ${dbName} berhasil dihapus`);

    // Run schema
    console.log("📦  Menjalankan schema.sql...");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await conn.query(schema);
    console.log("✅ Schema berhasil dijalankan");
    console.log("🎉 Database siap digunakan!");
  } catch (err) {
    console.error("❌ Gagal:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

reset();
