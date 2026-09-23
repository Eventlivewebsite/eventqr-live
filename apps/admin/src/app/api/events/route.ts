import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

// Cryptographic Secret Engine
const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

// Helper: Secure Session Extraction (No Blind Fallbacks / Anti-Impersonation)
async function resolveAuthenticatedClient(req: NextRequest) {
  const token =
    req.cookies.get("eventqr_session")?.value ||
    req.cookies.get("client_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = String(payload.userId || payload.id || "");
    const role = String(payload.role || "").toUpperCase();

    if (!userId) return null;

    // 1. Agar Studio Client hai toh client table se fetch karein
    if (role === "STUDIO_ADMIN" || role === "CLIENT") {
      return await prisma.client.findFirst({
        where: { id: userId, isDeleted: false, isActive: true },
      });
    }

    // 2. Agar regular Admin ya Super Admin hai
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      const user = await prisma.user.findFirst({
        where: { id: userId, isDeleted: false },
      });

      if (!user) return null;

      // Studio Admin associate client search
      return await prisma.client.findFirst({
        where: { adminId: user.id, isDeleted: false, isActive: true },
      });
    }

    return null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 1. GET: Fetch Events for the Authenticated Studio
// -------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const client = await resolveAuthenticatedClient(req);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Unauthenticated studio session." },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      where: {
        clientId: client.id,
        isDeleted: false,
      },
      include: {
        _count: {
          select: { albums: true },
        },
        settings: true,
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
      retentionDays: ev.retentionDays || 15,
      isLive: Boolean(ev.isLive),
      _count: ev._count,
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (err: any) {
    console.error("[SECURE_API_GET_EVENTS_ERR]:", err);
    return NextResponse.json(
      { success: false, error: "Internal processing error while fetching events." },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// 2. POST: Create Event Request (Strict Validation & Anti-Tamper)
// -------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const client = await resolveAuthenticatedClient(req);

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Authorized studio account required." },
        { status: 401 }
      );
    }

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
      expiryDate,
      slug,
      pinCode,
      retentionDays = 15,
      brideName,
      groomName,
      location,
    } = body;

    // Strict Input Validation & Boundaries
    const cleanTitle = typeof title === "string" ? title.trim().slice(0, 150) : "";
    if (!cleanTitle || cleanTitle.length < 2) {
      return NextResponse.json(
        { success: false, error: "Event title must be between 2 and 150 characters." },
        { status: 400 }
      );
    }

    if (!eventDate) {
      return NextResponse.json(
        { success: false, error: "Event start date is required." },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(eventDate);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid event date format." },
        { status: 400 }
      );
    }

    // Storage Capacity Enforcement
    if (client.storageUsedGB >= client.storageLimitGB) {
      return NextResponse.json(
        { success: false, error: "Storage quota reached. Please contact Super Admin to upgrade storage." },
        { status: 403 }
      );
    }

    // Storage Retention Days & Expiry Calculation
    let chosenRetention = Number(retentionDays);
    if (isNaN(chosenRetention) || chosenRetention < 1) {
      chosenRetention = 15;
    }

    let calculatedExpiryDate: Date;
    if (expiryDate) {
      calculatedExpiryDate = new Date(expiryDate);
      if (isNaN(calculatedExpiryDate.getTime()) || calculatedExpiryDate < scheduledDate) {
        calculatedExpiryDate = new Date(scheduledDate);
        calculatedExpiryDate.setDate(scheduledDate.getDate() + chosenRetention);
      }
    } else {
      calculatedExpiryDate = new Date(scheduledDate);
      calculatedExpiryDate.setDate(scheduledDate.getDate() + chosenRetention);
    }

    // Safe Slug Generation with Collision Resistance
    const baseSlug = (slug || cleanTitle)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
    const uniqueSlug = `${baseSlug || "event"}-${Math.random().toString(36).substring(2, 6)}${Date.now().toString().slice(-4)}`;

    // Database Write (Atomic Event Creation with Settings Bundled)
    const newEvent = await prisma.event.create({
      data: {
        adminId: client.adminId,
        clientId: client.id,
        title: cleanTitle,
        slug: uniqueSlug,
        type: type as any,
        status: "PENDING_APPROVAL" as any,
        isLive: false, // Strictly false until approved by Super Admin
        accessMode: pinCode ? ("PIN" as any) : ("PUBLIC" as any),
        pinCode: pinCode ? String(pinCode).trim().slice(0, 10) : null,
        retentionDays: chosenRetention,
        eventDate: scheduledDate,
        brideName: brideName ? String(brideName).trim().slice(0, 100) : null,
        groomName: groomName ? String(groomName).trim().slice(0, 100) : null,
        location: location ? String(location).trim().slice(0, 200) : null,
        settings: {
          create: {
            subtitle: "Forever Begins Today",
            allowDownloads: true,
            allowLikes: true,
            customSettings: JSON.stringify({
              storageExpiryDate: calculatedExpiryDate.toISOString(),
              retentionDays: chosenRetention,
              liveFromDate: scheduledDate.toISOString(),
            }),
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event request submitted successfully! Super Admin approval is pending.",
        event: {
          id: newEvent.id,
          title: newEvent.title,
          slug: newEvent.slug,
          eventDate: newEvent.eventDate,
          retentionDays: newEvent.retentionDays,
          status: newEvent.status,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[SECURE_API_POST_EVENT_ERR]:", err);
    return NextResponse.json(
      { success: false, error: "Internal error processing event request." },
      { status: 500 }
    );
  }
}