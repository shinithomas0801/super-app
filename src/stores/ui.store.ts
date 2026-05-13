import { create } from "zustand";

/**
 * UI store (Single Responsibility: sidebar, theme, modals).
 * Interface Segregation: components subscribe only to what they need.
 */

type Theme = "light" | "dark" | "system";

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: "system",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
