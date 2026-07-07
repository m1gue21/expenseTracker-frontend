import axios from "axios";
import { useAuthStore } from "./store";
import type {
  AuthResponse,
  DashboardStats,
  Expense,
  ExpenseInput,
  ExpenseReport,
  User,
} from "@/types";

export const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

// Interceptor de request: agrega el JWT a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: si el token expiró (401), cierra sesión y
// manda al login. Evita repetir este manejo en cada página.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Extrae el mensaje de error del JSON {"error": "..."} del backend
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? error.message;
  }
  return "Unexpected error";
}

// --- Funciones tipadas por dominio ---

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>("/api/auth/register", data),
};

export const usersApi = {
  me: () => api.get<User>("/api/users/me"),
  getAll: () => api.get<User[]>("/api/users"),
};

export const reportsApi = {
  create: (data: { title: string; description: string }) =>
    api.post<ExpenseReport>("/api/reports", data),
  getMine: () => api.get<ExpenseReport[]>("/api/reports/my"),
  getAll: () => api.get<ExpenseReport[]>("/api/reports"),
  getOne: (id: number) => api.get<ExpenseReport>(`/api/reports/${id}`),
  submit: (id: number) => api.put<ExpenseReport>(`/api/reports/${id}/submit`),
  approve: (id: number) => api.put<ExpenseReport>(`/api/reports/${id}/approve`),
  reject: (id: number) => api.put<ExpenseReport>(`/api/reports/${id}/reject`),
  remove: (id: number) => api.delete(`/api/reports/${id}`),
};

export const expensesApi = {
  add: (reportId: number, data: ExpenseInput) =>
    api.post<Expense>(`/api/reports/${reportId}/expenses`, data),
  update: (id: number, data: ExpenseInput) => api.put<Expense>(`/api/expenses/${id}`, data),
  remove: (id: number) => api.delete(`/api/expenses/${id}`),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/api/dashboard/stats"),
};
