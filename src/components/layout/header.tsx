import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm shadow-sm z-50 h-14 flex items-center justify-between px-4 border-b">
      <Link href="/home" className="font-headline text-lg font-bold text-primary">
        Coffee Campus
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="bg-cream pl-8 text-sm h-9 rounded-full w-32 md:w-48" />
        </div>
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
