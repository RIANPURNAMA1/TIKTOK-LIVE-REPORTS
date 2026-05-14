import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/lib/sidebar-context";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "TikTok Live Reporter",
  description: "Sistem pencatatan dan laporan hasil siaran TikTok LIVE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 antialiased">
        <AuthProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
