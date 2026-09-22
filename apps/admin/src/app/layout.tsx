import "./globals.css";
import React from "react";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import StudioSidebar from "../components/layout/Sidebar";

export const metadata = {
  title: "EventQR Live - Studio Admin",
  description: "Enterprise Studio Event Control Center",
};

const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("eventqr_session")?.value ||
    cookieStore.get("admin_token")?.value ||
    cookieStore.get("client_token")?.value;

  let hasValidSession = false;

  // 1. Server-Side Cryptographic Token Verification
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = String(payload.role || "").toUpperCase();
      if (
        userRole === "ADMIN" ||
        userRole === "STUDIO_ADMIN" ||
        userRole === "SUPER_ADMIN"
      ) {
        hasValidSession = true;
      }
    } catch {
      hasValidSession = false;
    }
  }

  return (
    <html lang="en">
      <body className="bg-[#030712] text-slate-100 min-h-screen antialiased">
        <ClientAuthSync hasSession={hasValidSession}>
          <LayoutRenderer hasSession={hasValidSession}>
            {children}
          </LayoutRenderer>
        </ClientAuthSync>
      </body>
    </html>
  );
}

// 2. Sidebar Layout Wrapper: Login page par hidden, baaki authenticated pages par automatically render
function LayoutRenderer({
  children,
  hasSession,
}: {
  children: React.ReactNode;
  hasSession: boolean;
}) {
  return (
    <div className="flex min-h-screen w-full">
      {hasSession && <StudioSidebar />}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#030712]">
        {children}
      </main>
    </div>
  );
}

// 3. Inline Zero-Import Cross-Tab Sync & URL Protection Guard
function ClientAuthSync({
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

                // Static chunks, public files, aur login page bypass
                if (p === '/login' || p.startsWith('/login/') || p.startsWith('/api') || p.startsWith('/_next')) {
                  return;
                }

                // Direct URL access block agar session nahi hai
                var serverValid = ${hasSession};
                if (!serverValid) {
                  window.location.replace('/login?error=unauthorized&redirect=' + encodeURIComponent(p));
                  return;
                }

                // Cross-Tab Synchronized Logout Listener (BroadcastChannel)
                if (typeof window.BroadcastChannel !== 'undefined') {
                  var authChannel = new BroadcastChannel('auth_sync_channel');
                  authChannel.onmessage = function(ev) {
                    if (ev.data === 'LOGOUT') {
                      window.location.replace('/login?error=session_terminated');
                    }
                  };
                }

                // Storage Event Fallback (Har browser support ke liye)
                window.addEventListener('storage', function(e) {
                  if (e.key === 'eventqr_logout_event') {
                    window.location.replace('/login?error=session_terminated');
                  }
                });
              } catch(e) {}
            })();
          `,
        }}
      />
      {children}
    </>
  );
}