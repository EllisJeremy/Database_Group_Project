import { create } from "zustand";
import { api } from "../networkUtils";

export interface PostGroup {
  id: number;
  group_name: string;
  max_members: number;
  created_by: number;
  members: Array<{ account_id: number; name: string }>;
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
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  fetchPosts: (classId?: number) => Promise<void>;
  createPost: (classId: number, title: string, description: string, groupName?: string, maxMembers?: number) => Promise<void>;
  updatePost: (id: number, data: { title?: string; description?: string }) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  loading: false,

  fetchPosts: async (classId?) => {
    set({ loading: true });
    try {
      const path = classId ? `posts?class_id=${classId}` : "posts";
      const data = await api.get<{ posts: Post[] }>(path);
      set({ posts: data.posts });
    } catch (e) {
      console.error("Failed to fetch posts", e);
    } finally {
      set({ loading: false });
    }
  },

  createPost: async (classId, title, description, groupName?, maxMembers?) => {
    await api.post("posts/add", {
      class_id: classId,
      title,
      description,
      ...(groupName ? { group_name: groupName, max_members: maxMembers ?? 4 } : {}),
    });
    await get().fetchPosts(classId);
  },

  updatePost: async (id, data) => {
    await api.put(`posts/update/${id}`, data);
    const currentPosts = get().posts;
    if (currentPosts.length > 0) {
      await get().fetchPosts(currentPosts[0]?.class_id);
    }
  },

  deletePost: async (id) => {
    const currentPosts = get().posts;
    const classId = currentPosts.find((p) => p.id === id)?.class_id;
    await api.delete(`posts/delete/${id}`);
    if (classId) await get().fetchPosts(classId);
  },
}));
