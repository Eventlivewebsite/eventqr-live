import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireSuperAdmin } from "@/lib/super-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// =======================
// UPDATE CLIENT
// =======================

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth.response) return auth.response;

    const { id } = await params;

    const body = await req.json();

    const {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      plan,
      loginId,
      password,
      isActive,
      storageLimitGB,
    } = body;

    const updateData = {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      plan,
      loginId,
      isActive,
      ...(storageLimitGB !== undefined ? { storageLimitGB: Number(storageLimitGB) } : {}),
    } as {
      companyName?: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
      address?: string | null;
      plan?: string;
      loginId?: string | null;
      isActive?: boolean;
      storageLimitGB?: number;
      passwordHash?: string;
    };

    if (password && password.trim() !== "") {
      if (password.length < 12) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 12 characters long." },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, message: "Client not found." },
        { status: 404 }
      );
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        adminId: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        plan: true,
        loginId: true,
        storageDays: true,
        storageLimitGB: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client updated successfully.",
      client,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Update failed.",
      },
      {
        status: 500,
      }
    );
  }
}
export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth.response) return auth.response;

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        adminId: true,
        companyName: true,
        contactPerson: true,
        email: true,
        phone: true,
        address: true,
        plan: true,
        loginId: true,
        storageDays: true,
        storageLimitGB: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load client.",
      },
      {
        status: 500,
      }
    );
  }
}
// =======================
// DELETE CLIENT
// =======================

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth.response) return auth.response;

    const { id } = await params;

    await prisma.client.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}