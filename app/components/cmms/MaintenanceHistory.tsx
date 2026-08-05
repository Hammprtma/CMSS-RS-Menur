"use client";

import React, { useState } from "react";
import { MaintenanceLog } from "@/app/types/equipment";
import { MaintenanceLogCard } from "./MaintenanceLogCard";
import {
  History,
  PlusCircle,
  Filter,
  Download,
  ClipboardX,
} from "lucide-react";

interface MaintenanceHistoryProps {
  logs: MaintenanceLog[];
  isEditMode: boolean;
  onAddLog?: () => void;
  onEditLog?: (id: string | number) => void;
  onDeleteLog?: (id: string | number) => void;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
  logs,
  isEditMode,
  onAddLog,
  onEditLog,
  onDeleteLog,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    "Semua" | "Preventif" | "Korektif"
  >("Semua");

  const filteredLogs = logs.filter((log) => {
    if (activeFilter === "Semua") return true;
    if (activeFilter === "Preventif")
      return log.type.toUpperCase() === "PREVENTIF";
    if (activeFilter === "Korektif")
      return log.type.toUpperCase() === "KOREKTIF";
    return true;
  });

  const handleAddClick = () => {
    if (onAddLog) {
      onAddLog();
    } else {
      alert("Membuka form Tambah Riwayat Pemeliharaan baru...");
    }
  };

  const handleExportClick = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <section className="mt-8 lg:mt-0">
      {/* Section Header with Export Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <History className="w-4 h-4 shrink-0" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 tracking-wider uppercase">
            RIWAYAT PEMELIHARAAN
          </h2>
        </div>

        {/* Right Actions: Export button + Admin badge */}
        <div className="flex items-center gap-2">
          {/* REQUIREMENT 4: Export Button with download/print icon */}
          <button
            type="button"
            onClick={handleExportClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Cetak atau unduh riwayat pemeliharaan"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {isEditMode && (
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wide animate-fade-in">
              Admin Active
            </span>
          )}
        </div>
      </div>

      {/* Filter Chips: Semua, Preventif, Korektif */}
      <div className="flex items-center gap-2 mb-4">
        {(["Semua", "Preventif", "Korektif"] as const).map((chip) => {
          const isActive = activeFilter === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setActiveFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
              }`}
            >
              {isActive && <Filter className="w-3 h-3 shrink-0" />}
              <span>{chip}</span>
            </button>
          );
        })}
      </div>

      {/* Vertical Timeline / Cards List or REQUIREMENT 1: Empty State UI */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-3 relative">
          {filteredLogs.map((log) => (
            <MaintenanceLogCard
              key={log.id}
              log={log}
              isEditMode={isEditMode}
              onEdit={onEditLog}
              onDelete={onDeleteLog}
            />
          ))}
        </div>
      ) : (
        /* REQUIREMENT 1: Empty State UI for Maintenance History */
        <div className="py-12 px-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 max-w-lg mx-auto my-4">
          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-2xs">
            <ClipboardX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Belum ada riwayat pemeliharaan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {activeFilter === "Semua"
              ? "Alat ini belum memiliki catatan riwayat pemeliharaan preventif maupun korektif."
              : `Tidak ada catatan riwayat untuk kategori "${activeFilter}".`}
          </p>
          {activeFilter !== "Semua" && (
            <button
              type="button"
              onClick={() => setActiveFilter("Semua")}
              className="mt-3.5 text-xs text-blue-600 hover:underline font-bold inline-block"
            >
              Tampilkan Semua Riwayat
            </button>
          )}
        </div>
      )}

      {/* Admin Quick Add Log Button in Edit Mode */}
      {isEditMode && (
        <div className="mt-4 animate-fade-in">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Riwayat Pemeliharaan</span>
          </button>
        </div>
      )}
    </section>
  );
};
