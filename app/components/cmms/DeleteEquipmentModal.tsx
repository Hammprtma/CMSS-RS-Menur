"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface DeleteEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  equipmentId: string;
  equipmentName: string;
}

export const DeleteEquipmentModal: React.FC<DeleteEquipmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  equipmentId,
  equipmentName,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText !== equipmentId) return;
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-red-200/80 overflow-hidden transform transition-all my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Hapus Alat Medis?
              </h3>
              <p className="text-xs text-red-500 font-semibold">
                Tindakan ini sangat destruktif dan permanen
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Apakah Anda yakin? Tindakan ini permanen dan akan menghapus semua riwayat pemeliharaan alat <strong>{equipmentName}</strong> ini.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Ketik ID Aset untuk melanjutkan: <span className="text-blue-600 select-all">{equipmentId}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Masukkan ID aset..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
              disabled={isDeleting}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting || confirmText !== equipmentId}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xs font-bold shadow-md shadow-red-600/25 disabled:shadow-none transition-all cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menghapus...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Ya, Hapus Permanen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
