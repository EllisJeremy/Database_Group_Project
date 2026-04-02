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
  api.post<AuthResponse>("accounts/signup", { email, password, name });

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("accounts/login", { email, password });

export const loginMe = () => api.get<AuthResponse>("accounts/login/me");

export const getUserSkills = () => api.get("accounts/skills");

// Shorthand helpers
const get = <T>(path: string) => api.get<T>(path);
const post = <T>(path: string, body: unknown) => api.post<T>(path, body);
const put = <T>(path: string, body: unknown) => api.put<T>(path, body);
const del = <T>(path: string) => api.delete<T>(path);

export const endpoints = {
  // Auth (existing)
  signup: (email: string, password: string, name: string) =>
    post('/accounts/signup', { email, password, name }),
  login: (email: string, password: string) =>
    post('/accounts/login', { email, password }),
  loginMe: () => get('/accounts/login/me'),

  // Classes
  getClasses: () => get('/classes'),
  createClass: (name: string, section: string) => post('/classes/add', { name, section }),
  updateClass: (id: number, data: { name?: string; section?: string }) => put(`/classes/update/${id}`, data),
  deleteClass: (id: number) => del(`/classes/delete/${id}`),

  // Posts
  getPosts: (classId?: number) => get(classId ? `/posts?class_id=${classId}` : '/posts'),
  createPost: (class_id: number, title: string, description: string) => post('/posts/add', { class_id, title, description }),
  updatePost: (id: number, data: { title?: string; description?: string }) => put(`/posts/update/${id}`, data),
  deletePost: (id: number) => del(`/posts/delete/${id}`),

  // Skills
  getUserSkills: () => get('/accounts/skills'),
  getAllSkills: () => get('/skills'),
  addUserSkills: (skillIds: number[]) => post('/accounts/skills/add', { skillIds }),
  removeUserSkills: (skillIds: number[]) => post('/accounts/skills/delete', { skillIds }),

  // Logout
  logout: () => post('/accounts/logout', {}),
};
