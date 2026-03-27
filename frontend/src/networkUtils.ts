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
