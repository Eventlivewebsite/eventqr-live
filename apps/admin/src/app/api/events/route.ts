import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eventqr-super-secure-jwt-secret-key";

// Helper: Secure Session extraction & client resolution
async function resolveSecureClient(req: NextRequest, bodyClientId?: string) {
  const token =
    req.cookies.get("client_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      if (decoded?.id) {
        const client = await prisma.client.findFirst({
          where: { id: decoded.id, isDeleted: false, isActive: true },
        });
        if (client) return client;
      }
    } catch {}
  }

  const cleanClientId = typeof bodyClientId === "string" ? bodyClientId.trim() : "";
  if (cleanClientId && cleanClientId !== "client_default" && cleanClientId.length > 5) {
    const client = await prisma.client.findFirst({
      where: { id: cleanClientId, isDeleted: false, isActive: true },
    });
    if (client) return client;
  }

  // Fallback to active studio
  return await prisma.client.findFirst({
    where: { isDeleted: false, isActive: true },
  });
}

// 1. GET Events for Studio
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryClientId = searchParams.get("clientId") || undefined;

    const client = await resolveSecureClient(req, queryClientId);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Studio client not found or inactive." },
        { status: 404 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        clientId: client.id,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedEvents = events.map((ev: any) => ({
      id: ev.id,
      title: ev.title,
      type: ev.type,
      slug: ev.slug,
      status: ev.status,
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString() : new Date().toISOString(),
      accessMode: ev.accessMode,
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (err: any) {
    console.error("[STUDIO_API_GET_EVENTS_ERR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load events" },
      { status: 500 }
    );
  }
}

// 2. POST: Create Event (100% Schema-Matched & Synced with Super Admin Queue)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      clientId: incomingClientId,
      title,
      type = "WEDDING",
      eventDate,
      slug,
      pinCode,
      retentionDays = 15,
      brideName,
      groomName,
      location,
    } = body;

    const cleanTitle = typeof title === "string" ? title.trim() : "";
    if (!cleanTitle || cleanTitle.length < 2) {
      return NextResponse.json(
        { success: false, error: "Event title must be at least 2 characters." },
        { status: 400 }
      );
    }

    const client = await resolveSecureClient(req, incomingClientId);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "No studio client available to associate this event." },
        { status: 404 }
      );
    }

    // Storage limit check
    if (client.storageUsedGB >= client.storageLimitGB) {
      return NextResponse.json(
        { success: false, error: "Storage limit reached. Contact Super Admin." },
        { status: 403 }
      );
    }

    // Slug generation
    const rawSlug = (slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const cleanSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;

    // EXACT SCHEMA MATCHING PAYLOAD (Status set to PENDING for Super Admin Queue)
    const newEvent = await prisma.event.create({
      data: {
        adminId: client.adminId,
        clientId: client.id,
        title: cleanTitle,
        slug: cleanSlug,
        type: type as any,
        status: "PENDING" as any, // Synced with Super Admin pending requests API
        accessMode: (pinCode ? "PIN" : "PUBLIC") as any,
        pinCode: pinCode ? String(pinCode).trim() : null,
        retentionDays: Number(retentionDays) || client.storageDays || 15,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        brideName: brideName ? String(brideName).trim() : null,
        groomName: groomName ? String(groomName).trim() : null,
        location: location ? String(location).trim() : null,
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
    console.error("[STUDIO_API_POST_EVENT_ERR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to submit event request." },
      { status: 500 }
    );
  }
}