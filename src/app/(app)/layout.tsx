import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationScheduler } from "@/components/notifications/notification-scheduler";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto pt-14 pb-16 bg-background">
          {children}
        </main>
        <BottomNav />
        <NotificationScheduler />
      </div>
    </AuthGuard>
  );
}
