import { Router } from "express";
import { db, ScanRow } from "../db";

export const reportsRouter = Router();

function rowToScan(row: ScanRow) {
  return {
    scanId: row.id,
    createdAt: row.created_at,
    mode: row.mode,
    batchId: row.batch_id,
    productName: row.product_name,
    productContext: {
      category: row.category,
      origin: row.origin,
      perishable: !!row.perishable,
      hasUnitSalePrice: !!row.has_unit_sale_price,
    },
    imagePath: row.image_path,
    overallConfidence: row.mean_confidence,
    summary: JSON.parse(row.summary_json),
    fields: JSON.parse(row.fields_json),
  };
}

// List all scans, optionally filtered by mode and/or batch.
reportsRouter.get("/", (req, res) => {
  const { mode, batchId } = req.query;
  let query = "SELECT * FROM scans WHERE 1=1";
  const params: Record<string, any> = {};

  if (mode) {
    query += " AND mode = @mode";
    params.mode = mode;
  }
  if (batchId) {
    query += " AND batch_id = @batchId";
    params.batchId = batchId;
  }
  query += " ORDER BY created_at DESC";

  const rows = db.prepare(query).all(params) as ScanRow[];
  res.json(rows.map(rowToScan));
});

// Violation log: only fields that failed or are unclear, across inspector-mode scans.
reportsRouter.get("/violations", (req, res) => {
  const { batchId } = req.query;
  let query = "SELECT * FROM scans WHERE mode = 'inspector'";
  const params: Record<string, any> = {};
  if (batchId) {
    query += " AND batch_id = @batchId";
    params.batchId = batchId;
  }
  query += " ORDER BY created_at DESC";

  const rows = db.prepare(query).all(params) as ScanRow[];
  const violations = rows
    .map(rowToScan)
    .map((scan) => ({
      ...scan,
      fields: scan.fields.filter(
        (f: any) => f.applicable && f.status !== "pass"
      ),
    }))
    .filter((scan) => scan.fields.length > 0);

  res.json(violations);
});

reportsRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM scans WHERE id = ?").get(req.params.id) as
    | ScanRow
    | undefined;
  if (!row) return res.status(404).json({ error: "Scan not found" });
  res.json(rowToScan(row));
});
