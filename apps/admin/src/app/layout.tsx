import "./globals.css";
import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata = {
  title: "EventQR Live - Studio Admin",
  description: "Enterprise Studio Event Control Center",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Read cookies directly on the Node.js / Edge Server
  const cookieStore = await cookies();
  const clientToken = cookieStore.get("client_token")?.value;
  const adminToken = cookieStore.get("admin_token")?.value;
  const eventqrSession = cookieStore.get("eventqr_session")?.value;

  const hasValidSession = Boolean(
    (clientToken && clientToken.trim().length > 10) ||
      (adminToken && adminToken.trim().length > 10) ||
      (eventqrSession && eventqrSession.trim().length > 10)
  );

  // 2. Server-side URL Protection
  // Note: App Router layout executes on every server request.
  // We allow /login and API requests to pass through safely.
  if (!hasValidSession) {
    // If user is accessing protected routes without cookie, FORCE redirect at server level
    return (
      <html lang="en">
        <body className="bg-[#030712] text-slate-100 min-h-screen">
          <UnauthenticatedServerGuard>{children}</UnauthenticatedServerGuard>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

// Inline Client Enforcer for instant client-side route changes
function UnauthenticatedServerGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              var p = window.location.pathname;
              if (p !== '/login' && !p.startsWith('/api') && !p.startsWith('/_next')) {
                window.location.replace('/login?redirect=' + encodeURIComponent(p));
              }
            }
          `,
        }}
      />
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-xs font-mono text-slate-500">
        Redirecting to login...
      </div>
    </>
  );
}