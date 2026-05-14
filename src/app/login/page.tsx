"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !success) {
      router.replace(user.role === "user" ? "/upload" : "/");
    }
  }, [user, router, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const err = await login(username, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/"), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0866FF] mb-4">
            <TrendingUp size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1c1e21]">TikTok Reporter</h1>
          <p className="text-sm text-[#65676b] mt-1">Masuk ke akun Anda</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#65676b] uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm text-[#1c1e21] placeholder-[#65676b] outline-none focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-[#65676b] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-sm text-sm text-[#1c1e21] placeholder-[#65676b] outline-none focus:bg-white focus:border-[#0866FF] focus:ring-1 focus:ring-blue-100 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676b] hover:text-[#1c1e21]"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-sm text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle size={16} />
              Login berhasil! Mengarahkan ke dashboard...
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-sm text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0866FF] hover:bg-[#0759df] disabled:bg-gray-300 text-white font-bold rounded-sm transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-xs text-[#65676b] text-center mt-6">
          TikTok Live Reporter System &copy; 2026
        </p>
      </div>
    </div>
  );
}
