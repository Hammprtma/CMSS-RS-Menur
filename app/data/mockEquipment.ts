import { Equipment } from "@/app/types/equipment";

export const MOCK_EQUIPMENT_DATA: Equipment = {
  id: "CPAP-3",
  name: "CPAP",
  status: "Rusak",
  imageUrl: "/placeholder-cpap.jpg",
  details: {
    merkTipe: "SLE / SLE3000",
    noSeri: "SLE-B-05-03603",
    noAset: "CPAP-3",
    ruangan: "NICU",
    tglKalibrasi: "2026-05-17",
  },
  maintenanceLogs: [
    {
      id: 1,
      date: "2026-04-14",
      type: "PREVENTIF",
      description: "General Check",
      technician: "Fuad",
      taskStatus: "SELESAI",
    },
    {
      id: 2,
      date: "2026-02-05",
      type: "KOREKTIF",
      description: "Unit Off ketika Mode Baterai...",
      technician: "Azizun, Fuad",
      taskStatus: "BELUM SELESAI",
    },
  ],
};
