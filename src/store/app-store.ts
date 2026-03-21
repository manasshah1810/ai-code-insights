import { create } from "zustand";
import type { UserRole } from "@/data/dashboard-data";

interface AppState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  lastUpdated: Date;
  refreshTimestamp: () => void;

  // Privacy & Compliance
  strictPrivacyMode: boolean;
  setStrictPrivacyMode: (enabled: boolean) => void;
  userOptInList: Record<number, boolean>; // Map of userId -> optInStatus
  toggleUserOptIn: (userId: number) => void;

  // Fiscal ROI
  monthlySeatCost: number;
  manualHourlyRate: number;
  setFiscalConfig: (config: { monthlySeatCost?: number; manualHourlyRate?: number }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: "Admin",
  setRole: (role) => set({ currentRole: role }),
  lastUpdated: new Date(),
  refreshTimestamp: () => set({ lastUpdated: new Date() }),

  strictPrivacyMode: false,
  setStrictPrivacyMode: (enabled) => set({ strictPrivacyMode: enabled }),
  userOptInList: {},
  toggleUserOptIn: (userId) => set((state) => ({
    userOptInList: {
      ...state.userOptInList,
      [userId]: !state.userOptInList[userId],
    },
  })),

  monthlySeatCost: 20,
  manualHourlyRate: 85,
  setFiscalConfig: (config) => set((state) => ({ ...state, ...config })),
}));
