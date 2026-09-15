"use client";

// @ts-ignore
import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");

  if (isLoginPage) {
    return (
      <html lang="en">
        <body className="antialiased min-h-screen bg-[#030712] text-slate-100">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#030712] text-slate-100 flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-[#030712]">
          {children}
        </main>
      </body>
    </html>
  );
}