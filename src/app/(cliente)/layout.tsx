import { BottomNav, TopBar } from '@/components/ClientNav';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
