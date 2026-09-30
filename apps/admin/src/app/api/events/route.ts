import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || "eventqr_super_secure_key_2026");
    const { payload } = await jwtVerify(token, secretKey);

    const userId = payload.userId as string;
    const userRole = payload.role as string;
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    // Build Strict Ownership & Status Filter
    const filter: any = {};

    // If not Super Admin, show only this user's events
    if (userRole !== "SUPER_ADMIN") {
      filter.userId = userId;
    }

    // Strict Filter for Media Dropdowns: Exclude REJECTED events
    if (activeOnly) {
      filter.status = "ACTIVE";
      filter.isApproved = true;
    }

    const events = await prisma.event.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { photos: true }
        }
      }
    });

    return NextResponse.json({ events });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch events" }, { status: 500 });
  }
}
