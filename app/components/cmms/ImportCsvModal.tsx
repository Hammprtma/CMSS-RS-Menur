"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  AlertCircle,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Search,
} from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";

const generateAbbreviation = (name: string): string => {
  const cleanName = name?.trim() || "";
  if (!cleanName) return "AST";
  
  const words = cleanName.split(/\s+/);
  if (words.length > 1) {
    return words.slice(0, 3).map(w => w[0]).join("").toUpperCase();
  } else {
    return cleanName.slice(0, 4).toUpperCase();
  }
};

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (message: string, type: "success" | "error") => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  addToast,
}) => {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setParsedData([]);
      setIsSubmitting(false);
      setErrorMessage("");
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const csvContent = "Nama Alat,Merek,Nomor Seri,Ruangan,Masa Habis Kalibrasi,Status\nContoh Alat Medis,Merk ABC,SN-12345,IGD,2027-10-12,Baik";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_alat.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setErrorMessage("File harus berformat CSV.");
        return;
      }

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as any[];
            if (data.length === 0) {
              setErrorMessage("File CSV kosong.");
              return;
            }

            const formattedData = data.map((row: any) => {
              const name = row["Nama Alat"] || "";
              const idSuffix = Math.floor(1000 + Math.random() * 9000).toString();
              const generatedId = `${generateAbbreviation(name)}-${idSuffix}`;

              const rawExpiryDate = row["Masa Habis Kalibrasi"]?.trim() || "";
              let calibrationDate = new Date().toISOString().split("T")[0];
              if (rawExpiryDate) {
                const expiryDate = new Date(rawExpiryDate);
                if (!isNaN(expiryDate.getTime())) {
                  const calDate = new Date(expiryDate);
                  calDate.setFullYear(calDate.getFullYear() - 1);
                  calibrationDate = calDate.toISOString().split("T")[0];
                }
              }

              return {
                id: generatedId,
                name: name.trim(),
                brand_type: row["Merek"]?.trim() || "",
                serial_number: row["Nomor Seri"]?.trim() || "",
                room: row["Ruangan"]?.trim() || "",
                calibration_date: calibrationDate,
                status: row["Status"]?.trim() || "Baik",
                image_url: "/placeholder-cpap.jpg",
                drive_certificates: [],
                tempCertificateLink: "",
              };
            });

            setParsedData(formattedData);
          } catch (err) {
            setErrorMessage("Format CSV tidak sesuai template.");
          }
        },
        error: (error) => {
          setErrorMessage(`Gagal membaca file: ${error.message}`);
        }
      });
    }
  };

  const handleRemoveRow = (idToRemove: string) => {
    setParsedData(prev => prev.filter(item => item.id !== idToRemove));
  };

  const handleSubmit = async () => {
    if (parsedData.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const finalDataToInsert = parsedData.map((item) => {
        const driveCerts = item.tempCertificateLink
          ? [{ id: crypto.randomUUID(), title: item.brand_type || "Sertifikat", url: item.tempCertificateLink }]
          : [];

        return {
          id: item.id,
          name: item.name,
          brand_type: item.brand_type,
          serial_number: item.serial_number,
          room: item.room,
          calibration_date: item.calibration_date,
          status: item.status,
          image_url: "/placeholder-cpap.jpg",
          drive_certificates: driveCerts,
        };
      });

      const { error: insertError } = await supabase.from("equipments").insert(finalDataToInsert);

      if (insertError) {
        console.error("Bulk Insert Error:", insertError);
        setErrorMessage(`Gagal import data: ${insertError.message}`);
        setIsSubmitting(false);
        return;
      }

      addToast(`${parsedData.length} alat berhasil diimport! ✅`, "success");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Import Exception:", err);
      setErrorMessage(`Terjadi kesalahan sistem: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const filteredData = parsedData.filter((row) => {
    const q = searchQuery.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.serial_number.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Import Data (CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Tambahkan banyak alat sekaligus menggunakan file CSV
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

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {parsedData.length === 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  <p className="font-bold text-slate-800 mb-1">1. Unduh Template</p>
                  <p>Gunakan template CSV ini agar format kolom sesuai.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  Download Template
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed relative">
                <div className="text-center py-6">
                  <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800 mb-1">2. Unggah File CSV</p>
                  <p className="text-xs text-slate-500 mb-4">Pilih file CSV yang sudah diisi.</p>
                  <label className="inline-flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer">
                    Pilih File CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Preview Data
                </h4>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Menampilkan {filteredData.length} alat (Total siap: {parsedData.length})
                </span>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan Nama Alat atau Nomor Seri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>
              
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200 font-bold shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 min-w-[100px]">Generated ID</th>
                        <th className="px-4 py-3 min-w-[120px]">Nama Alat</th>
                        <th className="px-4 py-3 min-w-[100px]">Merek</th>
                        <th className="px-4 py-3 min-w-[100px]">Ruangan</th>
                        <th className="px-4 py-3 min-w-[180px]">Link Sertifikat</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-mono text-indigo-600">{row.id}</td>
                          <td className="px-4 py-2.5 font-medium">{row.name}</td>
                          <td className="px-4 py-2.5">{row.brand_type}</td>
                          <td className="px-4 py-2.5">{row.room}</td>
                          <td className="px-4 py-2.5">
                            <input
                              type="url"
                              value={row.tempCertificateLink}
                              onChange={(e) => {
                                setParsedData(prev => prev.map(item => item.id === row.id ? { ...item, tempCertificateLink: e.target.value } : item));
                              }}
                              placeholder="https://drive..."
                              className="w-full min-w-[120px] bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(row.id)}
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              if (parsedData.length > 0) {
                setParsedData([]); // Reset to allow new file upload
              } else {
                onClose();
              }
            }}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          
          {parsedData.length > 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan Data...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Konfirmasi & Simpan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
