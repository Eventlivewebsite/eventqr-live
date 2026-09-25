import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const events = await (prisma.event as any).findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });

    const formattedEvents = events.map((ev: any) => ({
      id: String(ev.id),
      title: ev.title || "Untitled Event",
      type: ev.type || "WEDDING",
      slug: ev.slug,
      status: String(ev.status || "ACTIVE").toUpperCase(),
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString() : new Date().toISOString(),
      isLive: Boolean(ev.status === "ACTIVE" || ev.status === "APPROVED"),
      _count: { albums: 0 },
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch events.", events: [] },
      { status: 500 }
    );
  }
}

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

    const firstClient = await prisma.client.findFirst();
    const firstUser = await prisma.user.findFirst();

    const clientId = firstClient ? firstClient.id : null;
    const adminId = firstClient?.adminId || firstUser?.id || null;

    if (!clientId || !adminId) {
      return NextResponse.json(
        { success: false, error: "Missing Client or Admin association in database." },
        { status: 400 }
      );
    }

    const baseSlug = (slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const uniqueSlug = `${baseSlug || "event"}-${Math.random().toString(36).substring(2, 6)}`;

    // Exact EventType Enum Mapping
    const validEventTypes = [
      "WEDDING",
      "BIRTHDAY",
      "ENGAGEMENT",
      "ANNIVERSARY",
      "BABY_SHOWER",
      "CORPORATE",
      "CUSTOM",
      "OTHER",
    ];
    const rawType = String(type).toUpperCase();
    const finalType = validEventTypes.includes(rawType) ? rawType : "OTHER";

    // Exact AccessMode Enum Mapping (PUBLIC or PRIVATE only)
    const finalAccessMode = pinCode ? "PRIVATE" : "PUBLIC";

    // 100% Schema-Compliant Event Creation
    const newEvent = await (prisma.event as any).create({
      data: {
        adminId: adminId,
        clientId: clientId,
        title: cleanTitle,
        slug: uniqueSlug,
        type: finalType as any,
        status: "PENDING_APPROVAL" as any, // Exact Enum Value
        accessMode: finalAccessMode as any, // Exact Enum Value
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
        message: "Event request submitted successfully! Super Admin approval is pending.",
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