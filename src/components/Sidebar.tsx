"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  BrainCircuit,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";
import { useAuth } from "@/lib/auth-context";

const allNavItems = [
  { href: "/", icon: LayoutDashboard, label: "Beranda", adminOnly: true },
  { href: "/upload", icon: Upload, label: "Upload hasil live", adminOnly: false },
  { href: "/reports", icon: FileText, label: "Laporan live", adminOnly: true },
  { href: "/analisa-ai", icon: BrainCircuit, label: "Analisa AI Pro", adminOnly: true },
  { href: "/leads-tiktok", icon: Users, label: "Leads TikTok", adminOnly: true },
  { href: "/pengaturan", icon: Settings, label: "Pengaturan", adminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const { user } = useAuth();
  const navItems = allNavItems.filter((item) => user?.role === "admin" || !item.adminOnly);

  const linkClass = (active: boolean) =>
    `group flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition-all whitespace-nowrap
    ${active ? "bg-[#ebf5ff] text-[#0866FF]" : "text-[#1c1e21] hover:bg-gray-100"}`;

  const iconBoxClass = (active: boolean) =>
    `p-1.5 rounded-md transition-colors flex-shrink-0
    ${active ? "text-[#0866FF]" : "text-[#65676b] group-hover:text-[#1c1e21]"}`;

  return (
    <>
      {/* Mobile Header */}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => onMobileClose?.()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-14 left-0 h-[calc(100vh-56px)] z-40 bg-white border-r border-gray-200
          flex flex-col transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-[280px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onMobileClose?.()}
                className={`${linkClass(active)} ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? label : undefined}
              >
                <div className={iconBoxClass(active)}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[#65676b] hover:bg-gray-100 transition-colors text-sm font-medium"
            title={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          >
            {collapsed ? <PanelLeft size={20} /> : <><PanelLeftClose size={20} /> Perkecil</>}
          </button>
        </div>
      </aside>
    </>
  );
}
