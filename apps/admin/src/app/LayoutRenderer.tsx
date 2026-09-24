"use client";

import React from "react";
import { usePathname } from "next/navigation";
import StudioSidebar from "../components/layout/Sidebar";

export default function LayoutRenderer({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");

  // Agar user login page par hai, to sidebar render nahi hoga
  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full">
      {hasSession && <StudioSidebar />}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#030712]">
        {children}
      </main>
    </div>
  );
}