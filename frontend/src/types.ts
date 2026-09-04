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

export const ANGLES = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
  "diagonal_1",
  "diagonal_2",
] as const;

export type AngleId = (typeof ANGLES)[number];

export const ANGLE_LABELS: Record<AngleId, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
  top: "Top",
  bottom: "Bottom",
  diagonal_1: "Diagonal view 1",
  diagonal_2: "Diagonal view 2",
};

export interface ImageQualityMetrics {
  meanBrightness: number;
  contrast: number;
  width: number;
  height: number;
}

export interface AngleResult {
  angle: AngleId;
  label: string;
  imagePath: string;
  overallConfidence: number;
  summary: ScanSummary;
  fields: FieldResult[];
  quality: ImageQualityMetrics;
}

export interface FieldDiscrepancy {
  fieldId: string;
  label: string;
  clauseRef: string;
  valuesByAngle: { angle: AngleId; rawValue: string }[];
}

export interface QualityFlag {
  angle: AngleId;
  reason: string;
}

export interface InspectionResponse {
  inspectionId: string;
  productName: string | null;
  productContext: ProductContext;
  verdict: "consistent" | "review_needed";
  angles: AngleResult[];
  discrepancies: FieldDiscrepancy[];
  qualityFlags: QualityFlag[];
}

export interface StoredInspection extends InspectionResponse {
  createdAt: string;
}
