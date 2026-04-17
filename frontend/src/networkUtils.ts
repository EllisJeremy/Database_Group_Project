const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthResponse {
  success: boolean;
  user: User;
}

export const signup = (email: string, password: string, name: string) =>
  api.post<AuthResponse>("/accounts/signup", { email, password, name });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/accounts/login", { email, password });

export const loginMe = () => api.get<AuthResponse>("/accounts/login/me");

export const getUserSkills = () => api.get("/accounts/skills");

const get = <T>(path: string) => api.get<T>(path);
const post = <T>(path: string, body: unknown) => api.post<T>(path, body);
const put = <T>(path: string, body: unknown) => api.put<T>(path, body);
const del = <T>(path: string) => api.delete<T>(path);

export const endpoints = {
  // Auth
  signup: (email: string, password: string, name: string) =>
    post<AuthResponse>("/accounts/signup", { email, password, name }),
  login: (email: string, password: string) =>
    post<AuthResponse>("/accounts/login", { email, password }),
  loginMe: () => get<AuthResponse>("/accounts/login/me"),

  // Classes
  getClasses: () => get("/classes"),
  createClass: (name: string, section: string) => post("/classes/add", { name, section }),
  updateClass: (id: number, data: { name?: string; section?: string }) =>
    put(`/classes/update/${id}`, data),
  deleteClass: (id: number) => del(`/classes/delete/${id}`),

  // Posts
  getPosts: (classId?: number) => get(classId ? `/posts?class_id=${classId}` : "/posts"),
  createPost: (
    class_id: number,
    title: string,
    description: string,
    groupName?: string,
    maxMembers?: number,
  ) =>
    post("/posts/add", {
      class_id,
      title,
      description,
      ...(groupName ? { group_name: groupName, max_members: maxMembers ?? 4 } : {}),
    }),
  updatePost: (id: number, data: { title?: string; description?: string }) =>
    put(`/posts/update/${id}`, data),
  deletePost: (id: number) => del(`/posts/delete/${id}`),
  joinGroup: (postId: number) => post(`/posts/${postId}/join`, {}),
  leaveGroup: (postId: number) => post(`/posts/${postId}/leave`, {}),
  acceptMember: (postId: number, accountId: number) =>
    post(`/posts/${postId}/accept/${accountId}`, {}),
  removeMember: (postId: number, accountId: number) => del(`/posts/${postId}/remove/${accountId}`),

  // Skills
  getUserSkills: () => get("/accounts/skills"),
  getAllSkills: () => get("/skills"),
  addUserSkills: (skillIds: number[]) => post("/accounts/skills/add", { skillIds }),
  removeUserSkills: (skillIds: number[]) => post("/accounts/skills/delete", { skillIds }),
  createSkill: (name: string, type: string) => post("/skills/add", { name, type }),

  // Password reset
  forgotPassword: (email: string) =>
    post<{ success: boolean; previewUrl?: string }>("/accounts/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    post<{ success: boolean }>("/accounts/reset-password", { token, password }),

  // Logout
  logout: () => post("/accounts/logout", {}),

  // Admin
  getUsers: () => get<{ users: AdminUser[] }>("/admin/users"),
  makeAdmin: (id: number) => put(`/admin/users/${id}/make-admin`, {}),
  deleteUser: (id: number) => del(`/admin/users/${id}`),
};
