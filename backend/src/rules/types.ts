export type ProductCategory = "food" | "non-food";
export type Origin = "domestic" | "imported";
export type CheckStatus = "pass" | "fail" | "unclear";

export interface ProductContext {
  category: ProductCategory;
  origin: Origin;
  /** Perishable/time-sensitive goods require a best-before or use-by date. Defaults to true for food. */
  perishable: boolean;
  /** Loose-equivalent pricing (e.g. sold by weight cut from a larger pack) requires a unit sale price. */
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
