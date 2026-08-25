"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");

  return (
    <html lang="en" className="dark">
      <body className="bg-[#030712] text-slate-100 min-h-screen antialiased flex">
        {!isLoginPage && <Sidebar />}
        <main
          className={`flex-1 min-w-0 min-h-screen ${
            isLoginPage
              ? "w-full flex items-center justify-center"
              : "overflow-y-auto"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}