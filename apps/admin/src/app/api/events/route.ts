import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const events = await (prisma.event as any).findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });

    const formattedEvents = events.map((ev: any) => {
      const currentStatus = String(ev.status || "PENDING").toUpperCase();
      const isRejected = currentStatus === "REJECTED";
      const isApprovedOrActive = (currentStatus === "ACTIVE" || currentStatus === "APPROVED") && !isRejected;

      return {
        id: String(ev.id),
        title: ev.title || "Untitled Event",
        type: ev.type || "WEDDING",
        slug: ev.slug,
        status: currentStatus,
        eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString() : new Date().toISOString(),
        isLive: Boolean(isApprovedOrActive && ev.isLive !== false),
        _count: { albums: 0 },
      };
    });

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

    const finalSlug = slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);

    const newEvent = await (prisma.event as any).create({
      data: {
        title: cleanTitle,
        type: String(type || "WEDDING").toUpperCase(),
        slug: finalSlug,
        status: "PENDING",
        isLive: false,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        customMap: {
          pinCode: pinCode || "",
          brideName: brideName || "",
          groomName: groomName || "",
          clientName: clientName || "",
        },
      },
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error("Create event error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create event." },
      { status: 500 }
    );
  }
}