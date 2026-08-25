'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isClientPortal = pathname.startsWith('/client-dashboard') || pathname.startsWith('/client-login');

  if (isClientPortal) {
    return <div className="min-h-screen bg-[#090314] text-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0A0D14] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}