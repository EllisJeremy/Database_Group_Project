import { create } from "zustand";
import { api } from "../networkUtils";

export interface Skill {
  id: number;
  name: string;
  type: string;
}

interface SkillsState {
  allSkills: Skill[];
  userSkills: Skill[];
  loading: boolean;
  fetchAllSkills: () => Promise<void>;
  fetchUserSkills: () => Promise<void>;
  addSkills: (skillIds: number[]) => Promise<void>;
  removeSkills: (skillIds: number[]) => Promise<void>;
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  allSkills: [],
  userSkills: [],
  loading: false,

  fetchAllSkills: async () => {
    try {
      const data = await api.get<{ skills: Skill[] }>("skills");
      set({ allSkills: data.skills });
    } catch (e) {
      console.error("Failed to fetch skills", e);
    }
  },

  fetchUserSkills: async () => {
    set({ loading: true });
    try {
      const data = await api.get<{ skills: Skill[] }>("accounts/skills");
      set({ userSkills: data.skills });
    } catch (e) {
      console.error("Failed to fetch user skills", e);
    } finally {
      set({ loading: false });
    }
  },

  addSkills: async (skillIds) => {
    await api.post("accounts/skills/add", { skillIds });
    await get().fetchUserSkills();
  },

  removeSkills: async (skillIds) => {
    await api.post("accounts/skills/delete", { skillIds });
    await get().fetchUserSkills();
  },
}));
