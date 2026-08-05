import React from "react";

export const GlobalFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              © {currentYear} Instalasi Pemeliharaan Sarana (IPS) RS Menur.
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Sistem Manajemen Pemeliharaan dan Inventaris Alat Medis
            </p>
          </div>
          <div className="text-center md:text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold tracking-wider uppercase">
              Versi 1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
