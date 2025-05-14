import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthState {
  user_id: number | null;
  token: string | null;
  user: User | null;

  login: (user_id: number, token: string, expires_at: string, user?: User) => void;
  logout: () => void;
  setUser: (user: User) => void;

  getUser: () => User | null;
  getUserId: () => number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user_id: null,
      token: null,
      user: null,

      login: (user_id, token, expires_at, user) => {
        document.cookie = `access_token=${token}; path=/; max-age=${expires_at}; samesite=strict`;
        set({ user_id, token, user: user ?? null });
      },

      logout: () => {
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        set({ user_id: null, token: null, user: null });
      },

      setUser: (user) => set({ user }),

      getUser: () => get().user,
      getUserId: () => get().user?.id ?? get().user_id,
    }),
    {
      name: "water-monitoring-auth",
    }
  )
);