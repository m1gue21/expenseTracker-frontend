import { useAuthStore } from "@/lib/store";
import type {
  AuthResponse,
  DashboardStats,
  Expense,
  ExpenseInput,
  ExpenseReport,
  User,
} from "@/types";
import {
  MOCK_ADMIN,
  MOCK_EMPLOYEE,
  MOCK_MANAGER,
  MOCK_REPORTS,
  MOCK_USERS,
} from "./mock_data";

const MOCK_DELAY_MS = 500;

function delay<T>(data: T): Promise<{ data: T }> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), MOCK_DELAY_MS);
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let users = clone(MOCK_USERS);
let reports = clone(MOCK_REPORTS);
let nextReportId = reports.length + 1;
let nextExpenseId = reports.reduce((max, r) => Math.max(max, ...r.expenses.map((e) => e.id)), 0) + 1;
let nextUserId = users.length + 1;

function recalcReportTotal(report: ExpenseReport): void {
  report.totalAmount = report.expenses.reduce((sum, e) => sum + e.amount, 0);
}

function computeStats(): DashboardStats {
  const approved = reports.filter((r) => r.status === "APPROVED");
  const approvedExpenses = approved.flatMap((r) => r.expenses);

  const expensesByCategory = { TRANSPORT: 0, ACCOMMODATION: 0, MEALS: 0, OTHER: 0 };
  approvedExpenses.forEach((e) => {
    expensesByCategory[e.category] += e.amount;
  });

  const months: { month: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      month: key,
      total: approvedExpenses
        .filter((e) => e.expenseDate.startsWith(key))
        .reduce((sum, e) => sum + e.amount, 0),
    });
  }

  return {
    totalExpenses: approvedExpenses.reduce((sum, e) => sum + e.amount, 0),
    pendingReports: reports.filter((r) => r.status === "SUBMITTED").length,
    approvedReports: approved.length,
    rejectedReports: reports.filter((r) => r.status === "REJECTED").length,
    draftReports: reports.filter((r) => r.status === "DRAFT").length,
    totalUsers: users.length,
    expensesByCategory,
    expensesByMonth: months,
  };
}

function resolveUserFromEmail(email: string): User {
  const normalized = email.toLowerCase();
  if (normalized.includes("admin")) return clone(users.find((u) => u.id === MOCK_ADMIN.id) ?? MOCK_ADMIN);
  if (normalized.includes("manager")) return clone(users.find((u) => u.id === MOCK_MANAGER.id) ?? MOCK_MANAGER);
  return clone(users.find((u) => u.id === MOCK_EMPLOYEE.id) ?? MOCK_EMPLOYEE);
}

function currentUser(): User | null {
  return useAuthStore.getState().user;
}

function findReport(id: number): ExpenseReport {
  const report = reports.find((r) => r.id === id);
  if (!report) throw new Error(`Report ${id} not found`);
  return report;
}

export function resetMockStore(): void {
  users = clone(MOCK_USERS);
  reports = clone(MOCK_REPORTS);
  nextReportId = reports.length + 1;
  nextExpenseId = reports.reduce((max, r) => Math.max(max, ...r.expenses.map((e) => e.id)), 0) + 1;
  nextUserId = users.length + 1;
}

export const mockAuthApi = {
  login: (email: string, password: string) => {
    void password;
    const user = resolveUserFromEmail(email);
    const response: AuthResponse = {
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user,
    };
    return delay(response);
  },

  register: (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const user: User = {
      id: nextUserId++,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "EMPLOYEE",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    const response: AuthResponse = {
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user: clone(user),
    };
    return delay(response);
  },
};

export const mockUsersApi = {
  me: () => {
    const user = currentUser();
    if (!user) throw new Error("Not authenticated");
    return delay(clone(user));
  },

  getAll: () => delay(clone(users)),
};

export const mockReportsApi = {
  create: (data: { title: string; description: string }) => {
    const user = currentUser();
    if (!user) throw new Error("Not authenticated");

    const report: ExpenseReport = {
      id: nextReportId++,
      title: data.title,
      description: data.description,
      status: "DRAFT",
      totalAmount: 0,
      submittedAt: null,
      createdAt: new Date().toISOString(),
      user: clone(user),
      expenses: [],
    };
    reports.push(report);
    return delay(clone(report));
  },

  getMine: () => {
    const user = currentUser();
    if (!user) throw new Error("Not authenticated");
    const mine = reports.filter((r) => r.user.id === user.id);
    return delay(clone(mine));
  },

  getAll: () => delay(clone(reports)),

  getOne: (id: number) => delay(clone(findReport(id))),

  submit: (id: number) => {
    const report = findReport(id);
    report.status = "SUBMITTED";
    report.submittedAt = new Date().toISOString();
    return delay(clone(report));
  },

  approve: (id: number) => {
    const report = findReport(id);
    report.status = "APPROVED";
    return delay(clone(report));
  },

  reject: (id: number) => {
    const report = findReport(id);
    report.status = "REJECTED";
    return delay(clone(report));
  },

  remove: (id: number) => {
    reports = reports.filter((r) => r.id !== id);
    return delay(undefined);
  },
};

export const mockExpensesApi = {
  add: (reportId: number, data: ExpenseInput) => {
    const report = findReport(reportId);
    const expense: Expense = {
      id: nextExpenseId++,
      title: data.title,
      amount: data.amount,
      category: data.category,
      expenseDate: data.expenseDate,
      receiptUrl: data.receiptUrl ?? null,
      notes: data.notes ?? null,
      createdAt: new Date().toISOString(),
      expenseReportId: reportId,
    };
    report.expenses.push(expense);
    recalcReportTotal(report);
    return delay(clone(expense));
  },

  update: (id: number, data: ExpenseInput) => {
    const report = reports.find((r) => r.expenses.some((e) => e.id === id));
    if (!report) throw new Error(`Expense ${id} not found`);
    const expense = report.expenses.find((e) => e.id === id)!;
    expense.title = data.title;
    expense.amount = data.amount;
    expense.category = data.category;
    expense.expenseDate = data.expenseDate;
    expense.receiptUrl = data.receiptUrl ?? null;
    expense.notes = data.notes ?? null;
    recalcReportTotal(report);
    return delay(clone(expense));
  },

  remove: (id: number) => {
    const report = reports.find((r) => r.expenses.some((e) => e.id === id));
    if (!report) throw new Error(`Expense ${id} not found`);
    report.expenses = report.expenses.filter((e) => e.id !== id);
    recalcReportTotal(report);
    return delay(undefined);
  },
};

export const mockDashboardApi = {
  stats: () => delay(computeStats()),
};
