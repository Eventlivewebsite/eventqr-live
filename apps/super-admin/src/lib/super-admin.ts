import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPER_ADMIN_JWT_SECRET || process.env.JWT_SECRET || "eventqr-super-admin-secure-key-2026"
);

export interface SuperAdminJWTPayload {
  userId: string;
  email: string;
  role: string;
}

// 1. Create Super Admin JWT Token
export async function createSuperAdminToken(payload: SuperAdminJWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// 2. Verify Super Admin JWT Token (Used in Middleware)
export async function verifySuperAdminToken(token: string): Promise<SuperAdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SuperAdminJWTPayload;
  } catch {
    return null;
  }
}