import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { DashboardShell } from '@/components/admin/DashboardShell';
import { Toaster } from '@/components/ui/Toaster';
import './assets/admin.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AdminSidebar />
      <DashboardShell>{children}</DashboardShell>
      <Toaster />
    </div>
  );
}
