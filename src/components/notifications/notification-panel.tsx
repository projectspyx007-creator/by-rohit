
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, orderBy, query, writeBatch } from 'firebase/firestore';
import { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, BellRing } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
  read: boolean;
};

export function NotificationPanel({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { user } = useUser();
  const firestore = useFirestore();

  const notificationsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  useEffect(() => {
    // Mark all notifications as read when the panel opens
    if (isOpen && notifications && firestore && user) {
      const unread = notifications.filter((n) => !n.read);
      if (unread.length > 0) {
        const batch = writeBatch(firestore);
        unread.forEach((notification) => {
          const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
          batch.update(notifRef, { read: true });
        });
        batch.commit().catch(console.error);
      }
    }
  }, [isOpen, notifications, firestore, user]);

  const formatTimestamp = (timestamp: Notification['createdAt']) => {
    if (!timestamp) return '';
    if (typeof timestamp === 'string') {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    }
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-xl">Notifications</SheetTitle>
          <SheetDescription>
            Here are your latest updates from campus.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6">
          {isLoading && <p className="text-center text-muted-foreground p-4">Loading...</p>}
          {!isLoading && (!notifications || notifications.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bell size={48} className="mb-4" />
                <p className="font-semibold">No notifications yet</p>
                <p className="text-sm">We'll let you know when something new comes up.</p>
            </div>
          )}
          {notifications && notifications.length > 0 && (
            <div className="space-y-3 py-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg bg-background">
                  <div className={`mt-1 p-2 rounded-full ${!notif.read ? 'bg-primary/10' : 'bg-muted'}`}>
                     <BellRing size={16} className={`${!notif.read ? 'text-primary' : 'text-muted-foreground'}`}/>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(notif.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
