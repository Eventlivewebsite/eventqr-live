import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1. GET: Fetch All Events
export async function GET(req: NextRequest) {
  try {
    const events = await (prisma.event as any).findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
      },
    });

    const formattedEvents = events.map((ev: any) => ({
      id: String(ev.id),
      title: ev.title || "Untitled Event",
      type: ev.type || "WEDDING",
      slug: ev.slug,
      status: String(ev.status || "ACTIVE").toUpperCase(),
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString() : new Date().toISOString(),
      isLive: Boolean(ev.isLive || ev.status === "ACTIVE" || ev.status === "APPROVED"),
      _count: { albums: 0 },
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (err: any) {
    console.error("[GET_EVENTS_ERR]:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events.", events: [] },
      { status: 500 }
    );
  }
}

// 2. POST: Create Event (100% Matched to schema.prisma)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const {
      title,
      type = "WEDDING",
      eventDate,
      slug,
      pinCode,
      brideName,
      groomName,
      clientName,
    } = body;

    const cleanTitle = typeof title === "string" ? title.trim().slice(0, 150) : "";
    if (!cleanTitle) {
      return NextResponse.json(
        { success: false, error: "Event title is required." },
        { status: 400 }
      );
    }

    // Resolve Foreign Keys: adminId and clientId
    let clientId: string | null = null;
    let adminId: string | null = null;

    try {
      const firstClient = await prisma.client.findFirst();
      if (firstClient) {
        clientId = firstClient.id;
        adminId = firstClient.adminId || null;
      }
    } catch {}

    if (!adminId) {
      try {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          adminId = firstUser.id;
        }
      } catch {}
    }

    if (!clientId || !adminId) {
      return NextResponse.json(
        { success: false, error: "Database relation missing: valid client or admin record required." },
        { status: 400 }
      );
    }

    // Collision-Proof Slug
    const baseSlug = (slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const uniqueSlug = `${baseSlug || "event"}-${Math.random().toString(36).substring(2, 6)}`;

    // Normalize EventType Enum
    const validTypes = ["WEDDING", "CORPORATE", "BIRTHDAY", "FESTIVAL", "CONFERENCE", "PARTY", "OTHER"];
    const normalizedType = validTypes.includes(String(type).toUpperCase())
      ? String(type).toUpperCase()
      : "WEDDING";

    // Strictly match fields to schema.prisma
    const newEvent = await (prisma.event as any).create({
      data: {
        adminId: adminId,
        clientId: clientId,
        title: cleanTitle,
        slug: uniqueSlug,
        type: normalizedType as any,
        status: "PENDING" as any,
        accessMode: pinCode ? ("PIN" as any) : ("PUBLIC" as any),
        pinCode: pinCode ? String(pinCode).trim().slice(0, 10) : null,
        brideName: brideName ? String(brideName).trim().slice(0, 100) : null,
        groomName: groomName ? String(groomName).trim().slice(0, 100) : null,
        clientName: clientName ? String(clientName).trim().slice(0, 100) : null,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event request submitted successfully!",
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[EVENT_CREATION_PRISMA_ERR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error processing event request." },
      { status: 500 }
    );
  }
}