import { create } from "zustand";
import { type User, signup, login, loginMe } from "../networkUtils.ts";
import { api } from "../networkUtils.ts";

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
    const data = await signup(email, password, name);
    console.log(data.user);
    set({ user: data.user });
  },

  login: async (email, password) => {
    const data = await login(email, password);
    set({ user: data.user });
  },

  logout: async () => {
    await api.post("accounts/logout", {});
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const data = await loginMe();
      set({ user: data.user });
    } catch {
      set({ user: null });
    }
  },
}));
