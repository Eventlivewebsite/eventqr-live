import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const events = await (prisma.event as any).findMany({
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const qrData = events.map((ev: any) => {
      const slug = ev.slug || `event-${ev.id}`;
      // Guest upload page public target url
      const targetUrl = `http://localhost:3002/e/${slug}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
        targetUrl
      )}`;

      return {
        id: String(ev.id),
        name: ev.name || ev.title || "Untitled Event",
        slug: slug,
        type: ev.eventType || ev.type || "WEDDING",
        status: ev.status || (ev.isLive ? "APPROVED" : "PENDING"),
        isLive: Boolean(ev.isLive),
        eventDate: ev.eventDate
          ? new Date(ev.eventDate).toISOString()
          : new Date().toISOString(),
        clientName:
          ev.client?.companyName ||
          ev.client?.name ||
          ev.client?.contactPerson ||
          "Studio Client",
        targetUrl,
        qrCodeUrl: qrApiUrl,
      };
    });

    return NextResponse.json({
      success: true,
      events: qrData,
      totalCount: qrData.length,
    });
  } catch (error: any) {
    console.error("[QR_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch QR codes", events: [] },
      { status: 500 }
    );
  }
}