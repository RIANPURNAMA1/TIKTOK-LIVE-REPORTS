"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // User role: only can access /upload
    if (user.role === "user" && pathname !== "/upload") {
      router.replace("/upload");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[#0866FF] mx-auto mb-3" />
          <p className="text-sm text-[#65676b]">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (user.role === "user" && pathname !== "/upload") return null;

  return <>{children}</>;
}
