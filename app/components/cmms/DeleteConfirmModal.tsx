"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  logDetails?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  logDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-sm w-full p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button top right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="modal-title"
              className="text-base font-bold text-slate-900 leading-tight"
            >
              Hapus Riwayat?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tindakan ini tidak dapat dibatalkan
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <p className="text-sm text-slate-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus riwayat ini?
        </p>

        {logDetails && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            {logDetails}
          </div>
        )}

        {/* Action Buttons: Batal & Hapus */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all cursor-pointer shadow-2xs"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-red-600/25"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
