import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch Clients Count & Data
    let totalClients = 0;
    let clientsList: any[] = [];
    try {
      clientsList = await (prisma.client as any).findMany();
      totalClients = clientsList.length;
    } catch {
      totalClients = 1;
    }

    // 2. Fetch Events Stats
    let allEvents: any[] = [];
    try {
      allEvents = await (prisma.event as any).findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      allEvents = [];
    }

    const totalEvents = allEvents.length;
    const liveEvents = allEvents.filter((e: any) => e.isLive || e.status === "APPROVED").length;
    const pendingEvents = allEvents.filter((e: any) => !e.isLive && e.status !== "REJECTED").length;
    const rejectedEvents = allEvents.filter((e: any) => e.status === "REJECTED").length;

    // 3. Fetch Photos / Media Count
    let totalMedia = 0;
    try {
      totalMedia = await (prisma as any).photo.count();
    } catch {
      totalMedia = 0;
    }

    // 4. Calculate Storage Metrics (Simulated + DB Allocation)
    const allocatedStorageGb = clientsList.reduce(
      (acc: number, c: any) => acc + (c.allocatedStorageGb || 50),
      0
    );
    // Estimated 3.5 MB per photo upload
    const usedStorageMb = Math.round(totalMedia * 3.5);
    const usedStorageGb = Number((usedStorageMb / 1024).toFixed(2));

    // 5. Studio Performance Aggregates
    const studioMetrics = clientsList.map((client: any) => {
      const studioEvents = allEvents.filter((ev: any) => ev.clientId === client.id);
      return {
        id: client.id,
        name: client.companyName || client.name || client.loginId || "Studio Partner",
        email: client.email || "partner@eventqr.live",
        totalEvents: studioEvents.length,
        liveEvents: studioEvents.filter((e: any) => e.isLive || e.status === "APPROVED").length,
        allocatedGb: client.allocatedStorageGb || 50,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalClients,
        totalEvents,
        liveEvents,
        pendingEvents,
        rejectedEvents,
        totalMedia,
        allocatedStorageGb: allocatedStorageGb || 50,
        usedStorageGb: usedStorageGb || 0.1,
      },
      studioMetrics,
      recentEvents: allEvents.slice(0, 5).map((e: any) => ({
        id: e.id,
        name: e.name || e.title || "Untitled Event",
        slug: e.slug,
        type: e.eventType || e.type || "WEDDING",
        status: e.status || (e.isLive ? "APPROVED" : "PENDING"),
        createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[ANALYTICS_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load platform analytics" },
      { status: 500 }
    );
  }
}