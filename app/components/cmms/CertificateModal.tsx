"use client";

import React, { useState, useRef } from "react";
import { EquipmentDetails } from "@/app/types/equipment";
import {
  Award,
  Download,
  X,
  Upload,
  FileUp,
  FileText,
  ImageIcon,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Shield,
  QrCode,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { compressFileIfImage, UploadPhase } from "@/lib/imageCompression";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentName: string;
  equipmentId: string;
  details: EquipmentDetails;
  certificateUrl?: string | null;
  isEditMode: boolean;
  onUploadSuccess: () => void;
}

const MAX_FILE_SIZE_MB = 10;

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  equipmentName,
  equipmentId,
  details,
  certificateUrl,
  isEditMode,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasCertificate = !!certificateUrl;
  const isPdf =
    hasCertificate &&
    (certificateUrl!.toLowerCase().endsWith(".pdf") ||
      certificateUrl!.toLowerCase().includes(".pdf"));
  const isImage =
    hasCertificate &&
    !isPdf &&
    /\.(jpg|jpeg|png|webp|gif|bmp|svg)/i.test(certificateUrl!);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(
        `Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB. Silakan pilih file yang lebih kecil.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      let fileToSend = selectedFile;
      try {
        fileToSend = await compressFileIfImage(selectedFile, (phase) => {
          setUploadPhase(phase);
        });
      } catch (compErr: any) {
        console.error("Image compression failed:", compErr);
        const msg = compErr?.message || "Gagal mengompresi file gambar";
        setUploadError(msg);
        setIsUploading(false);
        setUploadPhase("idle");
        return;
      }

      // Generate unique file name
      const ext = fileToSend.name.split(".").pop() || "pdf";
      const uniqueName = `${equipmentId}_${Date.now()}.${ext}`;
      const filePath = `${equipmentId}/${uniqueName}`;

      // 1. Upload to Supabase Storage 'certificates' bucket
      const { error: uploadErr } = await supabase.storage
        .from("certificates")
        .upload(filePath, fileToSend, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        console.error("Supabase Storage upload error:", uploadErr);
        setUploadError(`Gagal mengunggah file: ${uploadErr.message}`);
        setIsUploading(false);
        return;
      }

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);

      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        setUploadError("Gagal mendapatkan URL publik untuk file.");
        setIsUploading(false);
        return;
      }

      // 3. Update equipments table with the new certificate_url
      const { error: updateErr } = await supabase
        .from("equipments")
        .update({ certificate_url: publicUrl })
        .eq("id", equipmentId);

      if (updateErr) {
        console.error("Supabase UPDATE error:", updateErr);
        setUploadError(`Gagal menyimpan URL sertifikat: ${updateErr.message}`);
        setIsUploading(false);
        setUploadPhase("idle");
        return;
      }

      // 4. Success — reset state and trigger parent re-fetch
      setSelectedFile(null);
      setIsUploading(false);
      setUploadPhase("idle");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadSuccess();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(`Terjadi kesalahan: ${err.message || "Gagal mengunggah"}`);
      setIsUploading(false);
      setUploadPhase("idle");
    }
  };

  const handleDownloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all my-auto">
        {/* ═══ Modal Header ═══ */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
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
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ Certificate Content Body ═══ */}
        <div className="p-6 sm:p-8 bg-slate-100/60">
          {hasCertificate ? (
            /* ─── VIEW CERTIFICATE: Image or PDF ─── */
            <div className="space-y-4">
              {/* Certificate Info Banner */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    Sertifikat Kalibrasi Tersedia
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    Dokumen resmi telah diunggah dan terverifikasi
                  </p>
                </div>
              </div>

              {/* Certificate Preview Frame */}
              <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm overflow-hidden">
                {isImage ? (
                  /* Image Certificate */
                  <div className="relative">
                    <img
                      src={certificateUrl!}
                      alt={`Sertifikat Kalibrasi - ${equipmentName}`}
                      className="w-full h-auto max-h-[500px] object-contain bg-slate-50"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : isPdf ? (
                  /* PDF Certificate */
                  <div className="flex flex-col">
                    <iframe
                      src={certificateUrl!}
                      title={`Sertifikat Kalibrasi - ${equipmentName}`}
                      className="w-full h-96 border-0"
                    />
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>Dokumen PDF</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadCertificate}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka di Tab Baru</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Fallback: unknown file type — provide download link */
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Dokumen Sertifikat
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Format file tidak dapat dipratinjau langsung di browser.
                    </p>
                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Sertifikat</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Equipment Info Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">
                    Merk / Tipe
                  </p>
                  <p className="font-bold text-slate-900 truncate">
                    {details.merkTipe}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">Ruangan</p>
                  <p className="font-bold text-blue-700">{details.ruangan}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">
                    Tgl. Kalibrasi
                  </p>
                  <p className="font-bold text-slate-900">
                    {details.tglKalibrasi}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-slate-500 font-medium mb-0.5">No. Seri</p>
                  <p className="font-mono font-bold text-slate-900 truncate">
                    {details.noSeri}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ─── EMPTY STATE: No certificate uploaded ─── */
            <div className="py-12 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                Sertifikat Belum Diunggah
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Belum ada dokumen sertifikat kalibrasi yang diunggah untuk alat
                ini. Admin IPS dapat mengunggah sertifikat melalui mode Edit.
              </p>
            </div>
          )}

          {/* ═══ ADMIN UPLOAD SECTION (only in Edit Mode) ═══ */}
          {isEditMode && (
            <div className="mt-5 bg-white rounded-2xl border-2 border-blue-200 p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    Upload Sertifikat Baru
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Format: PDF, JPG, PNG, WebP • Maks {MAX_FILE_SIZE_MB}MB
                  </p>
                </div>
              </div>

              {/* File Input Area */}
              <div
                className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-4 transition-colors cursor-pointer text-center bg-slate-50/50 hover:bg-blue-50/30"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      {selectedFile.type.startsWith("image/") ? (
                        <ImageIcon className="w-4.5 h-4.5" />
                      ) : (
                        <FileText className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •
                        Siap diunggah
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-2">
                    <FileUp className="w-7 h-7 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-600">
                      Klik untuk memilih file, atau seret file ke sini
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Error Message */}
              {uploadError && (
                <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2.5 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Upload Action Button */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {uploadPhase === "compressing"
                        ? "Mengompresi..."
                        : uploadPhase === "uploading"
                        ? "Mengunggah..."
                        : "Mengunggah ke Supabase Storage..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Sertifikat Baru</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ═══ Modal Footer ═══ */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Shield className="w-4 h-4 text-slate-400" />
            <span>
              {hasCertificate
                ? "Dokumen Tersimpan di Supabase Storage"
                : "Sertifikat Belum Tersedia"}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Tutup
            </button>
            {hasCertificate && (
              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Sertifikat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
