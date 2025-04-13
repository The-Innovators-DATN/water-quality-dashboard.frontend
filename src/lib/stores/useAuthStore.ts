import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Kiểu dữ liệu User
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// Kiểu store
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Store chính xác và đơn giản nhất
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData: User, token: string) => {
        document.cookie = `token=${token}; path=/; max-age=86400; samesite=strict`;
        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'water-monitoring-auth',
    }
  )
);
