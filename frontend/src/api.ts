import { ProductContext, ScanResponse, StoredScan } from "./types";

export interface SubmitScanArgs {
  file: File;
  mode: "self-check" | "inspector";
  batchId?: string | null;
  productName?: string;
  context: ProductContext;
}

export async function submitScan({
  file,
  mode,
  batchId,
  productName,
  context,
}: SubmitScanArgs): Promise<ScanResponse> {
  const form = new FormData();
  form.append("image", file);
  form.append("mode", mode);
  if (batchId) form.append("batchId", batchId);
  if (productName) form.append("productName", productName);
  form.append("category", context.category);
  form.append("origin", context.origin);
  form.append("perishable", String(context.perishable));
  form.append("hasUnitSalePrice", String(context.hasUnitSalePrice));

  const res = await fetch("/api/scan", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Scan failed (${res.status})`);
  }
  return res.json();
}

export async function fetchViolations(batchId?: string): Promise<StoredScan[]> {
  const url = new URL("/api/reports/violations", window.location.origin);
  if (batchId) url.searchParams.set("batchId", batchId);
  const res = await fetch(url.toString().replace(window.location.origin, ""));
  if (!res.ok) throw new Error("Failed to fetch violation report");
  return res.json();
}
