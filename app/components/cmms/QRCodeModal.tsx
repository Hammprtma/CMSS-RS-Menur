"use client";

import React, { useEffect, useState } from "react";
import { X, Printer, QrCode, MapPin } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName: string;
  room?: string;
  brand?: string;
  serialNumber?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  room,
  brand,
  serialNumber,
}) => {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      setQrUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-transparent print:backdrop-blur-none animate-fade-in">
      {/* Modal Dialog Card - visible in UI, hidden in print except #printable-qr-label */}
      <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden print:border-0 print:shadow-none print:max-w-none print:w-auto">
        {/* Modal Header - Hidden when printing */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between no-print print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Cetak Label QR Code
              </h3>
              <p className="text-[11px] text-slate-500">
                Stiker label untuk pemindai fisik alat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 flex flex-col items-center justify-center print:p-0">
          <div
            id="printable-qr-label"
            className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-start w-[260px] max-w-full text-center shadow-xl overflow-hidden print:border print:border-black print:rounded-xl print:w-[260px] print:shadow-none print:m-0"
          >
            {/* Colored Header Banner */}
            <div className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 text-center print:from-black print:to-black">
              <p className="text-[10px] tracking-widest text-blue-200 uppercase font-semibold mb-0.5 print:text-white">
                RS MENUR • IPS CMMS
              </p>
              <p className="text-xs font-extrabold tracking-wider text-white uppercase">
                LABEL INVENTARIS ALAT
              </p>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col items-center w-full">
              {/* QR Code SVG */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shadow-sm inline-block mb-3">
                <QRCodeSVG
                  value={qrUrl || `https://cmms-rs-menur.vercel.app/equipment/${equipmentId}`}
                  size={140}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Human Readable Equipment Context below QR Code */}
              <div className="text-center w-full flex flex-col items-center">
                <div className="bg-blue-600 text-white font-mono font-bold px-4 py-1 rounded-full text-sm shadow-sm mb-2 print:bg-black print:text-white">
                  {equipmentId}
                </div>
                
                <p className="text-base font-bold text-slate-900 mb-1 line-clamp-2 leading-snug w-full">
                  {equipmentName}
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-1 w-full px-1">
                  {brand && brand !== "-" && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block truncate max-w-[110px] print:text-black print:border print:border-black">
                      Merek: {brand}
                    </span>
                  )}
                  {serialNumber && serialNumber !== "-" && (
                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block truncate max-w-[110px] print:border print:border-black">
                      SN: {serialNumber}
                    </span>
                  )}
                </div>
                
                {room && (
                  <div className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-1 rounded-lg mt-2 inline-flex items-center justify-center gap-1.5 w-full print:border-black print:text-black">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 print:text-black" />
                    <span className="truncate">{room}</span>
                  </div>
                )}
                
                <div className="border-t border-slate-100 w-full mt-4 pt-3 print:border-black">
                  <p className="text-[10px] text-slate-400 font-medium tracking-wide text-center block print:text-black">
                    Scan QR untuk riwayat maintenance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions - Hidden when printing */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 no-print print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
