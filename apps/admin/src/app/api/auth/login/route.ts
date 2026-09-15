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

async function checkPassword(entered: string, target?: string | null): Promise<boolean> {
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
    const { email, password } = await req.json();
    const identifier = String(email || "").trim().toLowerCase();
    const inputPass = String(password || "").trim();

    if (!identifier || !inputPass) {
      return NextResponse.json(
        { success: false, error: "Please enter your ID and Password." },
        { status: 400 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    // =========================================================================
    // 1. CHECK SUPER ADMIN / PLATFORM ADMIN (User Table)
    // =========================================================================
    let userRecord: any = null;
    try {
      userRecord = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: identifier, mode: "insensitive" } },
            { userId: { equals: identifier, mode: "insensitive" } },
          ],
          isActive: true,
          isDeleted: false,
        },
      });
    } catch (e) {
      console.error("[AUTH_USER_ERR]:", e);
    }

    if (userRecord) {
      const isMatch = await checkPassword(
        inputPass,
        userRecord.passwordHash || userRecord.password
      );

      if (isMatch) {
        const rawRole = String(userRecord.role || "").toUpperCase();
        const isSuperAdmin = rawRole === "SUPER_ADMIN" || rawRole === "SUPERADMIN";

        if (isSuperAdmin) {
          const token = await new SignJWT({
            userId: userRecord.id,
            email: userRecord.email,
            role: "SUPER_ADMIN",
          })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

          const res = NextResponse.json({
            success: true,
            role: "SUPER_ADMIN",
            redirectTo: SUPER_ADMIN_DESTINATION,
            user: {
              id: userRecord.id,
              name: userRecord.name || "Super Admin",
              email: userRecord.email,
              role: "SUPER_ADMIN",
            },
          });

          res.cookies.set("eventqr_session", token, {
            path: "/",
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
          });
          res.cookies.set("eventqr_session_role", "SUPER_ADMIN", {
            path: "/",
            secure: isProduction,
            sameSite: "lax",
          });
          return res;
        } else {
          // Internal staff/general admin without super-admin access
          const token = await new SignJWT({
            userId: userRecord.id,
            email: userRecord.email,
            role: "ADMIN",
          })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

          const res = NextResponse.json({
            success: true,
            role: "ADMIN",
            redirectTo: "/events",
            user: {
              id: userRecord.id,
              name: userRecord.name || "Admin",
              email: userRecord.email,
              role: "ADMIN",
            },
          });

          res.cookies.set("eventqr_session", token, {
            path: "/",
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
          });
          res.cookies.set("eventqr_session_role", "ADMIN", {
            path: "/",
            secure: isProduction,
            sameSite: "lax",
          });
          return res;
        }
      }
    }

    // =========================================================================
    // 2. CHECK STUDIO CLIENT (Client Table)
    // =========================================================================
    let clientRecord: any = null;
    try {
      clientRecord = await (prisma as any).client.findFirst({
        where: {
          OR: [
            { email: { equals: identifier, mode: "insensitive" } },
            { studioSlug: { equals: identifier, mode: "insensitive" } },
            { username: { equals: identifier, mode: "insensitive" } },
          ],
        },
      });
    } catch (e) {
      console.error("[AUTH_CLIENT_ERR]:", e);
    }

    if (clientRecord) {
      const isMatch = await checkPassword(
        inputPass,
        clientRecord.passwordHash || clientRecord.password
      );

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
            name: clientRecord.name || clientRecord.studioName || "Studio Admin",
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
  } catch (err) {
    console.error("[AUTH_FATAL_ERR]:", err);
    return NextResponse.json(
      { success: false, error: "Internal authentication error." },
      { status: 500 }
    );
  }
}