import {
  DashboardStats,
  ProductContext,
  Role,
  ScanResponse,
  StoredScan,
  User,
} from "./types";

const TOKEN_KEY = "labelcheck_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(path, { ...init, headers });
}

async function unwrapJson<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${fallbackError} (${res.status})`);
  }
  return res.json();
}

export interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  role: Role;
  organization?: string;
}

export async function register(args: RegisterArgs): Promise<{ token: string; user: User }> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  return unwrapJson(res, "Registration failed");
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return unwrapJson(res, "Login failed");
}

export async function fetchMe(): Promise<{ user: User }> {
  const res = await authedFetch("/api/auth/me");
  return unwrapJson(res, "Failed to load profile");
}

export interface SubmitScanArgs {
  file: File;
  batchId?: string | null;
  productName?: string;
  context: ProductContext;
}

export async function submitScan({
  file,
  batchId,
  productName,
  context,
}: SubmitScanArgs): Promise<ScanResponse> {
  const form = new FormData();
  form.append("image", file);
  if (batchId) form.append("batchId", batchId);
  if (productName) form.append("productName", productName);
  form.append("category", context.category);
  form.append("origin", context.origin);
  form.append("perishable", String(context.perishable));
  form.append("hasUnitSalePrice", String(context.hasUnitSalePrice));

  const res = await authedFetch("/api/scan", { method: "POST", body: form });
  return unwrapJson(res, "Scan failed");
}

export async function fetchViolations(batchId?: string): Promise<StoredScan[]> {
  const qs = batchId ? `?batchId=${encodeURIComponent(batchId)}` : "";
  const res = await authedFetch(`/api/reports/violations${qs}`);
  return unwrapJson(res, "Failed to fetch violation report");
}

export async function fetchStats(): Promise<DashboardStats> {
  const res = await authedFetch("/api/reports/stats");
  return unwrapJson(res, "Failed to fetch dashboard stats");
}

export async function fetchScans(mode?: "self-check" | "inspector"): Promise<StoredScan[]> {
  const qs = mode ? `?mode=${mode}` : "";
  const res = await authedFetch(`/api/reports${qs}`);
  return unwrapJson(res, "Failed to fetch scan history");
}
