import { create } from "zustand";
import { api } from "../networkUtils";

export interface GroupMember {
  account_id: number;
  name: string;
}

export interface Group {
  id: number;
  class_id: number;
  group_name: string;
  max_members: number;
  created_by: number;
  created_at: string;
  class_name?: string;
  class_section?: string;
  creator_name?: string;
  members: GroupMember[];
}

interface GroupsState {
  groups: Group[];
  loading: boolean;
  fetchGroups: (classId?: number) => Promise<void>;
  createGroup: (classId: number, groupName: string, maxMembers: number) => Promise<void>;
  updateGroup: (id: number, data: { group_name?: string; max_members?: number }) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
  joinGroup: (id: number) => Promise<void>;
  leaveGroup: (id: number) => Promise<void>;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  loading: false,

  fetchGroups: async (classId?) => {
    set({ loading: true });
    try {
      const path = classId ? `groups?class_id=${classId}` : "groups";
      const data = await api.get<{ groups: Group[] }>(path);
      set({ groups: data.groups });
    } catch (e) {
      console.error("Failed to fetch groups", e);
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (classId, groupName, maxMembers) => {
    await api.post("groups/add", { class_id: classId, group_name: groupName, max_members: maxMembers });
    await get().fetchGroups();
  },

  updateGroup: async (id, data) => {
    await api.put(`groups/update/${id}`, data);
    await get().fetchGroups();
  },

  deleteGroup: async (id) => {
    await api.delete(`groups/delete/${id}`);
    await get().fetchGroups();
  },

  joinGroup: async (id) => {
    await api.post(`groups/${id}/join`, {});
    await get().fetchGroups();
  },

  leaveGroup: async (id) => {
    await api.post(`groups/${id}/leave`, {});
    await get().fetchGroups();
  },
}));
