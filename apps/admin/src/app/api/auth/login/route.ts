import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

const SUPER_ADMIN_DESTINATION =
  process.env.SUPER_ADMIN_URL ||
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "http://localhost:3001/dashboard";

async function verifyPassword(entered: string, target?: string | null): Promise<boolean> {
  if (!entered || !target) return false;
  if (entered === target) return true;
  if (target.startsWith("$2a$") || target.startsWith("$2b$") || target.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(entered, target);
    } catch {
      return false;
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.email || "").trim().toLowerCase();
    const inputPass = String(body.password || "").trim();

    console.log("[LOGIN_ATTEMPT]:", { identifier, passLength: inputPass.length });

    if (!identifier || !inputPass) {
      return NextResponse.json(
        { success: false, error: "Please enter your ID/Email and Password." },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // 1. Check User table
    const userRecord = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userId: identifier }],
        isDeleted: false,
      },
    });

    console.log("[USER_RECORD_FOUND]:", !!userRecord, userRecord?.email);

    if (userRecord) {
      const isMatch = await verifyPassword(inputPass, userRecord.passwordHash);
      console.log("[PASSWORD_MATCH_USER]:", isMatch);

      if (isMatch) {
        const role = userRecord.role || "ADMIN";
        const isSuper = role === "SUPER_ADMIN";
        const redirectUrl = isSuper ? SUPER_ADMIN_DESTINATION : "/events";

        const token = await new SignJWT({
          userId: userRecord.id,
          email: userRecord.email,
          role,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        const res = NextResponse.json({
          success: true,
          role,
          redirectTo: redirectUrl,
          user: {
            id: userRecord.id,
            name: userRecord.name || userRecord.ownerName || "Admin",
            email: userRecord.email,
            role,
          },
        });

        res.cookies.set("eventqr_session", token, {
          path: "/",
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
        });
        res.cookies.set("eventqr_session_role", role, {
          path: "/",
          secure: isProduction,
          sameSite: "lax",
        });
        return res;
      }
    }

    // 2. Check Client table
    const clientRecord = await prisma.client.findFirst({
      where: {
        OR: [{ email: identifier }, { loginId: identifier }],
        isDeleted: false,
      },
    });

    console.log("[CLIENT_RECORD_FOUND]:", !!clientRecord, clientRecord?.email);

    if (clientRecord && clientRecord.passwordHash) {
      const isMatch = await verifyPassword(inputPass, clientRecord.passwordHash);
      console.log("[PASSWORD_MATCH_CLIENT]:", isMatch);

      if (isMatch) {
        const token = await new SignJWT({
          userId: clientRecord.id,
          email: clientRecord.email,
          role: "STUDIO_ADMIN",
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        const res = NextResponse.json({
          success: true,
          role: "STUDIO_ADMIN",
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
        });
        res.cookies.set("eventqr_session_role", "STUDIO_ADMIN", {
          path: "/",
          secure: isProduction,
          sameSite: "lax",
        });
        return res;
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid login credentials." },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("[AUTH_FATAL_ERR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal authentication error." },
      { status: 500 }
    );
  }
}