import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const events = await (prisma.event as any).findMany({
      orderBy: { createdAt: "desc" },
    });

    let clientMap: Record<string, any> = {};
    try {
      const clients = await (prisma.client as any).findMany();
      if (Array.isArray(clients)) {
        clients.forEach((c: any) => {
          clientMap[c.id] = c;
        });
      }
    } catch {
      // safe fallback
    }

    const formattedEvents = events.map((ev: any) => {
      const studio = ev.clientId ? clientMap[ev.clientId] : null;

      const rawStatus = String(ev.status || "").trim().toUpperCase();
      
      // Strict normalization
      let finalStatus = "PENDING";
      let isLiveBool = false;

      if (rawStatus === "APPROVED") {
        finalStatus = "APPROVED";
        isLiveBool = true;
      } else if (rawStatus === "REJECTED") {
        finalStatus = "REJECTED";
        isLiveBool = false;
      } else {
        // PENDING_APPROVAL, PENDING ya koi bhi unapproved event
        finalStatus = "PENDING";
        isLiveBool = false;
      }

      return {
        id: String(ev.id),
        name: ev.name || ev.title || "Untitled Event",
        title: ev.title || ev.name || "Untitled Event",
        slug: ev.slug || "",
        type: ev.eventType || ev.type || "WEDDING",
        eventDate: ev.eventDate
          ? new Date(ev.eventDate).toISOString()
          : new Date().toISOString(),
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
        error: error?.message || "Internal server error fetching queue",
        events: [],
      },
      { status: 500 }
    );
  }
}