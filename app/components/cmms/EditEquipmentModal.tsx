"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Calendar,
  MapPin,
  Tag,
  Hash,
  Activity,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Equipment } from "@/app/types/equipment";
import { compressFileIfImage, UploadPhase } from "@/lib/imageCompression";
import { RS_MENUR_ROOMS } from "@/app/lib/constants";
import { CustomDropdown } from "@/app/components/cmms/CustomDropdown";

interface EditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment: Equipment | null;
  addToast: (message: string, type: "success" | "error") => void;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  equipment,
  addToast,
}) => {
  const [name, setName] = useState("");
  const [brandType, setBrandType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [room, setRoom] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [calibrationDate, setCalibrationDate] = useState("");
  const [status, setStatus] = useState<"Baik" | "Rusak" | "Kalibrasi">("Baik");
  const [imageUrl, setImageUrl] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen && equipment) {
      setName(equipment.name || "");
      setBrandType(equipment.details?.merkTipe || "");
      setSerialNumber(equipment.details?.noSeri || "");
      
      let initialRoom = equipment.details?.ruangan || "";
      let initialFloor = "";
      if (initialRoom.includes(" Lantai ")) {
        const parts = initialRoom.split(" Lantai ");
        initialRoom = parts[0];
        initialFloor = parts[1];
      }
      setRoom(initialRoom);
      setFloorNumber(initialFloor);

      setCalibrationDate(equipment.details?.tglKalibrasi || new Date().toISOString().split("T")[0]);
      setStatus(
        (equipment.status as "Baik" | "Rusak" | "Kalibrasi") || "Baik"
      );
      setImageUrl(equipment.imageUrl || "");
      setFileToUpload(null);
      setPreviewUrl(equipment.imageUrl || "");
      setErrorMessage("");
      setUploadPhase("idle");
      setIsSubmitting(false);
    }
  }, [isOpen, equipment]);

  if (!isOpen || !equipment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !brandType.trim() || !serialNumber.trim() || !room.trim()) {
      setErrorMessage("Harap lengkapi semua bidang yang wajib diisi (*)");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalImageUrl = imageUrl.trim() || equipment.imageUrl || "/placeholder-cpap.jpg";

      // If user uploaded a new file, compress and upload to Supabase Storage 'equipment-images' bucket
      if (fileToUpload) {
        let fileToSend = fileToUpload;
        try {
          fileToSend = await compressFileIfImage(fileToUpload, (phase) => {
            setUploadPhase(phase);
          });
        } catch (compErr: any) {
          console.error("Image compression failed:", compErr);
          const msg = compErr?.message || "Gagal mengompresi gambar file";
          setErrorMessage(msg);
          addToast(msg, "error");
          setIsSubmitting(false);
          setUploadPhase("idle");
          return;
        }

        const fileExt = fileToSend.name.split(".").pop() || "jpg";
        const cleanName = fileToSend.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${equipment.id.toUpperCase()}_${Date.now()}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from("equipment-images")
          .upload(fileName, fileToSend, {
            cacheControl: "3600",
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("equipment-images")
            .getPublicUrl(fileName);
          if (publicUrlData?.publicUrl) {
            finalImageUrl = publicUrlData.publicUrl;
          }
        } else {
          console.error("Storage upload error:", uploadError);
        }
      }

      // Execute Supabase UPDATE query into 'equipments' table
      const finalRoom = floorNumber.trim() ? `${room} Lantai ${floorNumber.trim()}` : room;

      const { error: updateError } = await supabase
        .from("equipments")
        .update({
          name: name.trim(),
          brand_type: brandType.trim(),
          serial_number: serialNumber.trim(),
          room: finalRoom.trim(),
          calibration_date: calibrationDate,
          status: status,
          image_url: finalImageUrl,
        })
        .eq("id", equipment.id);

      if (updateError) {
        console.error("Supabase UPDATE error:", updateError);
        setErrorMessage(`Gagal memperbarui alat: ${updateError.message}`);
        setIsSubmitting(false);
        return;
      }

      addToast("Data & Foto Alat berhasil diperbarui! ✏️", "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error updating equipment:", err);
      setErrorMessage(`Terjadi kesalahan: ${err.message || "Gagal memperbarui data"}`);
      setIsSubmitting(false);
      setUploadPhase("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all my-8">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Edit Foto & Data Alat
              </h3>
              <p className="text-xs text-slate-500">
                Memperbarui detail atau foto aset ({equipment.id}) di Supabase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Error Message Display */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ID Aset / Unique ID (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>ID ASET (TIDAK DAPAT DIUBAH)</span>
            </label>
            <input
              type="text"
              disabled
              value={equipment.id}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Nama Alat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>NAMA ALAT *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Infusion Pump"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Merk / Tipe */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                MERK / TIPE *
              </label>
              <input
                type="text"
                required
                value={brandType}
                onChange={(e) => setBrandType(e.target.value)}
                placeholder="e.g. Terumo TE-171"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Nomor Seri */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NOMOR SERI *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. TRM-99210-ID"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ruangan & Lantai */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>RUANGAN & LANTAI *</span>
              </label>
              <div className="flex gap-2 h-10">
                <div className="flex-[2] min-w-0">
                  <CustomDropdown
                    options={RS_MENUR_ROOMS.map((r) => ({ value: r, label: r }))}
                    value={room}
                    onChange={(val) => setRoom(val)}
                    placeholder="Pilih Ruangan..."
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0 shrink-0">
                  <input
                    type="text"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(e.target.value)}
                    placeholder="Lantai (Opsional, e.g. 1)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all h-full"
                  />
                </div>
              </div>
            </div>

            {/* Tanggal Kalibrasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>TANGGAL KALIBRASI *</span>
              </label>
              <input
                type="date"
                required
                value={calibrationDate}
                onChange={(e) => setCalibrationDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Status Alat Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>STATUS ALAT *</span>
            </label>
            <CustomDropdown
              options={[
                { value: "Baik", label: "Baik (Siap Operasional)" },
                { value: "Rusak", label: "Rusak (Perlu Perbaikan)" },
                { value: "Kalibrasi", label: "Kalibrasi (Jadwal Pemeliharaan)" },
              ]}
              value={status}
              onChange={(val) => setStatus(val as "Baik" | "Rusak" | "Kalibrasi")}
              className="w-full"
            />
          </div>

          {/* Foto Alat Input (Upload with Preview Thumbnail or URL) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>FOTO ALAT (FILE UPLOAD ATAU URL GAMBAR)</span>
            </label>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>{fileToUpload ? "Ganti Foto Baru..." : "Pilih / Ambil Foto Baru..."}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {fileToUpload && (
                  <span className="text-xs text-slate-600 font-semibold truncate max-w-[180px]">
                    {fileToUpload.name}
                  </span>
                )}
              </div>

              {/* Image Preview Thumbnail */}
              {previewUrl && (
                <div className="mt-2 relative w-28 h-28 rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {fileToUpload && (
                    <button
                      type="button"
                      onClick={() => {
                        setFileToUpload(null);
                        setPreviewUrl(equipment.imageUrl || "");
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-md transition-colors cursor-pointer"
                      title="Batalkan foto baru"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (!fileToUpload) setPreviewUrl(e.target.value);
                }}
                placeholder="ATAU tempel URL Gambar (e.g. /placeholder-cpap.jpg)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Jika tidak memilih file baru, foto saat ini tetap dipertahankan.
            </p>
          </div>

          {/* Modal Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {uploadPhase === "compressing"
                      ? "Mengompresi..."
                      : uploadPhase === "uploading"
                      ? "Mengunggah..."
                      : "Memperbarui Supabase..."}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
