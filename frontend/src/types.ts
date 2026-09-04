export type ProductCategory = "food" | "non-food";
export type Origin = "domestic" | "imported";
export type CheckStatus = "pass" | "fail" | "unclear";
export type Role = "inspector" | "manufacturer";

export interface ProductContext {
  category: ProductCategory;
  origin: Origin;
  perishable: boolean;
  hasUnitSalePrice: boolean;
}

export interface FieldResult {
  id: string;
  label: string;
  clauseRef: string;
  applicable: boolean;
  status: CheckStatus;
  extractedValue: string | null;
  confidence: number | null;
  note?: string;
}

export interface ScanSummary {
  pass: number;
  fail: number;
  unclear: number;
  notApplicable: number;
}

export interface ScanResponse {
  scanId: string;
  mode: "self-check" | "inspector";
  batchId: string | null;
  productContext: ProductContext;
  ocrText: string;
  overallConfidence: number;
  summary: ScanSummary;
  fields: FieldResult[];
}

export interface StoredScan extends Omit<ScanResponse, "ocrText"> {
  createdAt: string;
  productName: string | null;
  imagePath: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string | null;
}

export interface DashboardStats {
  totalScans: number;
  fullyCompliant: number;
  withViolations: number;
  totalFails: number;
  totalUnclear: number;
  topViolatedFields: { label: string; count: number }[];
  recentScans: StoredScan[];
}
