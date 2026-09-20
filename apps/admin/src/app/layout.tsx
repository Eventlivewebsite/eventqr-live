import "./globals.css";
import React from "react";
import { cookies } from "next/headers";

export const metadata = {
  title: "EventQR Live - Studio Admin",
  description: "Enterprise Studio Event Control Center",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("client_token")?.value ||
    cookieStore.get("admin_token")?.value ||
    cookieStore.get("eventqr_session")?.value;

  const hasValidSession = Boolean(token && token.trim().length > 10);

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen antialiased">
        <ClientAuthGuard hasSession={hasValidSession}>
          {children}
        </ClientAuthGuard>
      </body>
    </html>
  );
}

function ClientAuthGuard({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var p = window.location.pathname;
                if (p === '/login' || p.startsWith('/login/') || p.startsWith('/api') || p.startsWith('/_next')) {
                  return;
                }
                var c = document.cookie || '';
                var hasToken = c.indexOf('client_token=') !== -1 || 
                               c.indexOf('admin_token=') !== -1 || 
                               c.indexOf('eventqr_session=') !== -1;
                if (!hasToken && !${hasSession}) {
                  window.location.replace('/login?error=unauthorized&redirect=' + encodeURIComponent(p));
                }
              } catch(e) {}
            })();
          `,
        }}
      />
      {children}
    </>
  );
}