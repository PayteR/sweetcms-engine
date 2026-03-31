import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;        // mobile overlay only
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggleSidebar: () => set((s) => ({ isOpen: !s.isOpen })),
  closeSidebar: () => set({ isOpen: false }),
}));
