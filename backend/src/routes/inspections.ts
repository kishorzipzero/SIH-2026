import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { extractText } from "../ocr/extractText";
import { runComplianceCheck } from "../rules/engine";
import { ProductContext } from "../rules/types";
import { db, InspectionRow } from "../db";
import { requireAuth } from "../middleware/auth";
import { ANGLES, ANGLE_LABELS } from "../inspections/angles";
import { computeImageQuality, flagQualityOutliers } from "../inspections/imageQuality";
import { findDiscrepancies } from "../inspections/consistency";

const uploadDir = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are supported"));
      return;
    }
    cb(null, true);
  },
});

export const inspectionsRouter = Router();
inspectionsRouter.use(requireAuth);

function parseContext(body: Record<string, any>): ProductContext {
  const category = body.category === "food" ? "food" : "non-food";
  const origin = body.origin === "imported" ? "imported" : "domestic";
  const perishable =
    body.perishable !== undefined ? body.perishable === "true" : category === "food";
  const hasUnitSalePrice = body.hasUnitSalePrice === "true";
  return { category, origin, perishable, hasUnitSalePrice };
}

const angleUploadFields = ANGLES.map((a) => ({ name: a, maxCount: 1 }));

inspectionsRouter.post("/multi-angle", upload.fields(angleUploadFields), async (req, res) => {
  try {
    const filesByField = req.files as Record<string, Express.Multer.File[]> | undefined;
    const presentAngles = ANGLES.filter((a) => filesByField?.[a]?.length);

    if (presentAngles.length < 2) {
      return res.status(400).json({ error: "Upload at least 2 angle photos to compare." });
    }

    const ctx = parseContext(req.body);
    const productName = req.body.productName || null;

    const angleResults = await Promise.all(
      presentAngles.map(async (angle) => {
        const file = filesByField![angle][0];
        const [ocr, quality] = await Promise.all([
          extractText(file.path),
          computeImageQuality(file.path),
        ]);
        const report = runComplianceCheck(ocr, ctx);
        return {
          angle,
          label: ANGLE_LABELS[angle],
          imagePath: file.filename,
          overallConfidence: report.overallConfidence,
          summary: report.summary,
          fields: report.fields,
          quality,
        };
      })
    );

    const discrepancies = findDiscrepancies(
      angleResults.map((a) => ({ angle: a.angle, fields: a.fields }))
    );
    const qualityFlags = flagQualityOutliers(
      angleResults.map((a) => ({ angle: a.angle, quality: a.quality }))
    );

    const verdict = discrepancies.length > 0 || qualityFlags.length > 0 ? "review_needed" : "consistent";

    const id = uuid();
    db.prepare(
      `INSERT INTO inspections (id, user_id, created_at, product_name, category, origin, perishable, has_unit_sale_price, verdict, angles_json, discrepancies_json, quality_flags_json)
       VALUES (@id, @user_id, @created_at, @product_name, @category, @origin, @perishable, @has_unit_sale_price, @verdict, @angles_json, @discrepancies_json, @quality_flags_json)`
    ).run({
      id,
      user_id: req.user!.sub,
      created_at: new Date().toISOString(),
      product_name: productName,
      category: ctx.category,
      origin: ctx.origin,
      perishable: ctx.perishable ? 1 : 0,
      has_unit_sale_price: ctx.hasUnitSalePrice ? 1 : 0,
      verdict,
      angles_json: JSON.stringify(angleResults),
      discrepancies_json: JSON.stringify(discrepancies),
      quality_flags_json: JSON.stringify(qualityFlags),
    });

    res.json({
      inspectionId: id,
      productName,
      productContext: ctx,
      verdict,
      angles: angleResults,
      discrepancies,
      qualityFlags,
    });
  } catch (err) {
    console.error("Multi-angle inspection failed", err);
    res.status(500).json({ error: "Inspection failed", detail: (err as Error).message });
  }
});

function rowToInspection(row: InspectionRow) {
  return {
    inspectionId: row.id,
    createdAt: row.created_at,
    productName: row.product_name,
    productContext: {
      category: row.category,
      origin: row.origin,
      perishable: !!row.perishable,
      hasUnitSalePrice: !!row.has_unit_sale_price,
    },
    verdict: row.verdict,
    angles: JSON.parse(row.angles_json),
    discrepancies: JSON.parse(row.discrepancies_json),
    qualityFlags: JSON.parse(row.quality_flags_json),
  };
}

inspectionsRouter.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM inspections WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user!.sub) as InspectionRow[];
  res.json(rows.map(rowToInspection));
});

inspectionsRouter.get("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM inspections WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user!.sub) as InspectionRow | undefined;
  if (!row) return res.status(404).json({ error: "Inspection not found" });
  res.json(rowToInspection(row));
});
