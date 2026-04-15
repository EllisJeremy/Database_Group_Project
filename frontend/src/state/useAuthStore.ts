import { create } from "zustand";
import { type User, endpoints } from "../networkUtils.ts";

interface AuthState {
  user: User | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  signup: async (email, password, name) => {
    const data = await endpoints.signup(email, password, name);
    console.log(data.user);
    set({ user: data.user });
  },

  login: async (email, password) => {
    const data = await endpoints.login(email, password);
    set({ user: data.user });
  },

  logout: async () => {
    await endpoints.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const data = await endpoints.loginMe();
      set({ user: data.user });
    } catch {
      set({ user: null });
    }
  },
}));
