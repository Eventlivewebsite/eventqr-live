import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

// Super admin destination pointed directly to root URL
const SUPER_ADMIN_LIVE_URL =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_URL ||
  "https://eventqr-live-super-admin.vercel.app";

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
    const body = await req.json();
    const identifier = String(body.email || body.identifier || "").trim().toLowerCase();
    const inputPass = String(body.password || "").trim();

    if (!identifier || !inputPass) {
      return NextResponse.json(
        { success: false, error: "Please enter your ID/Email and Password." },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // 1. Super Admin / Regular User Check
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

        const token = await new SignJWT({
          userId: userRecord.id,
          email: userRecord.email,
          role: rawRole,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("7d")
          .sign(JWT_SECRET);

        // Super Admin ko live domain ke root par token ke sath pass karein
        const redirectUrl = isSuper
          ? `${SUPER_ADMIN_LIVE_URL}/?token=${token}`
          : "/events";

        const res = NextResponse.json({
          success: true,
          role: rawRole,
          redirectTo: redirectUrl,
          user: {
            id: userRecord.id,
            name: userRecord.name || userRecord.ownerName || (isSuper ? "Super Admin" : "Admin"),
            email: userRecord.email,
            role: rawRole,
          },
        });

        res.cookies.set("eventqr_session", token, {
          path: "/",
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        res.cookies.set("eventqr_session_role", rawRole, {
          path: "/",
          httpOnly: false,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        return res;
      }
    }

    // 2. Client / Studio Admin Check
    const clientRecord = await prisma.client.findFirst({
      where: {
        OR: [{ email: identifier }, { loginId: identifier }],
        isDeleted: false,
      },
    });

    if (clientRecord && clientRecord.passwordHash) {
      const isMatch = await verifyPassword(inputPass, clientRecord.passwordHash);

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
          maxAge: 60 * 60 * 24 * 7,
        });

        res.cookies.set("eventqr_session_role", "STUDIO_ADMIN", {
          path: "/",
          httpOnly: false,
          secure: isProduction,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        });

        return res;
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid login credentials." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal authentication error." },
      { status: 500 }
    );
  }
}