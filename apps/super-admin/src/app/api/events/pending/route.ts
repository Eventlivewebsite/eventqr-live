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
    const token =
      req.cookies.get("super_admin_session")?.value ||
      req.cookies.get("super_admin_token")?.value ||
      req.cookies.get("eventqr_session")?.value ||
      req.cookies.get("admin_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Unauthenticated session.", events: [] },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = String(payload.role || "").toUpperCase();

      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Super Admin clearance required.", events: [] },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid token.", events: [] },
        { status: 401 }
      );
    }

    const events = await (prisma.event as any).findMany({
      include: {
        client: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedEvents = events.map((ev: any) => {
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
        finalStatus = "PENDING"; // Covers PENDING_APPROVAL and DRAFT
        isLiveBool = false;
      }

      return {
        id: String(ev.id),
        name: ev.title || "Untitled Event",
        title: ev.title || "Untitled Event",
        slug: ev.slug || "",
        type: ev.type || "WEDDING",
        eventDate: ev.eventDate
          ? new Date(ev.eventDate).toISOString()
          : new Date().toISOString(),
        retentionDays: 15,
        storageExpiryDate: null,
        status: finalStatus,
        isLive: isLiveBool,
        photosCount: 0,
        createdAt: ev.createdAt
          ? new Date(ev.createdAt).toISOString()
          : new Date().toISOString(),
        client: {
          id: ev.clientId || "default-studio",
          name: ev.client?.companyName || ev.client?.name || ev.clientName || "Studio Partner",
          email: ev.client?.email || "studio@eventqr.live",
          phone: ev.client?.phone || "N/A",
        },
      };
    });

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Internal server error fetching approval queue.", events: [] },
      { status: 500 }
    );
  }
}