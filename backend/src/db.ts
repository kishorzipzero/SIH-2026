import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "labelcheck.sqlite"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('self-check', 'inspector')),
    batch_id TEXT,
    product_name TEXT,
    category TEXT NOT NULL,
    origin TEXT NOT NULL,
    perishable INTEGER NOT NULL,
    has_unit_sale_price INTEGER NOT NULL,
    image_path TEXT,
    mean_confidence REAL NOT NULL,
    summary_json TEXT NOT NULL,
    fields_json TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_scans_batch ON scans(batch_id);
  CREATE INDEX IF NOT EXISTS idx_scans_mode ON scans(mode);
`);

export interface ScanRow {
  id: string;
  created_at: string;
  mode: "self-check" | "inspector";
  batch_id: string | null;
  product_name: string | null;
  category: string;
  origin: string;
  perishable: number;
  has_unit_sale_price: number;
  image_path: string | null;
  mean_confidence: number;
  summary_json: string;
  fields_json: string;
}
