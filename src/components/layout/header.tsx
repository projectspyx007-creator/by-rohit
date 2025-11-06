import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm shadow-sm z-50 h-14 flex items-center justify-between px-4 border-b">
      <Link href="/home" className="font-headline text-lg font-bold text-primary">
        Coffee Campus
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell size={20} />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/profile">
            <User size={20} />
            <span className="sr-only">Profile</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
