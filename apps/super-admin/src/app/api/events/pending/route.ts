import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Strict TypeScript Interfaces (Zero `any` used)
interface ClientData {
  id?: string;
  companyName?: string | null;
  name?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
}

interface EventPendingRecord {
  id: string;
  name?: string | null;
  slug?: string | null;
  eventDate?: Date | string | null;
  status?: string | null;
  isLive?: boolean | null;
  createdAt?: Date | string | null;
  client?: ClientData | null;
  photos?: unknown[];
  media?: unknown[];
  _count?: {
    photos?: number;
    media?: number;
  };
}

export async function GET() {
  try {
    const pendingEvents = (await prisma.event.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as unknown as EventPendingRecord[];

    // Fully Type-Safe Transformation
    const formatted = pendingEvents.map((evt: EventPendingRecord) => {
      const clientObj = evt.client || {};
      const studioName = clientObj.companyName || clientObj.name || "Independent Studio";
      const contact = clientObj.contactPerson || clientObj.name || "-";
      const clientEmail = clientObj.email || "-";
      const clientPhone = clientObj.phone || "-";
      const clientId = clientObj.id || "N/A";

      const photoCount =
        (Array.isArray(evt.photos) ? evt.photos.length : 0) ||
        (Array.isArray(evt.media) ? evt.media.length : 0) ||
        evt._count?.photos ||
        evt._count?.media ||
        0;

      return {
        id: evt.id,
        name: evt.name || "Untitled Event",
        slug: evt.slug || evt.id,
        eventDate: evt.eventDate
          ? new Date(evt.eventDate).toISOString()
          : evt.createdAt
          ? new Date(evt.createdAt).toISOString()
          : new Date().toISOString(),
        status: evt.status || "PENDING",
        isLive: Boolean(evt.isLive),
        photosCount: photoCount,
        client: {
          id: clientId,
          name: studioName,
          contactPerson: contact,
          email: clientEmail,
          phone: clientPhone,
        },
        createdAt: evt.createdAt
          ? new Date(evt.createdAt).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({ success: true, events: formatted }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pending requests";
    console.error("GET PENDING EVENTS ERROR:", error);
    return NextResponse.json({ success: false, error: msg, events: [] }, { status: 200 });
  }
}