import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eventqr-super-secure-jwt-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password, portalRole = "SUPER_ADMIN" } = await req.json();

    const cleanIdentifier = String(identifier || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanIdentifier || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Credentials are required" },
        { status: 400 }
      );
    }

    // 1. SUPER ADMIN FLOW
    if (portalRole === "SUPER_ADMIN") {
      const user = await prisma.user.findFirst({
        where: {
          email: cleanIdentifier,
          role: "SUPER_ADMIN",
          isDeleted: false,
        },
      });

      if (!user || !user.passwordHash) {
        return NextResponse.json(
          { success: false, error: "Invalid Super Admin credentials" },
          { status: 401 }
        );
      }

      const isValid = await bcrypt.compare(cleanPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid password" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const res = NextResponse.json({
        success: true,
        role: "SUPER_ADMIN",
        redirectUrl: "/requests",
      });

      res.cookies.set("super_admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
      });

      return res;
    }

    // 2. STUDIO CLIENT FLOW
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { loginId: cleanIdentifier }
        ],
        isDeleted: false,
        isActive: true,
      },
    });

    if (!client || !client.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Studio account not found or inactive" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(cleanPassword, client.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const clientToken = jwt.sign(
      { id: client.id, email: client.email, loginId: client.loginId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      success: true,
      role: "STUDIO_CLIENT",
      token: clientToken,
      redirectUrl: "http://localhost:3002/dashboard",
    });

    // Studio token cookie set
    res.cookies.set("client_token", clientToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    console.error("[UNIFIED_LOGIN_ERR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Authentication failed" },
      { status: 500 }
    );
  }
}