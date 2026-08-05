"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, ShieldCheck, LogOut } from "lucide-react";
import { AdminAuthModal } from "@/app/components/cmms/AdminAuthModal";

export const GlobalHeader = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync state from localStorage on mount and listen to "adminChange" events
  useEffect(() => {
    const checkAdminState = () => {
      const savedAdmin = localStorage.getItem("isAdmin");
      setIsEditMode(savedAdmin === "true");
    };

    // Initial check
    checkAdminState();

    // Listen to custom event
    window.addEventListener("adminChange", checkAdminState);
    return () => {
      window.removeEventListener("adminChange", checkAdminState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    window.dispatchEvent(new Event("adminChange"));
  };

  const handleAuthSuccess = () => {
    localStorage.setItem("isAdmin", "true");
    setIsAuthModalOpen(false);
    window.dispatchEvent(new Event("adminChange"));
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Left side: Branding & Logos */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-4 group">
              <img
                src="/logo-jatim.png"
                alt="Logo Pemprov Jawa Timur"
                className="h-9 sm:h-11 w-auto object-contain drop-shadow-2xs group-hover:scale-105 transition-transform"
              />
              <img
                src="/logo-rsud-medika.png"
                alt="Logo RS Menur"
                className="h-8 sm:h-10 w-auto object-contain drop-shadow-2xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col border-l border-slate-300 pl-3">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase leading-tight group-hover:text-blue-600 transition-colors">
                  RS MENUR
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-blue-600 tracking-wider uppercase">
                  IPS RS • CMMS
                </span>
              </div>
            </Link>

            {/* Right side: Admin Toggle */}
            <div>
              {!isEditMode ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 text-xs font-bold shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Login IPS</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Admin IPS (Aktif)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/80 text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    title="Keluar Mode Admin"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Auth Modal (Root level for the header) */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};
