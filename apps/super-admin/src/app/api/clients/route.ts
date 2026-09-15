import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

// GET ALL CLIENTS
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { events: true } },
      },
    });

    return NextResponse.json({ success: true, clients: clients || [] });
  } catch (error: any) {
    console.error("GET CLIENTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load clients" },
      { status: 500 }
    );
  }
}

// POST CREATE CLIENT
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email address is required." },
        { status: 400 }
      );
    }

    const companyName = String(body.companyName || "Studio Partner").trim();
    const contactPerson = String(body.contactPerson || companyName).trim();
    const phone = String(body.phone || "").trim() || `91${Date.now().toString().slice(-10)}`;
    const loginId = String(body.loginId || "").trim().toLowerCase() || `${email.split("@")[0]}_${Math.floor(100 + Math.random() * 900)}`;
    const rawPassword = String(body.password || "studio123").trim();
    const storageLimitGB = Number(body.storageLimitGB) || 50;

    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // 1. Pre-check if client loginId or User unique fields already clash
    const existingClient = await prisma.client.findFirst({
      where: {
        OR: [{ email }, { loginId }],
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, message: "Client with this email or login ID already exists." },
        { status: 400 }
      );
    }

    // 2. Safely create or find User, then attach to Client via Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: {
          OR: [{ email }, { userId: loginId }, { phone }],
        },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            userId: loginId,
            name: contactPerson,
            ownerName: contactPerson,
            companyName: companyName,
            email: email,
            phone: phone,
            passwordHash: passwordHash,
            role: "ADMIN",
            isActive: true,
          },
        });
      }

      const client = await tx.client.create({
        data: {
          adminId: user.id,
          companyName: companyName,
          contactPerson: contactPerson,
          email: email,
          phone: phone,
          address: body.address ? String(body.address) : null,
          loginId: loginId,
          passwordHash: passwordHash,
          plan: "PREMIUM",
          storageLimitGB: storageLimitGB,
          storageDays: 15,
          isActive: true,
        },
      });

      return { user, client };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Studio registered successfully!",
        client: result.client,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("SERVER ONBOARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal database query failed",
      },
      { status: 500 }
    );
  }
}

// PUT UPDATE CLIENT & LINKED USER CREDENTIALS
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Client ID is required for updating." },
        { status: 400 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: { admin: true },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    const companyName = body.companyName !== undefined ? String(body.companyName).trim() : existingClient.companyName;
    const contactPerson = body.contactPerson !== undefined ? String(body.contactPerson).trim() : existingClient.contactPerson;
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : existingClient.email;
    const phone = body.phone !== undefined ? String(body.phone).trim() : existingClient.phone;
    const loginId = body.loginId !== undefined ? String(body.loginId).trim().toLowerCase() : existingClient.loginId;
    const address = body.address !== undefined ? String(body.address).trim() : existingClient.address;
    const storageLimitGB = body.storageLimitGB !== undefined ? Number(body.storageLimitGB) : existingClient.storageLimitGB;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : existingClient.isActive;

    // Check if new email or loginId clashes with another client
    if (email !== existingClient.email || loginId !== existingClient.loginId) {
      const conflict = await prisma.client.findFirst({
        where: {
          id: { not: id },
          OR: [{ email }, { loginId: loginId || undefined }],
        },
      });

      if (conflict) {
        return NextResponse.json(
          { success: false, message: "Email or Login ID already taken by another client." },
          { status: 409 }
        );
      }
    }

    // Password handling: Hash only if a new non-empty password is provided
    let newPasswordHash = existingClient.passwordHash;
    if (body.password && String(body.password).trim().length > 0) {
      newPasswordHash = await bcrypt.hash(String(body.password).trim(), 10);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Client record
      const client = await tx.client.update({
        where: { id },
        data: {
          companyName,
          contactPerson,
          email,
          phone,
          address,
          loginId,
          passwordHash: newPasswordHash,
          storageLimitGB,
          isActive,
        },
      });

// 2. Sync credentials with linked Admin User record
      if (existingClient.adminId) {
        await tx.user.update({
          where: { id: existingClient.adminId },
          data: {
            name: contactPerson,
            ownerName: contactPerson,
            companyName,
            email,
            phone,
            userId: loginId || existingClient.admin?.userId || client.id,
            // Agar newPasswordHash null/empty ho toh user ka existing hash safe rahe
            ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
            isActive,
          },
        });
      }

      return client;
    });

    return NextResponse.json({
      success: true,
      message: "Client credentials updated successfully!",
      client: updated,
    });
  } catch (error: any) {
    console.error("SERVER UPDATE CLIENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE CLIENT
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Client ID is required." },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.client.delete({ where: { id } });
      if (client.adminId) {
        await tx.user.delete({ where: { id: client.adminId } }).catch(() => null);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully!",
    });
  } catch (error: any) {
    console.error("SERVER DELETE CLIENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete client" },
      { status: 500 }
    );
  }
}