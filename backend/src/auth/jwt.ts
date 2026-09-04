import jwt from "jsonwebtoken";

// Dev fallback so the app runs out of the box; set JWT_SECRET in production.
const SECRET = process.env.JWT_SECRET || "labelcheck-dev-secret-change-me";

export type Role = "inspector" | "manufacturer";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, SECRET) as AuthTokenPayload;
}
