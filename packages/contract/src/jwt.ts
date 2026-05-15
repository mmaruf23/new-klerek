import type { JwtPayload } from "jsonwebtoken";

export interface JwtClaims extends JwtPayload {
  readonly store_id?: string;
  readonly sub?: string;
  readonly role?: "superadmin" | "admin" | "user";
}
