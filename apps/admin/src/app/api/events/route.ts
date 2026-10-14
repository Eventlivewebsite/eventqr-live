import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Session token read karein (support both cookie names)
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
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    // 2. Build filter according to exact Prisma schema fields
    const filter: any = {
      isDeleted: false,
    };

    if (userRole !== "SUPER_ADMIN") {
      // Find associated client record if userId is a client ID or admin ID
      const client = await prisma.client.findFirst({
        where: {
          OR: [
            { id: userId },
            { adminId: userId },
            { loginId: userId },
          ],
        },
      });

      const matchedClientIds = client ? [client.id] : [];
      const matchedAdminIds = client ? [client.adminId, userId] : [userId];

      filter.OR = [
        { adminId: { in: matchedAdminIds } },
        ...(matchedClientIds.length > 0 ? [{ clientId: { in: matchedClientIds } }] : []),
      ];
    }

    if (activeOnly) {
      filter.status = "ACTIVE";
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

    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    console.error("GET_EVENTS_ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
  }
}
