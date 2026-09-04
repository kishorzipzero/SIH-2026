import { Router } from "express";
import { db, ScanRow } from "../db";
import { requireAuth } from "../middleware/auth";

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

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

// List the current user's scans, optionally filtered by mode and/or batch.
reportsRouter.get("/", (req, res) => {
  const { mode, batchId } = req.query;
  let query = "SELECT * FROM scans WHERE user_id = @userId";
  const params: Record<string, any> = { userId: req.user!.sub };

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

// Dashboard summary stats for the current user.
reportsRouter.get("/stats", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user!.sub) as ScanRow[];

  const scans = rows.map(rowToScan);
  const totalScans = scans.length;
  const fullyCompliant = scans.filter((s) => s.summary.fail === 0 && s.summary.unclear === 0).length;
  const withViolations = scans.filter((s) => s.summary.fail > 0).length;
  const totalFails = scans.reduce((sum, s) => sum + s.summary.fail, 0);
  const totalUnclear = scans.reduce((sum, s) => sum + s.summary.unclear, 0);

  const fieldFailCounts: Record<string, number> = {};
  for (const s of scans) {
    for (const f of s.fields) {
      if (f.applicable && f.status === "fail") {
        fieldFailCounts[f.label] = (fieldFailCounts[f.label] || 0) + 1;
      }
    }
  }
  const topViolatedFields = Object.entries(fieldFailCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  res.json({
    totalScans,
    fullyCompliant,
    withViolations,
    totalFails,
    totalUnclear,
    topViolatedFields,
    recentScans: scans.slice(0, 8),
  });
});

// Violation log: only fields that failed or are unclear, across the
// current user's inspector-mode scans.
reportsRouter.get("/violations", (req, res) => {
  const { batchId } = req.query;
  let query = "SELECT * FROM scans WHERE mode = 'inspector' AND user_id = @userId";
  const params: Record<string, any> = { userId: req.user!.sub };
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
  const row = db
    .prepare("SELECT * FROM scans WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user!.sub) as ScanRow | undefined;
  if (!row) return res.status(404).json({ error: "Scan not found" });
  res.json(rowToScan(row));
});
