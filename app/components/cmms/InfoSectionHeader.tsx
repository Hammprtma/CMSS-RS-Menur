"use client";

import React from "react";
import { Info, Lock, Unlock, Edit2, QrCode } from "lucide-react";

interface InfoSectionHeaderProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onEditEquipment?: () => void;
  onOpenQrModal?: () => void;
}

export const InfoSectionHeader: React.FC<InfoSectionHeaderProps> = ({
  isEditMode,
  onToggleEditMode,
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

      {/* EDIT Toggle Switch */}
      <div className="flex items-center gap-2.5">
        <span
          className={`text-xs font-bold tracking-wide uppercase transition-colors duration-200 ${
            isEditMode ? "text-blue-600" : "text-slate-500"
          }`}
        >
          EDIT
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isEditMode}
          onClick={onToggleEditMode}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEditMode ? "bg-blue-600" : "bg-slate-300"
          }`}
          title="Toggle Admin Edit Mode"
        >
          <span className="sr-only">Toggle Admin Edit Mode</span>
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
              isEditMode ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {isEditMode ? (
              <Unlock className="w-2.5 h-2.5 text-blue-600" />
            ) : (
              <Lock className="w-2.5 h-2.5 text-slate-400" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
