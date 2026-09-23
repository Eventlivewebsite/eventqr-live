import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

export async function GET(req: NextRequest) {
  try {
    // 1. Strict Server-Side Super Admin Authentication Check
    const token =
      req.cookies.get("eventqr_session")?.value ||
      req.cookies.get("admin_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Unauthenticated session." },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = String(payload.role || "").toUpperCase();

      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.json(
          { success: false, error: "Access Forbidden: Super Admin clearance required." },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    // 2. Fetch Events with Settings and Client Relations Safely
    const events = await (prisma.event as any).findMany({
      where: { isDeleted: false },
      include: {
        settings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let clientMap: Record<string, any> = {};
    try {
      const clients = await (prisma.client as any).findMany({
        where: { isDeleted: false },
      });
      if (Array.isArray(clients)) {
        clients.forEach((c: any) => {
          clientMap[c.id] = c;
        });
      }
    } catch {
      // Safe fallback if client fetch fails
    }

    const formattedEvents = events.map((ev: any) => {
      const studio = ev.clientId ? clientMap[ev.clientId] : null;
      const rawStatus = String(ev.status || "").trim().toUpperCase();

      let finalStatus = "PENDING";
      let isLiveBool = false;

      if (rawStatus === "APPROVED" || rawStatus === "ACTIVE") {
        finalStatus = "APPROVED";
        isLiveBool = true;
      } else if (rawStatus === "REJECTED") {
        finalStatus = "REJECTED";
        isLiveBool = false;
      } else {
        finalStatus = "PENDING";
        isLiveBool = false;
      }

      // Parse Custom Settings for Storage Retention and Expiry Date
      let customSettings: any = {};
      try {
        if (ev.settings?.customSettings) {
          customSettings = JSON.parse(ev.settings.customSettings);
        }
      } catch {
        customSettings = {};
      }

      return {
        id: String(ev.id),
        name: ev.title || ev.name || "Untitled Event",
        title: ev.title || ev.name || "Untitled Event",
        slug: ev.slug || "",
        type: ev.eventType || ev.type || "WEDDING",
        eventDate: ev.eventDate
          ? new Date(ev.eventDate).toISOString()
          : new Date().toISOString(),
        retentionDays: ev.retentionDays || customSettings.retentionDays || 15,
        storageExpiryDate: customSettings.storageExpiryDate || null,
        status: finalStatus,
        isLive: isLiveBool,
        photosCount: 0,
        createdAt: ev.createdAt
          ? new Date(ev.createdAt).toISOString()
          : new Date().toISOString(),
        client: {
          id: ev.clientId || studio?.id || "default-studio",
          name:
            studio?.companyName ||
            studio?.name ||
            studio?.loginId ||
            "Wasim Studio",
          email: studio?.email || "wasim@gmail.com",
          phone: studio?.phone || "N/A",
        },
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
    });
  } catch (error: any) {
    console.error("[PENDING_EVENTS_500_CRASH]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error fetching approval queue.",
        events: [],
      },
      { status: 500 }
    );
  }
}