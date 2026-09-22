import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STUDIO_ADMIN" | "VIEWER";
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.status = status;
  }
}

export async function verifyApiAuth(
  req: NextRequest,
  allowedRoles?: Array<"SUPER_ADMIN" | "ADMIN" | "STUDIO_ADMIN" | "VIEWER">
): Promise<AuthenticatedUser> {
  const secretEnv = process.env.JWT_SECRET;
  if (!secretEnv && process.env.NODE_ENV === "production") {
    throw new AuthError("Cryptographic engine misconfigured", 500);
  }
  const secret = new TextEncoder().encode(
    secretEnv || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
  );

  const token =
    req.cookies.get("eventqr_session")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new AuthError("Session missing or unauthenticated", 401);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userRole = String(payload.role || "").toUpperCase() as AuthenticatedUser["role"];

    if (!payload.userId || !userRole) {
      throw new AuthError("Malformed security token", 401);
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      throw new AuthError("Unauthorized role level for this operation", 403);
    }

    return {
      userId: String(payload.userId),
      email: String(payload.email || ""),
      role: userRole,
    };
  } catch (err: any) {
    if (err instanceof AuthError) throw err;
    throw new AuthError("Invalid, tampered, or expired session token", 401);
  }
}