import { create } from "zustand";
import type { UserRole } from "@/data/dashboard-data";

interface AppState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  lastUpdated: Date;
  refreshTimestamp: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: "Admin",
  setRole: (role) => set({ currentRole: role }),
  lastUpdated: new Date(),
  refreshTimestamp: () => set({ lastUpdated: new Date() }),
}));
