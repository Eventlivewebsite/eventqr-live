import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("eventqr_session")?.value ||
      req.cookies.get("admin_token")?.value ||
      req.cookies.get("super_admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || "eventqr_super_secure_key_2026_production_safe_string_32"
    );
    const { payload } = await jwtVerify(token, secretKey);

    const userId = payload.userId as string;
    const userRole = String(payload.role || "").toUpperCase();

    // Find linked client or user records
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: userId },
          { adminId: userId },
          { loginId: userId },
        ],
      },
    });

    const targetAdminIds = [userId];
    const targetClientIds: string[] = [];

    if (client) {
      targetAdminIds.push(client.adminId);
      targetClientIds.push(client.id);
    }

    const filter: any = {
      isDeleted: false,
    };

    if (userRole !== "SUPER_ADMIN") {
      filter.OR = [
        { adminId: { in: targetAdminIds } },
        ...(targetClientIds.length > 0 ? [{ clientId: { in: targetClientIds } }] : []),
      ];
    }

    const events = await prisma.event.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { photos: true },
        },
      },
    });

    // Frontend compatibility: Return both { events } and { success: true, events }
    return NextResponse.json({
      success: true,
      events: events,
      data: events,
    });
  } catch (err: any) {
    console.error("GET_EVENTS_ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
  }
}
