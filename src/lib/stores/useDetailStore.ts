import { create } from 'zustand';

interface DetailStore {
  type: string;
  id: string;
  name: string;
  setDetail: (detail: { type: string; id: string; name: string }) => void;
}

export const useDetailStore = create<DetailStore>((set) => ({
  type: '',
  id: '',
  name: '',
  setDetail: ({ type, id, name }) => set({ type, id, name }),
}));
