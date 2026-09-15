import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action === "REJECT" ? "REJECTED" : "APPROVED";
    const isLive = action === "APPROVED";

    const updated = await (prisma.event as any).update({
      where: { id: cleanId },
      data: {
        status: action,
        isLive: isLive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event successfully marked as ${action}`,
      event: {
        id: updated.id,
        status: updated.status,
        isLive: updated.isLive,
      },
    });
  } catch (error: any) {
    console.error("[APPROVE_EVENT_ACTION_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update event status" },
      { status: 500 }
    );
  }
}