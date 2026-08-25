import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: "EventQR Live - Admin Panel",
  description: "Enterprise Event Gallery and Client Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased flex h-screen w-screen overflow-hidden">
        {/* Fixed Desktop Sidebar */}
        <aside className="w-64 hidden md:flex flex-col border-r border-slate-800/80 bg-slate-950/80 shrink-0 h-full">
          <Sidebar />
        </aside>

        {/* Main Content Area - Full Width Desktop Layout */}
        <div className="flex-1 flex flex-col h-full w-full min-w-0 overflow-hidden">
          {/* Top Navigation */}
          <header className="h-16 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md shrink-0 w-full">
            <Topbar />
          </header>

          {/* Page Body - Full Stretch Container */}
          <main className="w-full h-full flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}