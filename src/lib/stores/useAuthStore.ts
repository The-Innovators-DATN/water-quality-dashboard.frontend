import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Định nghĩa kiểu dữ liệu cho User
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

// Định nghĩa kiểu dữ liệu cho AuthState
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Tách store ra khỏi hook để tránh vấn đề hydration
let store: ReturnType<typeof initStore> | undefined;

function initStore() {
  return create<AuthState>()(
    persist(
      (set) => ({
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
        
        updateUser: (userData: Partial<User>) => set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      }),
      {
        name: 'water-monitoring-auth',
      }
    )
  );
}

// Kiểm tra môi trường để tránh lỗi hydration
export const useAuthStore = <T>(selector: (state: AuthState) => T): T => {
  // Trong quá trình SSR, trả về giá trị mặc định
  if (typeof window === 'undefined') {
    return selector({
      user: null,
      token: null,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
    });
  }
  
  // Khởi tạo store nếu chưa tồn tại
  if (!store) {
    store = initStore();
  }
  
  return selector(store.getState());
};

// Các hàm để truy cập trực tiếp
export const getState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
    };
  }
  
  if (!store) {
    store = initStore();
  }
  return store.getState();
};

export const { login, logout, updateUser } = {
  login: (userData: User, token: string) => getState().login(userData, token),
  logout: () => getState().logout(),
  updateUser: (userData: Partial<User>) => getState().updateUser(userData),
};