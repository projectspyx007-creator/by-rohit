import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pt-14 pb-16 bg-cream">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
