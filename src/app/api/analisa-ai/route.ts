import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

interface TikTokUserInfo {
  username: string;
  nickname: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  avatar: string;
  videos: number;
}

interface TikTokVideo {
  id: string;
  desc: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  thumbnail: string;
  duration: number;
  createTime: number;
}

interface AnalisaResult {
  user: TikTokUserInfo | null;
  videos: TikTokVideo[];
  aiAnalysis: string;
  scrapeSuccess: boolean;
  error?: string;
}

const COMMON_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.tiktok.com/",
  Origin: "https://www.tiktok.com",
};

async function fetchTikTokAPI(
  username: string
): Promise<{ user: TikTokUserInfo | null; videos: TikTokVideo[] }> {
  const cleanUser = username.replace("@", "");

  const [userRes, postsRes] = await Promise.all([
    fetch(
      `https://www.tiktok.com/api/user/detail/?WebIdLastTime=0&aid=1988&uniqueId=${encodeURIComponent(cleanUser)}`,
      { headers: COMMON_HEADERS }
    ),
    fetch(
      `https://www.tiktok.com/api/post/item_list/?aid=1988&count=15&uniqueId=${encodeURIComponent(cleanUser)}`,
      { headers: COMMON_HEADERS }
    ),
  ]);

  let user: TikTokUserInfo | null = null;
  let videos: TikTokVideo[] = [];

  if (userRes.ok) {
    const userJson = await userRes.json();
    const u = userJson?.userInfo?.user;
    if (u) {
      user = {
        username: u.uniqueId || cleanUser,
        nickname: u.nickname || "",
        bio: u.signature || "",
        followers: u.followerCount || 0,
        following: u.followingCount || 0,
        likes: u.heartCount || 0,
        avatar: u.avatarLarger || u.avatarMedium || u.avatarThumb || "",
        videos: u.videoCount || 0,
      };
    }
  }

  if (postsRes.ok) {
    const postsJson = await postsRes.json();
    const items = postsJson?.itemList || [];
    videos = items.slice(0, 9).map((item: Record<string, unknown>) => {
      const v = (item as { video?: { id?: string; duration?: number; cover?: string; dynamicCover?: string }; stats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number }; desc?: string; createTime?: number; authorStats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number } })?.video || {};
      const stats = (item as { stats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number }; authorStats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number } })?.stats || (item as { authorStats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number } })?.authorStats || {};
      return {
        id: String(v.id || ""),
        desc: String((item as { desc?: string })?.desc || "").slice(0, 150),
        views: stats.playCount || 0,
        likes: stats.diggCount || 0,
        comments: stats.commentCount || 0,
        shares: stats.shareCount || 0,
        thumbnail: v.cover || v.dynamicCover || "",
        duration: v.duration || 0,
        createTime: (item as { createTime?: number })?.createTime || 0,
      };
    });
  }

  return { user, videos };
}

async function analyzeWithGroo(user: TikTokUserInfo | null, videos: TikTokVideo[]): Promise<string> {
  try {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const userInfo = user
      ? `Username: @${user.username}
Nama: ${user.nickname}
Bio: ${user.bio}
Followers: ${(user.followers / 1000).toFixed(1)}K
Following: ${user.following}
Total Likes: ${(user.likes / 1000000).toFixed(1)}M
Total Videos: ${user.videos}`
      : "Data akun tidak dapat diambil langsung.";

    const topVideos = videos.slice(0, 6).map((v, i) => {
      const date = v.createTime ? new Date(v.createTime * 1000).toLocaleDateString("id-ID") : "unknown";
      return `Video ${i + 1}: "${v.desc.slice(0, 80)}..."
Views: ${(v.views / 1000).toFixed(0)}K | Likes: ${(v.likes / 1000).toFixed(0)}K | Comments: ${v.comments} | Shares: ${v.shares}
Date: ${date}`;
    }).join("\n\n");

    const prompt = `Anda adalah analis TikTok AI. Analisis akun TikTok berikut dan berikan insight dalam bahasa Indonesia.

DATA AKUN:
${userInfo}

${videos.length > 0 ? `POSTINGAN TERBARU:\n${topVideos}` : "Tidak ada data video."}

Beri analisis yang mencakup:
1. Profil & personal branding akun ini
2. Performa konten (rata-rata views, like ratio, engagement)
3. Rekomendasi konten / strategi yang bisa dilakukan
4. Insight khusus untuk TikTok LIVE (jika relevan)

Gunakan format yang mudah dibaca dengan paragraf pendek-pendek. Maksimal 300 kata.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Tidak dapat menganalisis.";
  } catch {
    return "AI analysis tidak tersedia saat ini.";
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: "GROQ_API_KEY belum diatur" }, { status: 500 });
    }

    const { url } = await req.json();
    if (!url || !url.includes("tiktok.com/@")) {
      return NextResponse.json({ success: false, error: "URL TikTok tidak valid. Masukkan link seperti https://www.tiktok.com/@username" }, { status: 400 });
    }

    const match = url.match(/tiktok\.com\/@([^/?]+)/);
    const username = match ? match[1] : "";
    if (!username) {
      return NextResponse.json({ success: false, error: "Username tidak ditemukan di URL" }, { status: 400 });
    }

    const { user, videos } = await fetchTikTokAPI(username);

    const aiAnalysis = await analyzeWithGroo(user, videos);

    const result: AnalisaResult = {
      user,
      videos,
      aiAnalysis,
      scrapeSuccess: user !== null,
    };

    if (!user) {
      result.error = "Gagal mengambil data dari API TikTok. Coba periksa username atau coba lagi.";
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menganalisis: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
