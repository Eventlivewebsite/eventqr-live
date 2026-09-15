import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eventqr-super-secure-jwt-secret-key";

export async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("super_admin_token")?.value;

  if (!token) {
    // Dev fallback: agar local me testing ke dauran token na ho toh pehla SUPER_ADMIN user utha le
    if (process.env.NODE_ENV !== "production") {
      const devSuperAdmin = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN", isDeleted: false },
      });
      if (devSuperAdmin) return devSuperAdmin;
    }
    throw new Error("Unauthorized: Super Admin access required");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role?: string };
    const user = await prisma.user.findFirst({
      where: { id: decoded.id, role: "SUPER_ADMIN", isDeleted: false },
    });

    if (!user) {
      throw new Error("Unauthorized: Invalid Super Admin account");
    }

    return user;
  } catch {
    throw new Error("Unauthorized: Invalid session");
  }
}