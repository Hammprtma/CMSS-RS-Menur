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
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName,
  room,
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
            className="bg-white border-2 border-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center w-[260px] max-w-full text-center shadow-sm print:border-2 print:border-black print:rounded-xl print:w-[260px] print:shadow-none print:m-0"
          >
            {/* Hospital Tag Header */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3 w-full text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                RS MENUR • IPS CMMS
              </p>
              <p className="text-xs font-black uppercase tracking-wider text-slate-900">
                LABEL INVENTARIS ALAT
              </p>
            </div>

            {/* QR Code SVG */}
            <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-inner">
              <QRCodeSVG
                value={qrUrl || `https://cmms-rs-menur.vercel.app/equipment/${equipmentId}`}
                size={150}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Human Readable Equipment Context below QR Code */}
            <div className="mt-3.5 text-center w-full">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                ID ASET ALAT
              </p>
              <div className="bg-slate-100 border border-slate-300 rounded-lg py-1 px-3 inline-block">
                <p className="text-base font-black font-mono text-slate-900 tracking-tight">
                  {equipmentId}
                </p>
              </div>
              <p className="text-xs font-extrabold text-slate-900 mt-2 line-clamp-2 leading-snug">
                {equipmentName}
              </p>
              {room && (
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{room}</span>
                </p>
              )}
              <p className="text-[9px] font-medium text-slate-400 mt-2.5 border-t border-slate-200 pt-1.5">
                Scan QR untuk riwayat maintenance
              </p>
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
