import { create } from 'zustand';

interface Condition {
  uid?: string;
  metric_id: number | null;
  metric_name: string | null;
  operator: string;
  threshold: number;
  threshold_min?: number | null;
  threshold_max?: number | null;
  severity: number;
}

interface Alert {
  uid: string;
  name: string;
  message: string;
  status: string;
  stationId: number;
  userId: number;
  silenced: number;
  createdAt: string;
  updatedAt: string;
  conditions: Condition[];
}

interface AlertStore {
  alert: Alert | null;
  setAlert: (alert: Alert) => void;
  clearAlert: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alert: null,
  setAlert: (alert) => set({ alert }),
  clearAlert: () => set({ alert: null }),
}));