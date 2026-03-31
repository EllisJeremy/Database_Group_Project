import { create } from "zustand";
import { api } from "../networkUtils";

export interface Class {
  id: number;
  name: string;
  section: string;
  creator_id: number;
  creator_name: string;
  created_at: string;
  post_count?: number;
}

interface ClassesState {
  classes: Class[];
  loading: boolean;
  fetchClasses: () => Promise<void>;
  createClass: (name: string, section: string) => Promise<void>;
  updateClass: (id: number, data: { name?: string; section?: string }) => Promise<void>;
  deleteClass: (id: number) => Promise<void>;
}

export const useClassesStore = create<ClassesState>((set, get) => ({
  classes: [],
  loading: false,

  fetchClasses: async () => {
    set({ loading: true });
    try {
      const data = await api.get<{ classes: Class[] }>("classes");
      set({ classes: data.classes });
    } catch (e) {
      console.error("Failed to fetch classes", e);
    } finally {
      set({ loading: false });
    }
  },

  createClass: async (name, section) => {
    await api.post("classes/add", { name, section });
    await get().fetchClasses();
  },

  updateClass: async (id, data) => {
    await api.put(`classes/update/${id}`, data);
    await get().fetchClasses();
  },

  deleteClass: async (id) => {
    await api.delete(`classes/delete/${id}`);
    await get().fetchClasses();
  },
}));
