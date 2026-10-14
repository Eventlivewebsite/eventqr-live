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

    let tokenUserId = "";
    let userRole = "";

    if (token) {
      try {
        const secretKey = new TextEncoder().encode(
          process.env.JWT_SECRET || "eventqr_super_secure_key_2026_production_safe_string_32"
        );
        const { payload } = await jwtVerify(token, secretKey);
        tokenUserId = (payload.userId as string) || "";
        userRole = String(payload.role || "").toUpperCase();
      } catch (err) {
        console.warn("JWT verify warning:", err);
      }
    }

    const { searchParams } = new URL(req.url);
    const paramClientId = searchParams.get("clientId") || "";

    const searchIds = new Set<string>();
    if (tokenUserId) searchIds.add(tokenUserId);
    if (paramClientId && paramClientId !== "undefined" && paramClientId !== "null") {
      searchIds.add(paramClientId);
    }

    if (searchIds.size > 0) {
      const idArray = Array.from(searchIds);
      const clients = await prisma.client.findMany({
        where: {
          OR: [
            { id: { in: idArray } },
            { adminId: { in: idArray } },
            { loginId: { in: idArray } },
          ],
        },
      });

      for (const c of clients) {
        searchIds.add(c.id);
        if (c.adminId) searchIds.add(c.adminId);
        if (c.loginId) searchIds.add(c.loginId);
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { id: { in: idArray } },
            { userId: { in: idArray } },
          ],
        },
      });

      for (const u of users) {
        searchIds.add(u.id);
        if (u.userId) searchIds.add(u.userId);
      }
    }

    const matchedIds = Array.from(searchIds);

    let whereClause: any = {
      isDeleted: false,
    };

    if (userRole !== "SUPER_ADMIN") {
      if (matchedIds.length > 0) {
        whereClause.OR = [
          { adminId: { in: matchedIds } },
          { clientId: { in: matchedIds } },
        ];
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      events: events,
      data: events,
    });
  } catch (err: any) {
    console.error("GET_EVENTS_FATAL:", err);
    return NextResponse.json({ success: false, events: [], error: err.message }, { status: 500 });
  }
}
