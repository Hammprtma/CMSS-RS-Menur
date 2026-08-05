"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, AlertCircle, Loader2, QrCode } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
      setIsScanning(false);
      setErrorMsg(null);
      setIsProcessing(false);
      return;
    }

    let isMounted = true;
    const scannerId = "qr-reader-container";
    setIsScanning(false);
    setErrorMsg(null);
    setIsProcessing(false);

    const timer = setTimeout(async () => {
      if (!isMounted) return;
      try {
        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (isMounted) {
              handleScanSuccess(decodedText);
            }
          },
          () => {
            // Ignore harmless background frame scan misses
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (isMounted) {
          setErrorMsg(
            "Gagal mengakses kamera. Pastikan izin kamera diaktifkan di pengaturan browser Anda."
          );
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
      }
    };
  }, [isOpen]);

  const handleScanSuccess = (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Stop camera immediately
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
    }

    let targetPath = decodedText.trim();
    try {
      const urlObj = new URL(decodedText);
      targetPath = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch {
      // If not an absolute URL, check if it's already a path or an ID
      if (!targetPath.startsWith("/") && !targetPath.startsWith("http")) {
        targetPath = `/equipment/${encodeURIComponent(targetPath)}`;
      }
    }

    router.push(targetPath);
    onClose();
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch(() => {})
        .finally(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          onClose();
        });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pemindai QR Code Alat
              </h3>
              <p className="text-xs text-slate-500">
                RS MENUR • IPS CMMS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed Viewport */}
        <div className="p-5 flex flex-col items-center">
          <div className="w-full bg-slate-950 rounded-2xl overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
            {/* Camera Viewport Container */}
            <div
              id="qr-reader-container"
              className="w-full overflow-hidden rounded-xl [&>video]:rounded-xl [&>video]:w-full [&>video]:object-cover"
            />

            {/* Loading / Processing State */}
            {!isScanning && !errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/90 text-slate-300 p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs font-semibold text-slate-300">
                  Menyiapkan kamera perangkat...
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Harap izinkan akses kamera pada peramban Anda untuk memindai label QR.
                </p>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/95 text-red-400 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-red-400">
                  Kamera Tidak Tersedia
                </h4>
                <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                  {errorMsg}
                </p>
              </div>
            )}

            {/* Processing scan result */}
            {isProcessing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-blue-600/90 text-white p-6 text-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <p className="text-sm font-bold">QR Code Terdeteksi!</p>
                <p className="text-xs text-blue-100">
                  Mengalihkan ke halaman detail alat...
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 font-medium mt-4 text-center">
            Arahkan kamera tepat ke stiker QR Code alat kesehatan RS Menur.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Camera className="w-4 h-4 text-blue-600" />
            <span>Kamera Live Aktif</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold shadow-md shadow-slate-900/15 transition-all cursor-pointer"
          >
            Tutup Kamera
          </button>
        </div>
      </div>
    </div>
  );
};
