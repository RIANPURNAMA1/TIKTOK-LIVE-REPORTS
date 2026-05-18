"use client";

import { TrendingUp, Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-300 mb-4 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Left: Menu + Brand */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Menu size={22} className="text-[#1c1e21]" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#0866FF] flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-bold text-[#1c1e21] text-sm sm:text-lg tracking-tight">TikTok <span className="max-[400px]:hidden">Reports</span> <span className="text-[#0866FF] italic max-[400px]:hidden">Mendunia</span></span>
        </div>
        
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {user && (
          <>
            <span className="hidden sm:block text-xs text-[#65676b] font-medium">
              {user.nama} <span className="text-[10px] uppercase">({user.role})</span>
            </span>
            <button className="hidden sm:flex items-center justify-center w-9 h-9 bg-[#e4e6eb] hover:bg-[#d8dadf] rounded-full transition-colors">
              <Bell size={18} className="text-[#1c1e21]" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                {user.nama.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => { if (confirm("Yakin ingin keluar?")) logout(); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" title="Keluar">
                <LogOut size={16} className="text-[#65676b]" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
