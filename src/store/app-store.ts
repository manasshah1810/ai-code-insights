import { create } from "zustand";
import type { UserRole } from "@/data/dashboard-data";

interface AppState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  lastUpdated: Date;
  refreshTimestamp: () => void;

  // Role-based identity
  // Developer persona: Robert Garcia (user id=3, Data & ML, Junior Engineer)
  // Manager persona: Jennifer Lopez (user id=6, Infrastructure/SRE, Tech Lead)
  developerUserId: number;
  managerUserId: number;
  managerTeamId: string;

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

  // Developer persona: user index 2 → id 3 (Robert Garcia, Junior Engineer, Data & ML)
  developerUserId: 3,
  // Manager persona: user index 5 → id 6 (Jennifer Lopez, Tech Lead, Infrastructure/SRE)
  managerUserId: 6,
  managerTeamId: "infra",

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

