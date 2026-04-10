import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  activeNotifications: number;
  incrementNotifications: () => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  
  activeNotifications: 0,
  incrementNotifications: () => set((state) => ({ activeNotifications: state.activeNotifications + 1 })),
  clearNotifications: () => set({ activeNotifications: 0 }),
}));
