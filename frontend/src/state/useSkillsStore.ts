import { create } from "zustand";
import { endpoints } from "../networkUtils";

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
  createSkill: (name: string, type: string) => Promise<void>;
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  allSkills: [],
  userSkills: [],
  loading: false,

  fetchAllSkills: async () => {
    try {
      const data = (await endpoints.getAllSkills()) as { skills: Skill[] };
      set({ allSkills: data.skills });
    } catch (e) {
      console.error("Failed to fetch skills", e);
    }
  },

  fetchUserSkills: async () => {
    set({ loading: true });
    try {
      const data = (await endpoints.getUserSkills()) as { skills: Skill[] };
      set({ userSkills: data.skills });
    } catch (e) {
      console.error("Failed to fetch user skills", e);
    } finally {
      set({ loading: false });
    }
  },

  addSkills: async (skillIds) => {
    await endpoints.addUserSkills(skillIds);
    await get().fetchUserSkills();
  },

  removeSkills: async (skillIds) => {
    await endpoints.removeUserSkills(skillIds);
    await get().fetchUserSkills();
  },

  createSkill: async (name, type) => {
    await endpoints.createSkill(name, type);
    await get().fetchAllSkills();
  },
}));
