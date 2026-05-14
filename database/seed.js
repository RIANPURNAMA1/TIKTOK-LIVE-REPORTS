const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "reports_live",
};

async function seed() {
  const conn = await mysql.createConnection(config);
  try {
    // Seed users
    const hash = await bcrypt.hash("password", 10);
    await conn.query("INSERT IGNORE INTO users (username, password, nama, role) VALUES ('admin', ?, 'Administrator', 'admin')", [hash]);
    await conn.query("INSERT IGNORE INTO users (username, password, nama, role) VALUES ('user', ?, 'User Biasa', 'user')", [hash]);
    console.log("✅ User seeded: admin/password (admin), user/password (user)");

    // Seed sample reports
    const sampleData = [
      { tanggal: "2026-05-01", tayangan: "18.5K", berlian: 245000, durasi_live: "2.5 jam", pemberi_hadiah: 89, pengikut_baru: 120, komentar: "1.2K", leads_tiktok_live_pusat: 15, leads_total: 22, leads_closing: 5, leads_organik: 7, catatan: "Promo produk baru, interaksi tinggi" },
      { tanggal: "2026-05-02", tayangan: "12.3K", berlian: 178000, durasi_live: "1.8 jam", pemberi_hadiah: 62, pengikut_baru: 85, komentar: "890", leads_tiktok_live_pusat: 10, leads_total: 16, leads_closing: 3, leads_organik: 6, catatan: "Sesi Q&A santai" },
      { tanggal: "2026-05-03", tayangan: "22.1K", berlian: 312000, durasi_live: "3.2 jam", pemberi_hadiah: 134, pengikut_baru: 210, komentar: "2.1K", leads_tiktok_live_pusat: 20, leads_total: 30, leads_closing: 8, leads_organik: 10, catatan: "Giveaway menarik banyak viewers" },
      { tanggal: "2026-05-04", tayangan: "15.7K", berlian: 198000, durasi_live: "2.0 jam", pemberi_hadiah: 75, pengikut_baru: 95, komentar: "1.0K", leads_tiktok_live_pusat: 12, leads_total: 18, leads_closing: 4, leads_organik: 6, catatan: "Konten edukasi tutorial" },
      { tanggal: "2026-05-05", tayangan: "20.4K", berlian: 289000, durasi_live: "2.8 jam", pemberi_hadiah: 110, pengikut_baru: 175, komentar: "1.8K", leads_tiktok_live_pusat: 18, leads_total: 26, leads_closing: 6, leads_organik: 9, catatan: "Kolaborasi dengan creator lain" },
      { tanggal: "2026-05-06", tayangan: "9.8K", berlian: 125000, durasi_live: "1.5 jam", pemberi_hadiah: 45, pengikut_baru: 60, komentar: "650", leads_tiktok_live_pusat: 7, leads_total: 11, leads_closing: 2, leads_organik: 4, catatan: "Sesi malam singkat" },
      { tanggal: "2026-05-07", tayangan: "25.6K", berlian: 398000, durasi_live: "3.5 jam", pemberi_hadiah: 156, pengikut_baru: 280, komentar: "2.8K", leads_tiktok_live_pusat: 25, leads_total: 38, leads_closing: 10, leads_organik: 13, catatan: "Event spesial akhir pekan" },
      { tanggal: "2026-05-08", tayangan: "16.3K", berlian: 215000, durasi_live: "2.2 jam", pemberi_hadiah: 82, pengikut_baru: 105, komentar: "1.1K", leads_tiktok_live_pusat: 13, leads_total: 20, leads_closing: 5, leads_organik: 7, catatan: "Review produk" },
      { tanggal: "2026-05-09", tayangan: "14.1K", berlian: 167000, durasi_live: "1.9 jam", pemberi_hadiah: 58, pengikut_baru: 78, komentar: "780", leads_tiktok_live_pusat: 9, leads_total: 14, leads_closing: 3, leads_organik: 5, catatan: "Sharing tips & tricks" },
      { tanggal: "2026-05-10", tayangan: "19.2K", berlian: 276000, durasi_live: "2.6 jam", pemberi_hadiah: 98, pengikut_baru: 145, komentar: "1.5K", leads_tiktok_live_pusat: 16, leads_total: 24, leads_closing: 7, leads_organik: 8, catatan: "Live streaming challenge" },
    ];

    const [adminRows] = await conn.query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    const adminId = adminRows[0]?.id || null;

    for (const d of sampleData) {
      await conn.query(
        `INSERT IGNORE INTO live_reports 
         (tanggal, tayangan, berlian, durasi_live, pemberi_hadiah, pengikut_baru, komentar, 
          leads_tiktok_live_pusat, leads_total, leads_closing, leads_organik, catatan, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.tanggal, d.tayangan, d.berlian, d.durasi_live, d.pemberi_hadiah, d.pengikut_baru, d.komentar,
         d.leads_tiktok_live_pusat, d.leads_total, d.leads_closing, d.leads_organik, d.catatan, adminId]
      );
    }
    console.log(`✅ ${sampleData.length} laporan sample berhasil di-seed`);

    console.log("\n🎉 Seeding selesai! Silakan login dengan:");
    console.log("   Admin: admin / password");
    console.log("   User:  user / password");
  } catch (err) {
    console.error("❌ Gagal seed:", err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

seed();
