import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcrypt";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// =======================
// GET CLIENT BY ID
// =======================
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("GET CLIENT BY ID ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load client.",
      },
      { status: 500 }
    );
  }
}

// =======================
// UPDATE CLIENT
// =======================
export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      companyName,
      contactPerson,
      phone,
      email,
      address,
      loginId,
      password,
      storageLimitGB,
      isActive,
    } = body;

    const updateData: Record<string, any> = {};

    if (companyName !== undefined) updateData.companyName = String(companyName).trim();
    if (contactPerson !== undefined) updateData.contactPerson = String(contactPerson).trim();
    if (email !== undefined) updateData.email = String(email).trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
    if (address !== undefined) updateData.address = address ? String(address).trim() : null;
    if (loginId !== undefined) updateData.loginId = String(loginId).trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (storageLimitGB !== undefined) updateData.storageLimitGB = Number(storageLimitGB) || 50;

    if (password && typeof password === "string" && password.trim().length > 0) {
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Client updated successfully.",
      client: updatedClient,
    });
  } catch (error) {
    console.error("UPDATE CLIENT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Update failed.",
      },
      { status: 500 }
    );
  }
}

// =======================
// DELETE CLIENT
// =======================
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE CLIENT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Delete failed.",
      },
      { status: 500 }
    );
  }
}