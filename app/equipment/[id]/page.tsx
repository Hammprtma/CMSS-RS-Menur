"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Equipment, MaintenanceLog } from "@/app/types/equipment";
import { EquipmentHeader } from "@/app/components/cmms/EquipmentHeader";
import { InfoSectionHeader } from "@/app/components/cmms/InfoSectionHeader";
import { EquipmentDetailsGrid } from "@/app/components/cmms/EquipmentDetailsGrid";
import { MaintenanceHistory } from "@/app/components/cmms/MaintenanceHistory";
import { DeleteConfirmModal } from "@/app/components/cmms/DeleteConfirmModal";
import { AdminAuthModal } from "@/app/components/cmms/AdminAuthModal";
import { CertificateModal } from "@/app/components/cmms/CertificateModal";
import { EditEquipmentModal } from "@/app/components/cmms/EditEquipmentModal";
import { QRCodeModal } from "@/app/components/cmms/QRCodeModal";
import {
  MaintenanceLogFormModal,
  LogFormData,
} from "@/app/components/cmms/MaintenanceLogFormModal";
import {
  ToastNotification,
  Toast,
} from "@/app/components/cmms/ToastNotification";
import { ChevronLeft, RefreshCw, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EquipmentDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "";
  const equipmentId = decodeURIComponent(rawId);

  // ─── Core Data State ───────────────────────────────────────
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  // ─── Admin Edit Mode ───────────────────────────────────────
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // ─── Certificate & QR Code Modal ──────────────────────────
  const [isCertificateModalOpen, setIsCertificateModalOpen] =
    useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // ─── Delete Confirmation State ────────────────────────────
  const [logToDelete, setLogToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // ─── Create / Edit Form Modal State ───────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isEditEquipmentModalOpen, setIsEditEquipmentModalOpen] =
    useState<boolean>(false);
  const [logToEdit, setLogToEdit] = useState<MaintenanceLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ─── Toast Notifications ──────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Fetch Equipment + Logs from Supabase ─────────────────
  const fetchEquipmentData = useCallback(async () => {
    if (!equipmentId) return;
    setIsLoading(true);
    setNotFound(false);

    const { data: eqData, error: eqError } = await supabase
      .from("equipments")
      .select("*")
      .eq("id", equipmentId)
      .single();

    if (eqError || !eqData) {
      console.warn("Equipment not found in Supabase:", eqError);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const { data: logsData, error: logsError } = await supabase
      .from("maintenance_logs")
      .select("*")
      .eq("equipment_id", equipmentId)
      .order("date", { ascending: false });

    if (logsError) {
      console.error(
        "Error fetching maintenance logs from Supabase:",
        logsError
      );
    }

    const mappedLogs: MaintenanceLog[] = (logsData || []).map((log: any) => ({
      id: log.id || "",
      date: log.date || "-",
      type: log.type || "PREVENTIF",
      description: log.description || "-",
      technician: log.technician || "-",
      taskStatus: log.task_status || log.taskStatus || "BELUM SELESAI",
    }));

    const mappedEquipment: Equipment = {
      id: eqData.id || equipmentId,
      name: eqData.name || "Alat Kesehatan",
      status: eqData.status || "Baik",
      imageUrl: eqData.image_url || eqData.imageUrl || "/placeholder-cpap.jpg",
      certificateUrl: eqData.certificate_url || null,
      drive_certificates: eqData.drive_certificates || [],
      details: {
        merkTipe: eqData.brand_type || eqData.brandType || "-",
        noSeri: eqData.serial_number || eqData.serialNumber || "-",
        noAset: eqData.id || equipmentId,
        ruangan: eqData.room || "-",
        tglKalibrasi:
          eqData.calibration_date || eqData.calibrationDate || "-",
      },
      maintenanceLogs: mappedLogs,
    };

    setEquipment(mappedEquipment);
    setIsLoading(false);
  }, [equipmentId]);

  useEffect(() => {
    fetchEquipmentData();
  }, [fetchEquipmentData]);

  // ─── Restore persistent Admin Session from localStorage ───
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAdmin = localStorage.getItem("isAdmin");
      if (savedAdmin === "true") {
        setIsEditMode(true);
      }
    }
  }, []);

  // ─── Auth Toggle ──────────────────────────────────────────
  const toggleEditMode = () => {
    if (isEditMode) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("isAdmin");
      }
      setIsEditMode(false);
      addToast("Keluar dari mode admin", "success");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isAdmin", "true");
    }
    setIsAuthModalOpen(false);
    setIsEditMode(true);
    addToast("Mode Admin IPS diaktifkan! 🔓", "success");
  };

  // ═══════════════════════════════════════════════════════════
  //  CRUD: CREATE — Open blank form modal
  // ═══════════════════════════════════════════════════════════
  const handleAddLog = () => {
    setLogToEdit(null); // null = create mode
    setIsFormModalOpen(true);
  };

  // ═══════════════════════════════════════════════════════════
  //  CRUD: UPDATE — Open pre-filled form modal
  // ═══════════════════════════════════════════════════════════
  const handleEditLog = (logId: string | number) => {
    if (!equipment) return;
    const found = equipment.maintenanceLogs.find((l) => l.id === logId);
    if (!found) return;
    setLogToEdit(found);
    setIsFormModalOpen(true);
  };

  // ═══════════════════════════════════════════════════════════
  //  CRUD: FORM SUBMIT — INSERT or UPDATE via Supabase
  // ═══════════════════════════════════════════════════════════
  const handleFormSubmit = async (formData: LogFormData) => {
    setIsSubmitting(true);

    if (logToEdit) {
      // ── UPDATE existing log ──
      const { error } = await supabase
        .from("maintenance_logs")
        .update({
          date: formData.date,
          type: formData.type,
          description: formData.description,
          technician: formData.technician,
          task_status: formData.taskStatus,
        })
        .eq("id", logToEdit.id);

      setIsSubmitting(false);

      if (error) {
        console.error("Supabase UPDATE error:", error);
        addToast(
          `Gagal memperbarui riwayat: ${error.message}`,
          "error"
        );
        return;
      }

      addToast("Riwayat pemeliharaan berhasil diperbarui ✏️", "success");
    } else {
      // ── INSERT new log ──
      const { error } = await supabase.from("maintenance_logs").insert({
        equipment_id: equipmentId,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        technician: formData.technician,
        task_status: formData.taskStatus,
      });

      setIsSubmitting(false);

      if (error) {
        console.error("Supabase INSERT error:", error);
        addToast(
          `Gagal menambah riwayat: ${error.message}`,
          "error"
        );
        return;
      }

      addToast("Riwayat pemeliharaan berhasil ditambahkan ✅", "success");
    }

    setIsFormModalOpen(false);
    setLogToEdit(null);
    // Re-fetch live data from Supabase to refresh the timeline
    await fetchEquipmentData();
  };

  // ═══════════════════════════════════════════════════════════
  //  CRUD: DELETE — Show confirmation then execute via Supabase
  // ═══════════════════════════════════════════════════════════
  const handleRequestDeleteLog = (logId: string | number) => {
    setLogToDelete(logId);
  };

  const handleConfirmDelete = async () => {
    if (logToDelete === null) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from("maintenance_logs")
      .delete()
      .eq("id", logToDelete);

    setIsDeleting(false);

    if (error) {
      console.error("Supabase DELETE error:", error);
      addToast(`Gagal menghapus riwayat: ${error.message}`, "error");
      setLogToDelete(null);
      return;
    }

    addToast("Riwayat pemeliharaan berhasil dihapus 🗑️", "success");
    setLogToDelete(null);
    // Re-fetch live data from Supabase
    await fetchEquipmentData();
  };

  const selectedLogForModal = equipment?.maintenanceLogs.find(
    (l) => l.id === logToDelete
  );

  // ─── Loading Spinner State ────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100/90 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-12 text-center max-w-md w-full">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-base font-extrabold text-slate-800">
            Memuat Data Alat Medis...
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            ID Aset: {equipmentId}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Mengambil data secara langsung dari database Supabase
          </p>
        </div>
      </div>
    );
  }

  // ─── 404 - Not Found State ────────────────────────────────
  if (notFound || !equipment) {
    return (
      <div className="min-h-screen bg-slate-100/90 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">
            404 - Data Alat Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Alat dengan ID{" "}
            <strong className="font-mono text-slate-700">
              {equipmentId}
            </strong>{" "}
            tidak ada dalam database Supabase atau telah dihapus.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Pemindai QR</span>
          </Link>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100/90 pb-12">
      {/* Sticky Top Bar Navigation */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 mb-6 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Kembali</span>
            </Link>

            {/* Official Logos */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <img
                src="/logo-jatim.png"
                alt="Logo Jawa Timur"
                className="h-8 w-auto object-contain drop-shadow-2xs"
              />
              <img
                src="/logo-rsud-medika.png"
                alt="Logo RS Menur"
                className="h-7 w-auto object-contain drop-shadow-2xs"
              />
              <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase ml-1">
                RS MENUR
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
              ID: {equipment.id}
            </span>
            <button
              onClick={fetchEquipmentData}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Main content wrapped in responsive grid container */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* LEFT COLUMN (lg:col-span-5) - Sticky on Desktop */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 self-start w-full mb-6 lg:mb-0">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden pb-6">
            <EquipmentHeader
              name={equipment.name}
              status={equipment.status}
              imageUrl={equipment.imageUrl}
              isEditMode={isEditMode}
              onEditEquipment={() => setIsEditEquipmentModalOpen(true)}
              onOpenQrModal={() => setIsQrModalOpen(true)}
            />

            <div className="px-5 pt-6">
              <InfoSectionHeader
                isEditMode={isEditMode}
                onToggleEditMode={toggleEditMode}
                onEditEquipment={() => setIsEditEquipmentModalOpen(true)}
                onOpenQrModal={() => setIsQrModalOpen(true)}
              />

              <EquipmentDetailsGrid
                details={equipment.details}
                equipmentName={equipment.name}
                onOpenCertificate={() => setIsCertificateModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-7) - Maintenance Timeline & Filter Chips */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-8">
            <MaintenanceHistory
              logs={equipment.maintenanceLogs}
              isEditMode={isEditMode}
              onAddLog={handleAddLog}
              onEditLog={handleEditLog}
              onDeleteLog={handleRequestDeleteLog}
            />
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200/80 text-center px-4">
        <p className="text-xs text-slate-400 font-medium">
          Aset ID:{" "}
          <span className="font-mono text-slate-600">{equipment.id}</span> •
          Terhubung dengan Supabase RS MENUR
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Pemindai QR
          </Link>
        </div>
      </footer>

      {/* ═══ ROOT-LEVEL MODALS (outside grid columns for correct z-stacking) ═══ */}

      {/* Create / Edit Form Modal */}
      <MaintenanceLogFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setLogToEdit(null);
        }}
        onSubmit={handleFormSubmit}
        existingLog={logToEdit}
        isSubmitting={isSubmitting}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        equipmentName={equipment.name}
        equipmentId={equipment.id}
        details={equipment.details}
        certificateUrl={equipment.certificateUrl}
        driveCertificates={equipment.drive_certificates}
        isEditMode={isEditMode}
        onUploadSuccess={async () => {
          addToast("Sertifikat berhasil diperbarui ✅", "success");
          await fetchEquipmentData();
        }}
      />

      {/* Admin Auth Modal (Password Verification) */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Edit Equipment Photo & Data Modal */}
      <EditEquipmentModal
        isOpen={isEditEquipmentModalOpen}
        onClose={() => setIsEditEquipmentModalOpen(false)}
        onSuccess={fetchEquipmentData}
        equipment={equipment}
        addToast={addToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={logToDelete !== null}
        onClose={() => setLogToDelete(null)}
        onConfirm={handleConfirmDelete}
        logDetails={
          selectedLogForModal
            ? `[${selectedLogForModal.date}] ${selectedLogForModal.type} - ${selectedLogForModal.description}`
            : undefined
        }
      />

      {/* QR Code Printable Label Sticker Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        equipmentId={equipment.id}
        equipmentName={equipment.name}
        room={equipment.details?.ruangan}
      />

      {/* Toast Notifications (bottom-right corner) */}
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
