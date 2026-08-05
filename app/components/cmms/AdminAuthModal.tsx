"use client";

import React, { useState, useEffect } from "react";
import { Lock, ShieldCheck, AlertCircle, X } from "lucide-react";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Clear state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setErrorMessage("");
      setPassword("");
      onSuccess();
    } else {
      setErrorMessage("Password salah, silakan coba lagi");
    }
  };

  const handleCancel = () => {
    setPassword("");
    setErrorMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all">
        {/* Top Header with Close Button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Otorisasi Admin IPS
              </h3>
              <p className="text-[11px] text-slate-500">
                Akses khusus staf teknis & admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 pt-2">
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Masukkan password admin untuk mengaktifkan <strong>Mode Edit</strong> dan
            memodifikasi data pemeliharaan alat kesehatan.
          </p>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-password-input"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
            >
              Password Admin <span className="text-slate-400 font-normal">(demo: admin123)</span>
            </label>
            <input
              id="admin-password-input"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="Masukkan password..."
              className={`w-full bg-slate-50 border ${
                errorMessage
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              } rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all`}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-2.5 flex items-center gap-1.5 text-red-600 text-xs font-semibold animate-shake">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
