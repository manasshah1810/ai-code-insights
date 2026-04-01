import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/data/dashboard-data";
import type { CommitEvent } from "@/lib/socket-service";

interface AppState {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  lastUpdated: Date;
  refreshTimestamp: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Role-based identity
  developerUserId: number;
  managerUserId: number;
  managerTeamId: string;
  setManagerIdentity: (userId: number, teamId: string) => void;

  // Privacy & Compliance
  strictPrivacyMode: boolean;
  setStrictPrivacyMode: (enabled: boolean) => void;
  userOptInList: Record<number, boolean>;
  toggleUserOptIn: (userId: number) => void;

  // Fiscal ROI
  monthlySeatCost: number;
  manualHourlyRate: number;
  setFiscalConfig: (config: { monthlySeatCost?: number; manualHourlyRate?: number }) => void;

  // Real-time Telemetry (persisted)
  liveEvents: CommitEvent[];
  addLiveEvent: (event: CommitEvent) => void;
  clearLiveEvents: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentRole: "Admin",
      setRole: (role) => set({ currentRole: role }),
      lastUpdated: new Date(),
      refreshTimestamp: () => set({ lastUpdated: new Date() }),
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Developer persona: user index 2 → id 3 (Robert Garcia, Junior Engineer, Data & ML)
      developerUserId: 3,
      // Manager persona: user index 5 → id 6 (Jennifer Lopez, Tech Lead, Infrastructure/SRE)
      managerUserId: 6,
      managerTeamId: "infra",
      setManagerIdentity: (userId, teamId) => set({ managerUserId: userId, managerTeamId: teamId }),

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

      // Real-time Telemetry
      liveEvents: [],
      addLiveEvent: (event) => set((state) => ({
        liveEvents: [event, ...state.liveEvents].slice(0, 50), // Keep last 50
      })),
      clearLiveEvents: () => set({ liveEvents: [] }),
    }),
    {
      name: "ai-code-insights-store", // localStorage key
      partialize: (state) => ({
        // Only persist these fields to localStorage
        currentRole: state.currentRole,
        theme: state.theme,
        developerUserId: state.developerUserId,
        managerUserId: state.managerUserId,
        managerTeamId: state.managerTeamId,
        strictPrivacyMode: state.strictPrivacyMode,
        userOptInList: state.userOptInList,
        monthlySeatCost: state.monthlySeatCost,
        manualHourlyRate: state.manualHourlyRate,
        liveEvents: state.liveEvents,
      }),
    }
  )
);
