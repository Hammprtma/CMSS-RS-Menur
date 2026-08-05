"use client";

import React from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, ShieldPlus, Cpu, Camera, QrCode } from "lucide-react";

interface EquipmentHeaderProps {
  name: string;
  status: "Rusak" | "Baik" | string;
  imageUrl: string;
  isEditMode?: boolean;
  onEditEquipment?: () => void;
  onOpenQrModal?: () => void;
}

export const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
  name,
  status,
  imageUrl,
  isEditMode,
  onEditEquipment,
  onOpenQrModal,
}) => {
  const isRusak = status.toLowerCase() === "rusak";

  return (
    <header className="flex flex-col items-center pt-4 pb-6 border-b border-slate-200/70 bg-gradient-to-b from-white to-slate-50/50 px-4">
      {/* Top Left & Right Logos */}
      <div className="w-full flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 overflow-hidden">
            <img
              src="/logo-rsud-medika.png"
              alt="RSUD Medika Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <ShieldPlus className="w-4 h-4 absolute pointer-events-none" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
            RS MENUR
          </span>
        </div>

        <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
            IPS RS
          </span>
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden">
            <img
              src="/logo-jatim.jpg"
              alt="Jatim Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Cpu className="w-4 h-4 absolute pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Center Equipment Image */}
      <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl bg-white border-2 border-slate-200/80 shadow-lg shadow-slate-200/60 p-3 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105 group">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 pointer-events-none" />
      </div>

      {/* Equipment Name H1 */}
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight text-center mt-5">
        {name}
      </h1>

      {/* Prominent Status Badge */}
      <div className="mt-2.5">
        <span
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 ${
            isRusak
              ? "bg-red-600 text-white shadow-red-600/30 ring-2 ring-red-400/40"
              : "bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/40"
          }`}
        >
          {isRusak ? (
            <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>Status: {status}</span>
        </span>
      </div>

      {/* ADMIN EDIT BUTTONS: Visible only in Edit Mode */}
      {isEditMode && (
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2.5">
          {onEditEquipment && (
            <button
              type="button"
              onClick={onEditEquipment}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer animate-fade-in"
            >
              <Camera className="w-4 h-4" />
              <span>Edit Foto & Data Alat</span>
            </button>
          )}
          {onOpenQrModal && (
            <button
              type="button"
              onClick={onOpenQrModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer animate-fade-in"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Cetak Label QR</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
