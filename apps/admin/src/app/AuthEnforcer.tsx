"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthEnforcer({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(hasSession);

  useEffect(() => {
    if (pathname === "/login") {
      setAuthorized(true);
      return;
    }

    const c = typeof document !== "undefined" ? document.cookie : "";
    const tokenExists =
      hasSession ||
      c.includes("client_token=") ||
      c.includes("admin_token=") ||
      c.includes("eventqr_session=");

    if (!tokenExists) {
      setAuthorized(false);
      router.replace(/login?redirect=);
    } else {
      setAuthorized(true);
    }
  }, [pathname, router, hasSession]);

  if (!authorized && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-xs font-mono text-slate-500">
        Verifying secure access...
      </div>
    );
  }

  return <>{children}</>;
}
