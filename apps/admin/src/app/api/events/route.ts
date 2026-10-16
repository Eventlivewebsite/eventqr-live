import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

async function verifyAuth(req: NextRequest) {
  const token =
    req.cookies.get("eventqr_session")?.value ||
    req.cookies.get("admin_token")?.value ||
    req.cookies.get("super_admin_session")?.value;

  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || "eventqr_super_secure_key_2026_production_safe_string_32"
    );
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: (payload.userId as string) || (payload.id as string) || "",
      role: String(payload.role || "").toUpperCase(),
    };
  } catch (err) {
    console.warn("JWT verify warning:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const tokenUserId = auth?.userId || "";
    const userRole = auth?.role || "";

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

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    const body = await req.json().catch(() => ({}));

    let { clientId, title, type, eventDate, expiryDate, retentionDays } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ success: false, message: "Event title is required." }, { status: 400 });
    }

    // 1. Resolve Admin & Client IDs
    let resolvedAdminId = auth?.userId || "";
    let targetClient = null;

    if (clientId && clientId !== "undefined" && clientId !== "null") {
      targetClient = await prisma.client.findFirst({
        where: {
          OR: [{ id: clientId }, { loginId: clientId }, { adminId: clientId }],
          isDeleted: false,
        },
      });
    }

    if (!targetClient && resolvedAdminId) {
      targetClient = await prisma.client.findFirst({
        where: { adminId: resolvedAdminId, isDeleted: false },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!targetClient) {
      targetClient = await prisma.client.findFirst({
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
      });
    }

    if (!targetClient) {
      return NextResponse.json(
        { success: false, message: "No active client found to associate with this event." },
        { status: 400 }
      );
    }

    resolvedAdminId = targetClient.adminId || resolvedAdminId;
    if (!resolvedAdminId) {
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] }, isDeleted: false },
      });
      resolvedAdminId = defaultAdmin?.id || "";
    }

    if (!resolvedAdminId) {
      return NextResponse.json({ success: false, message: "Admin context missing." }, { status: 400 });
    }

    // 2. Generate unique slug
    const cleanTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    let baseSlug = cleanTitle || "event";
    let finalSlug = baseSlug;
    let counter = 1;

    while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      counter++;
      if (counter > 5) break;
    }

    // 3. Status determination based on role
    const eventStatus = auth?.role === "SUPER_ADMIN" ? "ACTIVE" : "PENDING_APPROVAL";

    const parsedEventDate = eventDate ? new Date(eventDate) : new Date();
    const parsedExpiryDate = expiryDate
      ? new Date(expiryDate)
      : new Date(Date.now() + (Number(retentionDays) || 15) * 86400000);

    // 4. Create Event with Default Settings
    const newEvent = await prisma.event.create({
      data: {
        adminId: resolvedAdminId,
        clientId: targetClient.id,
        title: title.trim().slice(0, 150),
        slug: finalSlug,
        type: type || "WEDDING",
        status: eventStatus,
        eventDate: parsedEventDate,
        expiryDate: parsedExpiryDate,
        retentionDays: Math.max(1, Number(retentionDays) || 15),
        settings: {
          create: {
            subtitle: "Forever Begins Today",
            showCountdown: true,
            showHighlights: true,
            showTrending: true,
            showTimeline: true,
            allowDownloads: true,
            allowLikes: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event request submitted successfully.",
      event: newEvent,
    });
  } catch (err: any) {
    console.error("POST_EVENT_ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create event" },
      { status: 500 }
    );
  }
}