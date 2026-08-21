import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-ink">
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
