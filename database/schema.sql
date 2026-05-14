-- TikTok Live Reporter Database Schema
-- Run this file to set up the database

CREATE DATABASE IF NOT EXISTS tiktok_live_reporter
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tiktok_live_reporter;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main live reports table
CREATE TABLE IF NOT EXISTS live_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL COMMENT 'Tanggal siaran LIVE',
  tayangan VARCHAR(20) NOT NULL DEFAULT '0' COMMENT 'Jumlah tayangan (contoh: 18.8K)',
  berlian INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Jumlah berlian diterima',
  durasi_live VARCHAR(30) NOT NULL DEFAULT '0 jam' COMMENT 'Durasi LIVE (contoh: 107 jam)',
  pemberi_hadiah INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Jumlah pemberi hadiah',
  pengikut_baru INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Jumlah pengikut baru',
  komentar VARCHAR(20) NOT NULL DEFAULT '0' COMMENT 'Jumlah komentar (contoh: 4.7K)',
  screenshot_path VARCHAR(500) NULL COMMENT 'Path file screenshot',
  ocr_raw_text LONGTEXT NULL COMMENT 'Raw text hasil OCR',
  user_id INT UNSIGNED NULL COMMENT 'ID user yang mengupload',
  catatan TEXT NULL COMMENT 'Catatan tambahan',
  leads_tiktok_live_pusat INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Leads dari TIKTOK LIVE PUSAT',
  leads_total INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Total leads dari satupintu',
  leads_closing INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Closing leads',
  leads_organik INT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Leads organik',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
