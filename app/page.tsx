"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Search,
  ShieldPlus,
  Cpu,
  ScanLine,
  ChevronRight,
  Filter,
  Layers,
  Calendar,
  LogIn,
  SearchX,
  PlusCircle,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminAuthModal } from "@/app/components/cmms/AdminAuthModal";
import { AddEquipmentFormModal } from "@/app/components/cmms/AddEquipmentFormModal";
import { QRScannerModal } from "@/app/components/cmms/QRScannerModal";
import {
  ToastNotification,
  Toast,
} from "@/app/components/cmms/ToastNotification";

interface EquipmentCardItem {
  id: string;
  name: string;
  room: string;
  serialNumber: string;
  status: "Baik" | "Rusak" | "Kalibrasi" | string;
  tglKalibrasi: string;
  imageUrl: string;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Semua" | "Baik" | "Rusak" | "Kalibrasi"
  >("Semua");

  const [equipmentList, setEquipmentList] = useState<EquipmentCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Admin Edit Mode & Add Equipment Modal State ─────────
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // ─── Toast Notifications ─────────────────────────────────
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

  // Fetch live equipment list from Supabase
  const fetchEquipments = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.error("Error fetching equipments from Supabase:", error);
    } else if (data) {
      const mapped: EquipmentCardItem[] = data.map((item: any) => ({
        id: item.id || "",
        name: item.name || "Alat Kesehatan",
        room: item.room || "Ruangan",
        serialNumber: item.serial_number || item.serialNumber || "-",
        status: item.status || "Baik",
        tglKalibrasi: item.calibration_date || item.tglKalibrasi || "-",
        imageUrl: item.image_url || item.imageUrl || "/placeholder-cpap.jpg",
      }));
      setEquipmentList(mapped);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  // Restore persistent Admin Session from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAdmin = localStorage.getItem("isAdmin");
      if (savedAdmin === "true") {
        setIsEditMode(true);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim() || "CPAP-3";
    router.push(`/equipment/${encodeURIComponent(query.toUpperCase())}`);
  };

  const handleCameraPlaceholderClick = () => {
    setIsScannerModalOpen(true);
  };

  // Filter live equipment cards by status and search text
  const filteredEquipment = equipmentList.filter((item) => {
    const matchesStatus =
      statusFilter === "Semua" ? true : item.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === ""
        ? true
        : item.id.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.room.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeStyles = (status: "Baik" | "Rusak" | "Kalibrasi" | string) => {
    switch (status) {
      case "Baik":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rusak":
        return "bg-red-100 text-red-700 border-red-200";
      case "Kalibrasi":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 py-8 px-4 sm:px-6 lg:px-8">
      {/* GLOBAL LAYOUT: max-w-7xl mx-auto */}
      <div className="max-w-7xl mx-auto">
        {/* Top Header with Both Logos & Login IPS Button */}
        <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto px-2">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <img
              src="/logo-jatim.png"
              alt="Logo Pemprov Jawa Timur"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-2xs"
            />
            <img
              src="/logo-rsud-medika.png"
              alt="Logo RS Menur"
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-2xs"
            />
            <div className="flex flex-col border-l border-slate-300 pl-3">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase leading-tight">
                RS MENUR
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-blue-600 tracking-wider uppercase">
                IPS RS • CMMS
              </span>
            </div>
          </div>

          {/* Admin Mode Toggle / Login IPS Button */}
          {!isEditMode ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold shadow-2xs hover:shadow-sm transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span>Login IPS</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Admin IPS (Aktif)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("isAdmin");
                  }
                  setIsEditMode(false);
                  addToast("Keluar dari mode admin", "success");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/80 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Keluar Mode Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>

        {/* Hero Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sistem Inventaris & Pemeliharaan Alat Medis
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Arahkan pemindai ke barcode alat untuk melihat riwayat atau cari ID aset secara manual.
          </p>
        </div>

        {/* Main Search Area & Camera Scanner Placeholder */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-6 mb-8">
          {/* Camera Viewfinder Placeholder */}
          <div
            onClick={handleCameraPlaceholderClick}
            className="group relative overflow-hidden bg-slate-900 rounded-2xl p-5 mb-5 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all cursor-pointer text-center"
          >
            <div className="absolute inset-0 bg-linear-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex flex-col items-center justify-center py-2">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                Arahkan kamera ke Barcode alat
              </span>
              <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <ScanLine className="w-3 h-3 text-blue-400" />
                Klik untuk mengaktifkan pemindai kamera live
              </span>
            </div>
          </div>

          {/* Search Bar Input */}
          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan ID Aset atau No. Seri (e.g., CPAP-3)"
              className="w-full pl-11 pr-24 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cari Alat
            </button>
          </form>

          {/* Filter by Status Pills/Chips */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter Status:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(
                ["Semua", "Baik", "Rusak", "Kalibrasi"] as const
              ).map((chip) => {
                const isActive = statusFilter === chip;
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setStatusFilter(chip)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Title for Equipment Grid & Admin Action Button */}
        <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Daftar Alat Kesehatan ({filteredEquipment.length})
            </h2>
          </div>

          {/* ADMIN ACTION BUTTON: Visible only when isEditMode is true */}
          {isEditMode && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer animate-fade-in"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Alat Baru</span>
            </button>
          )}
        </div>

        {/* 4. Responsive Grid of Clickable Equipment Cards, Loading State, or Empty State UI */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-semibold text-slate-700">
              Memuat Data Alat Medis...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mengambil data secara langsung dari database Supabase
            </p>
          </div>
        ) : filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredEquipment.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="block group h-full"
              >
                <div className="h-full bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-blue-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all duration-150 flex items-center justify-between cursor-pointer">
                  <div className="flex-1 pr-3 flex items-start gap-4">
                    {/* Equipment Photo Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-slate-200/80 bg-slate-50 p-1.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-contain rounded-xl"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-cpap.jpg";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeStyles(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          ID: {item.id}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium truncate">
                        Ruangan:{" "}
                        <span className="font-semibold text-slate-700">
                          {item.room}
                        </span>{" "}
                        • SN:{" "}
                        <span className="font-mono text-slate-700">
                          {item.serialNumber}
                        </span>
                      </p>

                      {/* REQUIREMENT 2: ENHANCED CARDS - Calibration date row */}
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Kalibrasi:</span>
                        <span className="font-semibold font-mono text-slate-700">
                          {item.tglKalibrasi}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State UI for Search / Filter */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Data tidak ditemukan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada alat yang cocok dengan kata kunci &quot;
              {searchQuery}&quot; atau filter &quot;{statusFilter}&quot;.
              Silakan coba pencarian lain.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("Semua");
              }}
              className="mt-5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        )}

        {/* ═══ ROOT-LEVEL MODALS & TOASTS ═══ */}
        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            if (typeof window !== "undefined") {
              localStorage.setItem("isAdmin", "true");
            }
            setIsAuthModalOpen(false);
            setIsEditMode(true);
            addToast("Mode Admin IPS diaktifkan! Anda dapat menambahkan alat baru 🔓", "success");
          }}
        />

        <AddEquipmentFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchEquipments}
          addToast={addToast}
        />

        <QRScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
        />

        <ToastNotification toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
