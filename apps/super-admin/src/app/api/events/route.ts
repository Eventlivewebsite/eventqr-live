import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputLoginId = body?.loginId ? String(body.loginId).trim() : "";
    const password = body?.password ? String(body.password).trim() : "";

    // Input Validation
    if (!inputLoginId || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both Login ID and Password." },
        { status: 400 }
      );
    }

    // Flexible DB Lookup: Check case-insensitive loginId or email
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { loginId: { equals: inputLoginId, mode: "insensitive" } },
          { email: { equals: inputLoginId, mode: "insensitive" } },
        ],
      },
    });

    // Universal 401 response to prevent username enumeration attack
    if (!client || !client.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid Login ID or Password" },
        { status: 401 }
      );
    }

    // Check account status if field exists
    if ("isActive" in client && client.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Account is inactive. Please contact administrator." },
        { status: 403 }
      );
    }

    // Password Comparison
    const isPasswordValid = await bcrypt.compare(password, client.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Login ID or Password" },
        { status: 401 }
      );
    }

    // JWT Configuration & Secret Validation
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error("CRITICAL SECURITY ERROR: JWT_SECRET is missing or too short in .env.");
      return NextResponse.json(
        { success: false, error: "Authentication service is not properly configured." },
        { status: 503 }
      );
    }

    // Safe field fallbacks
    const resolvedCompanyName = client.companyName || client.contactPerson || "Client Workspace";
    const resolvedStorageLimit = client.storageLimitGB ? `${client.storageLimitGB} GB` : "50 GB";

    // JWT Generation
    const token = jwt.sign(
      {
        clientId: client.id,
        companyName: resolvedCompanyName,
        email: client.email,
        role: "CLIENT",
      },
      jwtSecret,
      {
        expiresIn: "7d",
        issuer: "eventqr-live",
        audience: "eventqr-client",
        algorithm: "HS256",
      }
    );

    // Prepare JSON Response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        client: {
          id: client.id,
          companyName: resolvedCompanyName,
          email: client.email,
          storageLimit: resolvedStorageLimit,
        },
      },
      { status: 200 }
    );

    // Secure HttpOnly Cookie Setup
    response.cookies.set({
      name: "client_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;

  } catch (error) {
    console.error("Client Authentication Route Error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication service temporary error." },
      { status: 500 }
    );
  }
}