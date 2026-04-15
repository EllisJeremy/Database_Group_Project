import { create } from "zustand";
import { endpoints } from "../networkUtils";

export interface MemberSkill {
  id: number;
  name: string;
  type: string;
}

export interface GroupMember {
  account_id: number;
  name: string;
  is_pending: boolean;
  skills: MemberSkill[];
}

export interface PostGroup {
  id: number;
  group_name: string;
  max_members: number;
  created_by: number;
  members: GroupMember[];
}

export interface Post {
  id: number;
  class_id: number;
  author_id: number;
  title: string;
  description: string;
  created_at: string;
  author_name?: string;
  class_name?: string;
  group?: PostGroup | null;
  skill_match_score?: number;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  fetchPosts: (classId?: number) => Promise<void>;
  createPost: (classId: number, title: string, description: string, groupName?: string, maxMembers?: number) => Promise<void>;
  updatePost: (id: number, data: { title?: string; description?: string }) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  joinGroup: (postId: number) => Promise<void>;
  leaveGroup: (postId: number) => Promise<void>;
  acceptMember: (postId: number, accountId: number) => Promise<void>;
  removeMember: (postId: number, accountId: number) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,

  fetchPosts: async (classId?) => {
    set({ loading: true });
    try {
      const data = await endpoints.getPosts(classId) as { posts: Post[] };
      set({ posts: data.posts });
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (classId, title, description, groupName?, maxMembers?) => {
    await endpoints.createPost(classId, title, description, groupName, maxMembers);
    await get().fetchPosts(classId);
  },

  updatePost: async (id, data) => {
    await endpoints.updatePost(id, data);
    const currentPosts = get().posts;
    if (currentPosts.length > 0) {
      await get().fetchPosts(currentPosts[0]?.class_id);
    }
  },

  deletePost: async (id) => {
    const classId = get().posts.find((p) => p.id === id)?.class_id;
    await endpoints.deletePost(id);
    if (classId) await get().fetchPosts(classId);
  },

  joinGroup: async (postId) => {
    await endpoints.joinGroup(postId);
    const classId = get().posts.find((p) => p.id === postId)?.class_id;
    if (classId) await get().fetchPosts(classId);
  },

  leaveGroup: async (postId) => {
    await endpoints.leaveGroup(postId);
    const classId = get().posts.find((p) => p.id === postId)?.class_id;
    if (classId) await get().fetchPosts(classId);
  },

  acceptMember: async (postId, accountId) => {
    await endpoints.acceptMember(postId, accountId);
    const classId = get().posts.find((p) => p.id === postId)?.class_id;
    if (classId) await get().fetchPosts(classId);
  },

  removeMember: async (postId, accountId) => {
    await endpoints.removeMember(postId, accountId);
    const classId = get().posts.find((p) => p.id === postId)?.class_id;
    if (classId) await get().fetchPosts(classId);
  },
}));
