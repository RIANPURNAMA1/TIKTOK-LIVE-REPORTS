"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "rose" | "cyan" | "violet" | "amber" | "emerald" | "blue";
  trend?: string;
  trendUp?: boolean;
}

const colorMap = {
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-500",
    text: "text-rose-600",
    trend: "text-rose-500",
  },
  cyan: {
    bg: "bg-cyan-50",
    icon: "bg-cyan-500",
    text: "text-cyan-600",
    trend: "text-cyan-500",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-500",
    text: "text-violet-600",
    trend: "text-violet-500",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-500",
    text: "text-amber-600",
    trend: "text-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-500",
    text: "text-emerald-600",
    trend: "text-emerald-500",
  },
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-500",
    text: "text-blue-600",
    trend: "text-blue-500",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight truncate">{value}</p>
        {trend && (
          <p className={`text-xs font-medium mt-0.5 ${c.trend}`}>
            {trendUp ? "▲" : "▼"} {trend}
          </p>
        )}
      </div>
    </div>
  );
}
