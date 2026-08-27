import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  theme: "system",
  setTheme: (theme) => set({ theme }),
  activeNotifications: 0,
  incrementNotifications: () =>
    set((state) => ({ activeNotifications: state.activeNotifications + 1 })),
  clearNotifications: () => set({ activeNotifications: 0 }),
}));
