import { BottomNav, TopBar } from '@/components/ClientNav';
import { InstallHint } from '@/components/InstallHint';

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <TopBar />
      <InstallHint />
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <BottomNav />
    </div>
  );
}
