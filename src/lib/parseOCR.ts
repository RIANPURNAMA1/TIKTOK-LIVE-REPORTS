import type { ParsedLiveData } from "@/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export function parseNumericValue(str: string): number {
  if (!str) return 0;
  const cleaned = str.trim().replace(/[,\s]/g, "");
  const lower = cleaned.toLowerCase();
  if (lower.endsWith("k")) return Math.round(parseFloat(lower) * 1000);
  if (lower.endsWith("m")) return Math.round(parseFloat(lower) * 1_000_000);
  return parseInt(cleaned, 10) || 0;
}

export function formatDisplayNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function parseTikTokLiveData(rawText: string): ParsedLiveData {
  const result: ParsedLiveData = {
    tayangan: "0",
    berlian: 0,
    durasi_live: "0 jam",
    pemberi_hadiah: 0,
    pengikut_baru: 0,
    komentar: "0",
  };

  if (!rawText) return result;
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const isNumberToken = (s: string) => /^[\d]+([.,][\d]+)?[KkMm]?$/.test(s.trim());

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next1 = (lines[i + 1] || "").toLowerCase();
    const next2 = (lines[i + 2] || "").toLowerCase();
    const combinedNext = `${next1} ${next2}`;
    if (!isNumberToken(cur)) continue;
    if (combinedNext.includes("tayangan")) result.tayangan = cur;
    else if (combinedNext.includes("berlian")) result.berlian = parseNumericValue(cur);
    else if (combinedNext.includes("durasi") || combinedNext.includes("jam durasi")) result.durasi_live = `${cur} jam`;
    else if (combinedNext.includes("pemberi") || combinedNext.includes("hadiah")) result.pemberi_hadiah = parseNumericValue(cur);
    else if (combinedNext.includes("pengikut baru") || combinedNext.includes("pengikut")) result.pengikut_baru = parseNumericValue(cur);
    else if (combinedNext.includes("komentar")) result.komentar = cur;
    if (next1.startsWith("jam") && !result.durasi_live.startsWith("0")) {}
  }

  const fullText = rawText.toLowerCase();
  if (result.tayangan === "0") { const m = fullText.match(/([\d.,]+[km]?)\s*tayangan/i); if (m) result.tayangan = m[1].toUpperCase(); }
  if (result.berlian === 0) { const m = fullText.match(/([\d.,]+[km]?)\s*berlian/i); if (m) result.berlian = parseNumericValue(m[1]); }
  if (result.durasi_live === "0 jam") { const m = fullText.match(/([\d.,]+)\s*jam/i); if (m) result.durasi_live = `${m[1]} jam`; }
  if (result.pemberi_hadiah === 0) { const m = fullText.match(/([\d.,]+[km]?)\s*pemberi/i); if (m) result.pemberi_hadiah = parseNumericValue(m[1]); }
  if (result.pengikut_baru === 0) { const m = fullText.match(/([\d.,]+[km]?)\s*pengikut\s*baru/i); if (m) result.pengikut_baru = parseNumericValue(m[1]); }
  if (result.komentar === "0") { const m = fullText.match(/([\d.,]+[km]?)\s*komentar/i); if (m) result.komentar = m[1].toUpperCase(); }

  if (result.durasi_live === "0 jam") {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase() === "jam" && i > 0 && isNumberToken(lines[i - 1])) {
        result.durasi_live = `${lines[i - 1]} jam`;
        break;
      }
    }
  }
  return result;
}

function extractJSON(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

async function compressImage(imagePath: string): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  let width = metadata.width || 1200;
  let height = metadata.height || 1200;

  // Resize if too large (max 1200px on longest side)
  if (width > 1200 || height > 1200) {
    if (width > height) {
      height = Math.round((height / width) * 1200);
      width = 1200;
    } else {
      width = Math.round((width / height) * 1200);
      height = 1200;
    }
  }

  return image.resize(width, height).jpeg({ quality: 80 }).toBuffer();
}

export async function runOCR(
  imagePath: string
): Promise<{ text: string; parsed: ParsedLiveData }> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: GROQ_API_KEY });

  let imageBuffer: Buffer;
  try {
    imageBuffer = await compressImage(imagePath);
  } catch {
    // Fallback: read as-is
    const { readFile } = await import("fs/promises");
    imageBuffer = await readFile(imagePath);
  }

  const base64Image = imageBuffer.toString("base64");

  // Warn if base64 > 4MB (Groq limit)
  if (base64Image.length > 4 * 1024 * 1024) {
    throw new Error("Ukuran gambar terlalu besar setelah encoding. Maksimal 4MB base64.");
  }

  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  const prompt = `Anda adalah asisten AI yang membaca screenshot analitik TikTok LIVE.
Ekstrak data berikut dari gambar screenshot TikTok LIVE Analytics dalam format JSON.
Jangan tambahkan teks lain, hanya JSON.

Field yang diperlukan:
{
  "tayangan": "angka tampilan (contoh: \"18.8K\")",
  "berlian": jumlah berlian (angka, contoh: 18800),
  "durasi_live": "durasi live (contoh: \"2 jam 10 menit\")",
  "pemberi_hadiah": jumlah pemberi hadiah (angka),
  "pengikut_baru": jumlah pengikut baru (angka),
  "komentar": "jumlah komentar (contoh: \"1.5K\")"
}

Perhatikan:
- Tayangan bisa ditulis "188K", "18.8K", "1.2M" dll — simpan sebagai string aslinya
- Durasi LIVE: cari tulisan seperti "2j 10m", "2 jam 10 menit", atau format lainnya — tulis sebagai string
- Berlian, Pemberi Hadiah, Pengikut Baru: gunakan angka numerik (contoh: 18800)
- Komentar: simpan sebagai string asli seperti "1.5K"

Keluarkan HANYA JSON, tanpa markdown, tanpa penjelasan.`;

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const rawText = completion.choices[0]?.message?.content || "";

  // Try to parse JSON from response
  const parsed_json = extractJSON(rawText);
  if (parsed_json) {
    const parsed: ParsedLiveData = {
      tayangan: String(parsed_json.tayangan ?? "0"),
      berlian: Number(parsed_json.berlian) || 0,
      durasi_live: String(parsed_json.durasi_live ?? "0 jam"),
      pemberi_hadiah: Number(parsed_json.pemberi_hadiah) || 0,
      pengikut_baru: Number(parsed_json.pengikut_baru) || 0,
      komentar: String(parsed_json.komentar ?? "0"),
    };
    return { text: rawText, parsed };
  }

  // Fallback: parse as plain text
  const parsed = parseTikTokLiveData(rawText);
  return { text: rawText, parsed };
}
