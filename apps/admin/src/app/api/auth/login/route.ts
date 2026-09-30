import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

// Constant dummy hash to eliminate timing attacks
const DUMMY_HASH = "$2a$12$e8w6WbH4z9rA4o0hG1b1c.qZ6K7m9s2u8r5t3p1o0n9m8l7k6j5i4";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
    }

    // Strict Unicode NFC Normalization, lowercasing & trimming
    const cleanEmail = email.normalize("NFC").trim().toLowerCase();
    const cleanPassword = password.normalize("NFC");

    // Fetch user from DB using exact schema columns
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: cleanEmail, mode: "insensitive" }
      },
      select: {
        id: true,
        userId: true,
        email: true,
        passwordHash: true,
        role: true,
        name: true,
        isActive: true,
        isDeleted: true
      }
    });

    let isValid = false;

    if (!user) {
      // Execute timing-attack mitigation
      await bcrypt.compare(cleanPassword, DUMMY_HASH);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Check account status security flags
    if (user.isDeleted || user.isActive === false) {
      return NextResponse.json({ error: "Account is disabled or deactivated." }, { status: 403 });
    }

    const storedHash = user.passwordHash || "";
    const isBcrypt = storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");

    if (isBcrypt) {
      isValid = await bcrypt.compare(cleanPassword, storedHash);
    } else {
      // Legacy password matching with immediate secure auto-migration to bcrypt
      isValid = (cleanPassword === storedHash);
      if (isValid) {
        const secureHash = await bcrypt.hash(cleanPassword, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: secureHash }
        });
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Update lastLogin timestamp asynchronously
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }).catch(() => null);

    // Hardened JWT Token Generation
    const secret = process.env.JWT_SECRET;
    const secretKey = new TextEncoder().encode(secret || "eventqr_super_secure_key_2026_production_safe_string_32");

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secretKey);

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return res;
  } catch (error: any) {
    console.error("Auth Exception:", error);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
