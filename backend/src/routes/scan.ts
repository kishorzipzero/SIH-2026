import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { extractText } from "../ocr/extractText";
import { runComplianceCheck } from "../rules/engine";
import { ProductContext } from "../rules/types";
import { db } from "../db";

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

export const scanRouter = Router();

function parseContext(body: Record<string, any>): ProductContext {
  const category = body.category === "food" ? "food" : "non-food";
  const origin = body.origin === "imported" ? "imported" : "domestic";
  const perishable =
    body.perishable !== undefined ? body.perishable === "true" : category === "food";
  const hasUnitSalePrice = body.hasUnitSalePrice === "true";
  return { category, origin, perishable, hasUnitSalePrice };
}

scanRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded (field name: image)" });
    }

    const ctx = parseContext(req.body);
    const mode = req.body.mode === "inspector" ? "inspector" : "self-check";
    const batchId = mode === "inspector" ? req.body.batchId || null : null;
    const productName = req.body.productName || null;

    const ocr = await extractText(req.file.path);
    const report = runComplianceCheck(ocr, ctx);

    const id = uuid();
    db.prepare(
      `INSERT INTO scans (id, created_at, mode, batch_id, product_name, category, origin, perishable, has_unit_sale_price, image_path, mean_confidence, summary_json, fields_json)
       VALUES (@id, @created_at, @mode, @batch_id, @product_name, @category, @origin, @perishable, @has_unit_sale_price, @image_path, @mean_confidence, @summary_json, @fields_json)`
    ).run({
      id,
      created_at: new Date().toISOString(),
      mode,
      batch_id: batchId,
      product_name: productName,
      category: ctx.category,
      origin: ctx.origin,
      perishable: ctx.perishable ? 1 : 0,
      has_unit_sale_price: ctx.hasUnitSalePrice ? 1 : 0,
      image_path: req.file.filename,
      mean_confidence: report.overallConfidence,
      summary_json: JSON.stringify(report.summary),
      fields_json: JSON.stringify(report.fields),
    });

    res.json({
      scanId: id,
      mode,
      batchId,
      productContext: ctx,
      ocrText: ocr.fullText,
      overallConfidence: report.overallConfidence,
      summary: report.summary,
      fields: report.fields,
    });
  } catch (err) {
    console.error("Scan failed", err);
    res.status(500).json({ error: "Scan failed", detail: (err as Error).message });
  }
});
