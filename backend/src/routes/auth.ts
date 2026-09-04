import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { db, UserRow } from "../db";
import { Role, signToken } from "../auth/jwt";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)*\.[a-z]{2,}$/i;

function publicUser(row: UserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    organization: row.organization,
  };
}

authRouter.post("/register", async (req, res) => {
  const { name, email, password, role, organization } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    organization?: string;
  };

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password and role are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (role !== "inspector" && role !== "manufacturer") {
    return res.status(400).json({ error: "role must be 'inspector' or 'manufacturer'" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const id = uuid();
  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role, organization, created_at)
     VALUES (@id, @name, @email, @password_hash, @role, @organization, @created_at)`
  ).run({
    id,
    name,
    email,
    password_hash: passwordHash,
    role,
    organization: organization || null,
    created_at: new Date().toISOString(),
  });

  const token = signToken({ sub: id, email, name, role });
  res.status(201).json({ token, user: { id, name, email, role, organization: organization || null } });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  if (!row) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ sub: row.id, email: row.email, name: row.name, role: row.role });
  res.json({ token, user: publicUser(row) });
});

authRouter.get("/me", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user!.sub) as
    | UserRow
    | undefined;
  if (!row) return res.status(404).json({ error: "User not found" });
  res.json({ user: publicUser(row) });
});
