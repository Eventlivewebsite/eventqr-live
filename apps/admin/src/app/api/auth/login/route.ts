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
    if (!body || !body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid credentials format." }, { status: 400 });
    }

    const cleanEmail = email.normalize("NFC").trim().toLowerCase();
    const cleanPassword = password.normalize("NFC");

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
      await bcrypt.compare(cleanPassword, DUMMY_HASH);
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.isDeleted || user.isActive === false) {
      return NextResponse.json({ error: "Account is disabled or deactivated." }, { status: 403 });
    }

    const storedHash = user.passwordHash || "";
    const isBcrypt = storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$");

    if (isBcrypt) {
      isValid = await bcrypt.compare(cleanPassword, storedHash);
    } else {
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

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }).catch(() => null);

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_SECRET);

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
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

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    };

    // Set both cookies so middleware and frontend components both work seamlessly
    res.cookies.set("eventqr_session", token, cookieOptions);
    res.cookies.set("admin_token", token, cookieOptions);
    res.cookies.set("eventqr_session_role", user.role, {
      ...cookieOptions,
      httpOnly: false
    });

    return res;
  } catch (error: any) {
    console.error("Auth Exception:", error);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
