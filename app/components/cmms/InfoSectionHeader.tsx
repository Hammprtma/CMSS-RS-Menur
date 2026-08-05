"use client";

import React from "react";
import { Info, Lock, Unlock, Edit2, QrCode } from "lucide-react";

interface InfoSectionHeaderProps {
  isEditMode: boolean;
  onEditEquipment?: () => void;
  onOpenQrModal?: () => void;
}

export const InfoSectionHeader: React.FC<InfoSectionHeaderProps> = ({
  isEditMode,
  onEditEquipment,
  onOpenQrModal,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 mb-4">
      {/* INFORMASI ALAT Header */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
          <Info className="w-4 h-4 shrink-0" />
        </div>
        <h2 className="text-sm font-bold text-blue-600 tracking-wider uppercase">
          INFORMASI ALAT
        </h2>
        {isEditMode && onEditEquipment && (
          <button
            type="button"
            onClick={onEditEquipment}
            className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
            title="Edit Foto & Data Alat"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Data/Foto</span>
          </button>
        )}
        {isEditMode && onOpenQrModal && (
          <button
            type="button"
            onClick={onOpenQrModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Cetak Label QR Code Alat"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cetak Label QR</span>
          </button>
        )}
      </div>


    </div>
  );
};
