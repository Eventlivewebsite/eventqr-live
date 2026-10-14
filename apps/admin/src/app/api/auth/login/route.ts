import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

const DUMMY_HASH = "$2a$12$e8w6WbH4z9rA4o0hG1b1c.qZ6K7m9s2u8r5t3p1o0n9m8l7k6j5i4";
const DEFAULT_SECRET = "eventqr_super_secure_key_2026_production_safe_string_32";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || (!body.email && !body.loginId) || !body.password) {
      return NextResponse.json({ error: "Email or Login ID and password are required." }, { status: 400 });
    }

    const rawIdentifier = String(body.email || body.loginId || "").trim();
    const cleanPassword = String(body.password || "").normalize("NFC");
    const requestedPortal = String(body.portalRole || "").toUpperCase();
    const cleanIdentifier = rawIdentifier.normalize("NFC").toLowerCase();

    // 1. Search in User table (by email or userId)
    let targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanIdentifier, mode: "insensitive" } },
          { userId: { equals: cleanIdentifier, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        userId: true,
        email: true,
        passwordHash: true,
        role: true,
        name: true,
        isActive: true,
        isDeleted: true,
      },
    });

    let storedHash = targetUser?.passwordHash || "";

    // 2. Agar User me nahi mila ya hash nahi mila, Client table check karein (Super Admin created)
    if (!targetUser || !storedHash) {
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { email: { equals: cleanIdentifier, mode: "insensitive" } },
            { loginId: { equals: cleanIdentifier, mode: "insensitive" } },
          ],
        },
        include: { admin: true },
      });

      if (client) {
        storedHash = client.passwordHash || client.admin?.passwordHash || "";
        targetUser = {
          id: client.admin?.id || client.id,
          userId: client.loginId || client.admin?.userId || client.id,
          email: client.email,
          passwordHash: storedHash,
          role: "ADMIN",
          name: client.contactPerson || client.companyName || "Studio Partner",
          isActive: client.isActive ?? true,
          isDeleted: client.isDeleted ?? false,
        };
      }
    }

    if (!targetUser || !storedHash) {
      await bcrypt.compare(cleanPassword, DUMMY_HASH);
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    if (targetUser.isDeleted || targetUser.isActive === false) {
      return NextResponse.json({ error: "Account is deactivated. Contact Super Admin." }, { status: 403 });
    }

    // Password verification (Bcrypt check)
    const isBcrypt = storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");
    let isValid = false;

    if (isBcrypt) {
      isValid = await bcrypt.compare(cleanPassword, storedHash);
    } else {
      isValid = cleanPassword === storedHash;
      if (isValid) {
        const secureHash = await bcrypt.hash(cleanPassword, 12);
        await prisma.user.updateMany({
          where: { id: targetUser.id },
          data: { passwordHash: secureHash },
        }).catch(() => null);
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const userRole = String(targetUser.role || "ADMIN").toUpperCase();

    // Portal isolation
    if (requestedPortal === "SUPER_ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: This portal is exclusively for Super Admin." },
        { status: 403 }
      );
    }

    if (requestedPortal === "STUDIO_CLIENT" && userRole === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super Admin account detected. Please use the Super Admin tab." },
        { status: 403 }
      );
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_SECRET);

    const token = await new SignJWT({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      name: targetUser.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    const response = NextResponse.json({
      success: true,
      token,
      role: targetUser.role,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
      },
    });

    response.cookies.set("eventqr_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
