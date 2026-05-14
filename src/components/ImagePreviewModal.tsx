"use client";

import { X } from "lucide-react";

interface ImagePreviewModalProps {
  src: string | null;
  open: boolean;
  onClose: () => void;
}

export default function ImagePreviewModal({ src, open, onClose }: ImagePreviewModalProps) {
  if (!open || !src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-800 text-sm">Screenshot TikTok LIVE</p>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Screenshot LIVE" className="w-full h-auto rounded-xl object-contain max-h-[70vh]" />
        </div>
      </div>
    </div>
  );
}
