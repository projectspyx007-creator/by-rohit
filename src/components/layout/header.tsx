
'use client';

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NotificationPanel } from "../notifications/notification-panel";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

export function Header() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/notifications`),
      where("read", "==", false)
    );
  }, [user, firestore]);

  const { data: unreadNotifications } = useCollection(notificationsQuery);
  const hasUnread = unreadNotifications && unreadNotifications.length > 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm shadow-sm z-50 h-14 flex items-center justify-between px-4 border-b">
        <Link href="/home" className="font-headline text-lg font-bold text-primary">
          College Companion
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => setIsPanelOpen(true)}>
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive flex" />
            )}
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
      <NotificationPanel isOpen={isPanelOpen} setIsOpen={setIsPanelOpen} />
    </>
  );
}
