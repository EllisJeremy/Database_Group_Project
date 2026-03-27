const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(path: string, method: Method, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
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

export async function createUser(email: string, password: string, name: string) {
  return api.post("accounts/signup", { email, password, name });
}
