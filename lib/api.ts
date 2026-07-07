import axios from "axios";
import { useAuthStore } from "./store";
import {
  mockAuthApi,
  mockDashboardApi,
  mockExpensesApi,
  mockReportsApi,
  mockUsersApi,
} from "./mock/mock_client";
import type {
  AuthResponse,
  DashboardStats,
  Expense,
  ExpenseInput,
  ExpenseReport,
  User,
} from "@/types";

export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
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
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error";
}

// --- Implementación real (backend) ---

const realAuthApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/api/auth/login", { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post<AuthResponse>("/api/auth/register", data),
};

const realUsersApi = {
  me: () => api.get<User>("/api/users/me"),
  getAll: () => api.get<User[]>("/api/users"),
};

const realReportsApi = {
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

const realExpensesApi = {
  add: (reportId: number, data: ExpenseInput) =>
    api.post<Expense>(`/api/reports/${reportId}/expenses`, data),
  update: (id: number, data: ExpenseInput) => api.put<Expense>(`/api/expenses/${id}`, data),
  remove: (id: number) => api.delete(`/api/expenses/${id}`),
};

const realDashboardApi = {
  stats: () => api.get<DashboardStats>("/api/dashboard/stats"),
};

// --- API pública: mock o real según NEXT_PUBLIC_MOCK_MODE ---

export const authApi = MOCK_MODE ? mockAuthApi : realAuthApi;
export const usersApi = MOCK_MODE ? mockUsersApi : realUsersApi;
export const reportsApi = MOCK_MODE ? mockReportsApi : realReportsApi;
export const expensesApi = MOCK_MODE ? mockExpensesApi : realExpensesApi;
export const dashboardApi = MOCK_MODE ? mockDashboardApi : realDashboardApi;
