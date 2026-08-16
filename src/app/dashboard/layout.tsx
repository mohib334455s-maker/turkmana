import { Suspense } from 'react';
import { DashboardShell } from './dashboard-shell';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#f3f6f8]" />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
