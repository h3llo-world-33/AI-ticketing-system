import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  rehydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify({ ...user, token }));
    }
    set({
      user,
      token,
      isAuthenticated: !!user && !!token
    })
  },
  logout: () => {
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false
    });
  },
  rehydrate: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        set({
          user: userData,
          token: userData.token || null,
          isAuthenticated: !!userData && !!userData.token
        });
      } catch {
        // ignore
      }
    }
  }
}));
