// Tipos espejo de los DTOs del backend (dto/*.kt)

export type Role = "EMPLOYEE" | "MANAGER" | "ADMIN";
export type ReportStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type ExpenseCategory = "TRANSPORT" | "ACCOMMODATION" | "MEALS" | "OTHER";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  expenseReportId: number;
}

export interface ExpenseReport {
  id: number;
  title: string;
  description: string;
  status: ReportStatus;
  totalAmount: number;
  submittedAt: string | null;
  createdAt: string;
  user: User;
  expenses: Expense[];
}

export interface DashboardStats {
  totalExpenses: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  draftReports: number;
  totalUsers: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  expensesByMonth: { month: string; total: number }[];
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  receiptUrl?: string | null;
  notes?: string | null;
}
