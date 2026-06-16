import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  departmentId: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => set({ accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ accessToken: null, user: null }),
}));
