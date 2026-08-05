"use client";

import React, { useState, useEffect } from "react";
import { MaintenanceLog } from "@/app/types/equipment";
import { X, Save, PlusCircle, Pen } from "lucide-react";

export interface LogFormData {
  date: string;
  type: string;
  description: string;
  technician: string;
  taskStatus: string;
}

interface MaintenanceLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LogFormData) => void;
  /** If provided, the form pre-fills for editing; otherwise it's a create form */
  existingLog?: MaintenanceLog | null;
  isSubmitting?: boolean;
}

export const MaintenanceLogFormModal: React.FC<MaintenanceLogFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingLog,
  isSubmitting = false,
}) => {
  const isEditMode = !!existingLog;

  const [date, setDate] = useState<string>("");
  const [type, setType] = useState<string>("PREVENTIF");
  const [description, setDescription] = useState<string>("");
  const [technician, setTechnician] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("SELESAI");

  // Pre-fill form fields when editing an existing log
  useEffect(() => {
    if (existingLog) {
      setDate(existingLog.date || "");
      setType(existingLog.type || "PREVENTIF");
      setDescription(existingLog.description || "");
      setTechnician(existingLog.technician || "");
      setTaskStatus(existingLog.taskStatus || "SELESAI");
    } else {
      // Reset to defaults for a new creation
      setDate(new Date().toISOString().split("T")[0]);
      setType("PREVENTIF");
      setDescription("");
      setTechnician("");
      setTaskStatus("SELESAI");
    }
  }, [existingLog, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description.trim() || !technician.trim()) return;
    onSubmit({ date, type, description: description.trim(), technician: technician.trim(), taskStatus });
  };

  if (!isOpen) return null;

  const isValid = date && description.trim() && technician.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isEditMode
                  ? "bg-amber-500/20 border border-amber-400/40 text-amber-400"
                  : "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
              }`}
            >
              {isEditMode ? <Pen className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                {isEditMode ? "Edit Riwayat Pemeliharaan" : "Tambah Riwayat Pemeliharaan"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? "Perbarui data riwayat yang sudah ada"
                  : "Isi form di bawah untuk menambah catatan baru"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup Form"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Tanggal + Tipe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label
                htmlFor="log-date"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            {/* Tipe */}
            <div>
              <label
                htmlFor="log-type"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Tipe Pemeliharaan <span className="text-red-500">*</span>
              </label>
              <select
                id="log-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50 cursor-pointer appearance-none"
              >
                <option value="PREVENTIF">PREVENTIF</option>
                <option value="KOREKTIF">KOREKTIF</option>
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label
              htmlFor="log-description"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Deskripsi Pekerjaan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="log-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Penggantian filter O2, pengecekan sensor suhu..."
              rows={3}
              required
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Row 2: Teknisi + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Teknisi */}
            <div>
              <label
                htmlFor="log-technician"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Nama Teknisi <span className="text-red-500">*</span>
              </label>
              <input
                id="log-technician"
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="Contoh: Fuad, Azizun"
                required
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
              />
            </div>

            {/* Status Pekerjaan */}
            <div>
              <label
                htmlFor="log-status"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Status Pekerjaan <span className="text-red-500">*</span>
              </label>
              <select
                id="log-status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50 cursor-pointer appearance-none"
              >
                <option value="SELESAI">SELESAI</option>
                <option value="BELUM SELESAI">BELUM SELESAI</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? "Perbarui" : "Simpan"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
