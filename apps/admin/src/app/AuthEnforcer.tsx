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
  const [mounted, setMounted] = useState(false);
  const [authorized, setAuthorized] = useState(hasSession);

  useEffect(() => {
    setMounted(true);

    if (pathname === "/login") {
      setAuthorized(true);
      return;
    }

    const cookies = typeof document !== "undefined" ? document.cookie : "";
    const tokenExists =
      hasSession ||
      cookies.includes("client_token=") ||
      cookies.includes("admin_token=") ||
      cookies.includes("eventqr_session=");

    if (!tokenExists) {
      setAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    } else {
      setAuthorized(true);
    }
  }, [pathname, router, hasSession]);

  // SSR build pass karne ke liye initial render par children render hone dein
  if (!mounted) {
    return <>{children}</>;
  }

  // Client side par unauthorized access instantly hide karein
  if (!authorized && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-xs font-mono text-slate-500">
        Verifying secure session...
      </div>
    );
  }

  return <>{children}</>;
}