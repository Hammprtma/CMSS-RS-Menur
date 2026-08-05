"use client";

import React from "react";
import { MaintenanceLog } from "@/app/types/equipment";
import { Pen, Trash2, User, CheckCircle2, Clock } from "lucide-react";

interface MaintenanceLogCardProps {
  log: MaintenanceLog;
  isEditMode: boolean;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
}

export const MaintenanceLogCard: React.FC<MaintenanceLogCardProps> = ({
  log,
  isEditMode,
  onEdit,
  onDelete,
}) => {
  const isPreventif = log.type.toUpperCase() === "PREVENTIF";
  const isSelesai = log.taskStatus.toUpperCase() === "SELESAI";

  const handleEdit = () => {
    if (onEdit) {
      onEdit(log.id);
    } else {
      alert(`Edit riwayat pemeliharaan ID #${log.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(log.id);
    } else {
      alert(`Hapus riwayat pemeliharaan ID #${log.id}`);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-r-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 p-4 border-l-4 ${
        isPreventif ? "border-l-blue-600" : "border-l-red-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left content: Date, Type, Description, Technician & Status */}
        <div className="flex-1 min-w-0">
          {/* Typography: [2026-04-14] PREVENTIF */}
          <div
            className={`text-sm font-bold tracking-tight ${
              isPreventif ? "text-blue-600" : "text-red-600"
            }`}
          >
            [{log.date}] {log.type}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-800 font-medium mt-1.5 leading-relaxed">
            {log.description}
          </p>

          {/* Technician & Task Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Teknisi: {log.technician}</span>
            </div>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isSelesai
                  ? "bg-emerald-100/80 text-emerald-800 border border-emerald-300/60"
                  : "bg-amber-100/80 text-amber-800 border border-amber-300/60"
              }`}
            >
              {isSelesai ? (
                <CheckCircle2 className="w-3 h-3 shrink-0" />
              ) : (
                <Clock className="w-3 h-3 shrink-0" />
              )}
              <span>{log.taskStatus}</span>
            </span>
          </div>
        </div>

        {/* Admin 'Edit Mode' Magic: Pen & Trash buttons on right side of EVERY card */}
        {isEditMode && (
          <div className="flex flex-col gap-1.5 shrink-0 ml-2 pt-0.5 animate-fade-in">
            <button
              type="button"
              onClick={handleEdit}
              title="Edit Riwayat"
              aria-label="Edit Riwayat"
              className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Pen className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Hapus Riwayat"
              aria-label="Hapus Riwayat"
              className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 transition-colors cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
