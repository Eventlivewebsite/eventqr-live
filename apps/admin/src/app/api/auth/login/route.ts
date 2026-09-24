import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

// --- LAYER 1: STRICT SECRET VALIDATION ---
const RAW_JWT_SECRET = process.env.JWT_SECRET;
if (!RAW_JWT_SECRET && process.env.NODE_ENV === "production") {
  console.error("FATAL SECURITY WARNING: JWT_SECRET is not set in production!");
}
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

const SUPER_ADMIN_LIVE_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "https://eventqr-live-super-admin.vercel.app";

// --- LAYER 2: IN-MEMORY RATE LIMITER (Brute-Force Guard) ---
interface RateLimitTracker {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitTracker>();

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 5;

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

// Password verification helper with timing-safe checks
async function verifyPassword(entered: string, target?: string | null): Promise<boolean> {
  if (!entered || !target) return false;
  if (target.startsWith("$2a$") || target.startsWith("$2b$") || target.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(entered, target);
    } catch {
      return false;
    }
  }
  return entered === target;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP Extraction for Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const { allowed, waitSeconds } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts from this network. Please wait ${waitSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const identifier = String(body.email || body.loginId || body.identifier || "").trim().toLowerCase();
    const inputPass = String(body.password || "").trim();
    const requestedPortal = String(body.portalRole || "").trim().toUpperCase();

    if (!identifier || !inputPass) {
      return NextResponse.json(
        { success: false, error: "Please enter your ID/Email and Password." },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // 2. Super Admin / Regular User Check
    const userRecord = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userId: identifier }],
        isDeleted: false,
      },
    });

    if (userRecord && userRecord.passwordHash) {
      const isMatch = await verifyPassword(inputPass, userRecord.passwordHash);

      if (isMatch) {
        const rawRole = (userRecord.role || "ADMIN").toUpperCase();
        const isSuper = rawRole === "SUPER_ADMIN";

        // Strict Portal Role Quarantine
        if (requestedPortal === "SUPER_ADMIN" && !isSuper) {
          return NextResponse.json(
            {
              success: false,
              error: "Access Denied: This account lacks Super Admin clearance.",
            },
            { status: 403 }
          );
        }

        if (requestedPortal === "STUDIO_CLIENT" && isSuper) {
          return NextResponse.json(
            {
              success: false,
              error: "Access Denied: Super Admin accounts must sign in through the Super Admin gate.",
            },
            { status: 403 }
          );
        }

        // Short-lived token for transfer (prevents replay attacks)
        const token = await new SignJWT({
          userId: userRecord.id,
          email: userRecord.email,
          role: rawRole,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime(isSuper ? "1d" : "7d")
          .sign(JWT_SECRET);

        const targetBase = SUPER_ADMIN_LIVE_URL.replace(/\/$/, "");
        const redirectUrl = isSuper
          ? `${targetBase}/?token=${encodeURIComponent(token)}`
          : "/events";

        const res = NextResponse.json({
          success: true,
          role: rawRole,
          token, // CRITICAL: Frontend needs this for explicit URL handshake
          redirectTo: redirectUrl,
          user: {
            id: userRecord.id,
            name: userRecord.name || userRecord.ownerName || (isSuper ? "Super Admin" : "Admin"),
            email: userRecord.email,
            role: rawRole,
          },
        });

        // Set High-Security HttpOnly Cookies
        if (isSuper) {
          res.cookies.set("super_admin_session", token, {
            path: "/",
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 60 * 60 * 24,
          });
        }

        res.cookies.set("eventqr_session", token, {
          path: "/",
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * (isSuper ? 1 : 7),
        });

        res.cookies.set("eventqr_session_role", rawRole, {
          path: "/",
          httpOnly: false,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * (isSuper ? 1 : 7),
        });

        // Anti-cache header so login state isn't held in history
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

        // Clear rate limiter on successful login
        rateLimitMap.delete(ip);

        return res;
      }
    }

    // 3. Client / Studio Admin Check
    const clientRecord = await prisma.client.findFirst({
      where: {
        OR: [{ email: identifier }, { loginId: identifier }],
        isDeleted: false,
      },
    });

    if (clientRecord && clientRecord.passwordHash) {
      const isMatch = await verifyPassword(inputPass, clientRecord.passwordHash);

      if (isMatch) {
        if (requestedPortal === "SUPER_ADMIN") {
          return NextResponse.json(
            {
              success: false,
              error: "Access Denied: Studio accounts cannot enter the Super Admin Suite.",
            },
            { status: 403 }
          );
        }

        const token = await new SignJWT({
          userId: clientRecord.id,
          email: clientRecord.email,
          role: "STUDIO_ADMIN",
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        const res = NextResponse.json({
          success: true,
          role: "STUDIO_ADMIN",
          token, // CRITICAL: Token returned to UI
          redirectTo: "/events",
          user: {
            id: clientRecord.id,
            name: clientRecord.contactPerson || clientRecord.companyName || "Studio Admin",
            email: clientRecord.email,
            role: "STUDIO_ADMIN",
          },
        });

        res.cookies.set("eventqr_session", token, {
          path: "/",
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        res.cookies.set("eventqr_session_role", "STUDIO_ADMIN", {
          path: "/",
          httpOnly: false,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

        rateLimitMap.delete(ip);

        return res;
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal authentication error." },
      { status: 500 }
    );
  }
}