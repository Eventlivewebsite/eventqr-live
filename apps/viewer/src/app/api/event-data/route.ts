import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get("slug") || searchParams.get("event") || "";
    const slug = rawSlug.trim().replace(/[^a-zA-Z0-9-_]/g, "");

    const prisma = getPrisma();
    let event = null;

    if (slug) {
      event = await prisma.event.findFirst({
        where: { OR: [{ slug }, { id: slug }], isDeleted: false },
        include: {
          settings: true,
          timelines: true,
          customFields: true,
        },
      });
    }

    if (!event) {
      event = await prisma.event.findFirst({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          settings: true,
          timelines: true,
          customFields: true,
        },
      });
    }

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      let val: any = cf.fieldValue;
      if (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      customMap[cf.fieldName] = val;
    }

    // Parse Key People / Family Members (Section 7)
    let familyMembers: any[] = [];
    const possibleFamilyKeys = ["familyMembers", "keyPeople", "vips", "teamAndFamily", "members"];
    for (const k of possibleFamilyKeys) {
      const candidate = customMap[k];
      if (Array.isArray(candidate) && candidate.length > 0) {
        familyMembers = candidate;
        break;
      } else if (typeof candidate === "string" && candidate.trim()) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0) {
            familyMembers = parsed;
            break;
          }
        } catch {}
      }
    }

    // Unified Categories (Section 4)
    let categoriesList: string[] = [];
    const possibleCategoryKeys = ["photoCategories", "categories", "activeCategories", "unifiedCategories", "categoriesList"];
    for (const key of possibleCategoryKeys) {
      const candidate = customMap[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        categoriesList = candidate.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
        break;
      } else if (typeof candidate === "string" && candidate.trim()) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0) {
            categoriesList = parsed.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
            break;
          }
        } catch {
          categoriesList = candidate.split(",").map(c => c.trim()).filter(Boolean);
          if (categoriesList.length > 0) break;
        }
      }
    }

    const inviteData = {
      badgeTitle: customMap["topBadgeTitle"] || customMap["topBadge"] || customMap["badgeTitle"] || "OFFICIAL INVITATION",
      initials: customMap["initials"] || customMap["coupleNames"] || customMap["names"] || event.title || "A & S",
      tagline: customMap["tagline"] || event.settings?.subtitle || customMap["subtitle"] || "Together Forever",
      invitationMessage: customMap["invitationMessage"] || customMap["message"] || customMap["inviteMessage"] || "We cordially invite you to celebrate this special occasion with us.",
      displayDateText: customMap["displayDateText"] || customMap["dateText"] || "",
      displayTimeText: customMap["displayTimeText"] || customMap["timeText"] || "",
      displayVenueText: customMap["displayVenueText"] || customMap["venueText"] || event.location || customMap["venueName"] || "",
    };

    const res = NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.settings?.subtitle || customMap["subtitle"] || "",
        location: event.location || customMap["venueName"] || "",
        eventDate: event.eventDate,
        timelines: customMap["timelines"] || event.timelines || [],
        photoCategories: categoriesList,
        categoriesList,
        familyMembers,
        inviteData,
        customMap,
      },
    });

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  } catch (err: any) {
    console.error("EVENT_DATA_API_ERROR:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal Error" }, { status: 500 });
  }
}