"use client";

import React, { useState } from "react";
import { EquipmentDetails, DriveCertificate } from "@/app/types/equipment";
import {
  Award,
  X,
  FileText,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Shield,
  Loader2,
  Trash2,
  Link as LinkIcon,
  Plus
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentName: string;
  equipmentId: string;
  details: EquipmentDetails;
  certificateUrl?: string | null;
  driveCertificates?: DriveCertificate[];
  isEditMode: boolean;
  onUploadSuccess: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  equipmentName,
  equipmentId,
  details,
  certificateUrl,
  driveCertificates = [],
  isEditMode,
  onUploadSuccess,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasCertificates = driveCertificates.length > 0 || !!certificateUrl;

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const newCert: DriveCertificate = {
      id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTitle.trim(),
      url: newUrl.trim(),
    };

    const updatedCerts = [...driveCertificates, newCert];

    const { error: updateErr } = await supabase
      .from("equipments")
      .update({ drive_certificates: updatedCerts })
      .eq("id", equipmentId);

    setIsSubmitting(false);

    if (updateErr) {
      console.error("Supabase UPDATE error:", updateErr);
      setError(`Gagal menyimpan sertifikat: ${updateErr.message}`);
      return;
    }

    setNewTitle("");
    setNewUrl("");
    onUploadSuccess();
  };

  const handleDeleteCertificate = async (idToDelete: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) return;

    setError(null);
    const updatedCerts = driveCertificates.filter((cert) => cert.id !== idToDelete);

    const { error: updateErr } = await supabase
      .from("equipments")
      .update({ drive_certificates: updatedCerts })
      .eq("id", equipmentId);

    if (updateErr) {
      console.error("Supabase UPDATE error:", updateErr);
      setError(`Gagal menghapus sertifikat: ${updateErr.message}`);
      return;
    }

    onUploadSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all my-auto max-h-[90vh] flex flex-col">
        {/* ═══ Modal Header ═══ */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white leading-tight">
                Sertifikat Kalibrasi — {equipmentName}
              </h3>
              <p className="text-xs text-slate-400">
                Aset ID: {details.noAset} • SN: {details.noSeri}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Sertifikat"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ Certificate Content Body ═══ */}
        <div className="p-6 sm:p-8 bg-slate-100/60 flex-1 overflow-y-auto">
          {hasCertificates ? (
            <div className="space-y-4">
              {/* Certificate Info Banner */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    Sertifikat Kalibrasi Tersedia
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Dokumen resmi tersimpan di Google Drive / Supabase
                  </p>
                </div>
              </div>

              {/* List of Certificates */}
              <div className="space-y-3">
                {/* Legacy Certificate if exists */}
                {certificateUrl && (
                  <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Sertifikat Lama (Legacy)</p>
                        <p className="text-[11px] text-slate-500">Tersimpan di Supabase Storage</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Buka Dokumen</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Drive Certificates */}
                {driveCertificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate" title={cert.title}>{cert.title}</p>
                        <p className="text-[11px] text-slate-500">Google Drive Link</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Buka Dokumen</span>
                      </a>
                      
                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteCertificate(cert.id)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Hapus Sertifikat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Equipment Info Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-6">
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">Merk / Tipe</p>
                  <p className="font-bold text-slate-900 truncate">{details.merkTipe}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">Ruangan</p>
                  <p className="font-bold text-blue-700">{details.ruangan}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">Tgl. Kalibrasi</p>
                  <p className="font-bold text-slate-900">{details.tglKalibrasi}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">No. Seri</p>
                  <p className="font-mono font-bold text-slate-900 truncate">{details.noSeri}</p>
                </div>
              </div>
            </div>
          ) : (
            /* ─── EMPTY STATE: No certificate ─── */
            <div className="py-12 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Belum ada sertifikat yang ditambahkan.
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Anda dapat menambahkan link sertifikat kalibrasi dari Google Drive melalui mode Edit.
              </p>
            </div>
          )}

          {/* ═══ ADMIN UPLOAD SECTION (only in Edit Mode) ═══ */}
          {isEditMode && (
            <div className="mt-8 bg-white rounded-2xl border-2 border-blue-200 p-5 shadow-sm animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    Tambah Sertifikat (Google Drive)
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Masukkan nama sertifikat dan link Google Drive
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Sertifikat
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Sertifikat Kalibrasi 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Link Google Drive
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm text-slate-800 outline-none transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newUrl.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Tambahkan Sertifikat</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ═══ Modal Footer ═══ */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>
              {hasCertificates
                ? "Tersimpan via Link Google Drive"
                : "Sertifikat Belum Tersedia"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
