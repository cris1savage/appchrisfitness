import { Sidebar } from '@/components/Sidebar';
import { requireAdminPage } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();

  return (
    <div className="flex bg-ink">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
