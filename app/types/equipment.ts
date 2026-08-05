export interface EquipmentDetails {
  merkTipe: string;
  noSeri: string;
  noAset: string;
  ruangan: string;
  tglKalibrasi: string;
}

export interface MaintenanceLog {
  id: string | number;
  date: string;
  type: "PREVENTIF" | "KOREKTIF" | string;
  description: string;
  technician: string;
  taskStatus: "SELESAI" | "BELUM SELESAI" | string;
}

export interface Equipment {
  id: string;
  name: string;
  status: "Rusak" | "Baik" | string;
  imageUrl: string;
  certificateUrl?: string | null;
  details: EquipmentDetails;
  maintenanceLogs: MaintenanceLog[];
}
