import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthState {
  user_id: number | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (usser_id: number, token: string) => void;
  logout: () => void;
  // updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user_id: null,
      token: null,
      isAuthenticated: false,

      login: (user_id: number, token: string) => {
        document.cookie = `token=${token}; path=/; max-age=86400; samesite=strict`;
        set({
          user_id: user_id,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        set({
          user_id: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // updateUser: (userData: Partial<User>) => {
      //   const currentUser = get().user;
      //   if (currentUser) {
      //     set({
      //       user: { ...currentUser, ...userData },
      //     });
      //   }
      // },
    }),
    {
      name: "water-monitoring-auth",
    }
  )
);
