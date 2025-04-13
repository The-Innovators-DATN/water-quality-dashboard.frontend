import { create } from 'zustand';

interface SidebarState {
  isPinned: boolean;
  isOpen: boolean;
  setPinned: (pinned: boolean) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isPinned: false,
  isOpen: false,
  setPinned: (pinned) => set({ isPinned: pinned }),
  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));