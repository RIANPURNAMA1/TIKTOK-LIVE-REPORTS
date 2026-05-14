"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Ya, Keluar",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-sm shadow-2xl w-full max-w-sm">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-[#65676b]">{message}</p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 text-sm font-semibold text-[#65676b] bg-gray-100 hover:bg-gray-200 rounded-sm transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-sm transition-colors">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
