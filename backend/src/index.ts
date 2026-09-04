import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { scanRouter } from "./routes/scan";
import { reportsRouter } from "./routes/reports";
import { authRouter } from "./routes/auth";

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/scan", scanRouter);
app.use("/api/reports", reportsRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`LabelCheck backend listening on http://localhost:${PORT}`);
});
