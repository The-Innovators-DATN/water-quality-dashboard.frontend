import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isPinned: boolean;
  isOpen: boolean;
  setPinned: (pinned: boolean) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isPinned: false,
      isOpen: false,
      setPinned: (pinned) => set({ isPinned: pinned }),
      setOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "sidebar-storage",
    }
  )
);