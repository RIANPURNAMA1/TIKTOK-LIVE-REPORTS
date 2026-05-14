import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { runOCR } from "@/lib/parseOCR";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: "GROQ_API_KEY belum diatur. Tambahkan di file .env" }, { status: 500 });
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file yang dikirim" }, { status: 400 });
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "File harus berupa gambar" }, { status: 400 });
    }

    // Validate size (3MB max for Groq base64 limit)
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Ukuran file maksimal 3MB (batas encoding base64 Groq AI)" }, { status: 400 });
    }

    // Compress image to ~100KB
    const filename = `live_${Date.now()}.jpg`;
    const filePath = path.join(UPLOAD_DIR, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length <= 100 * 1024) {
      // Already small enough, save as-is (convert to jpg for consistency)
      const img = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
      await writeFile(filePath, img);
    } else {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      let { width, height } = metadata;
      const MAX_DIM = 1200;
      if ((width || 0) > MAX_DIM || (height || 0) > MAX_DIM) {
        if ((width || 0) > (height || 0)) {
          height = Math.round(((height || 0) / (width || 1)) * MAX_DIM);
          width = MAX_DIM;
        } else {
          width = Math.round(((width || 0) / (height || 1)) * MAX_DIM);
          height = MAX_DIM;
        }
      }

      let quality = 75;
      let compressed = await image.resize(width, height).jpeg({ quality }).toBuffer();
      while (compressed.length > 100 * 1024 && quality > 20) {
        quality -= 5;
        compressed = await image.resize(width, height).jpeg({ quality }).toBuffer();
      }
      await writeFile(filePath, compressed);
    }

    // Run OCR
    const { text, parsed } = await runOCR(filePath);

    return NextResponse.json({
      success: true,
      data: {
        filename,
        ocrText: text,
        parsed,
      },
    });
  } catch (error) {
    console.error("Upload/OCR error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses gambar: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
