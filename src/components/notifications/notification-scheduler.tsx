'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type TimetableEntry = {
  id: string;
  subject: string;
  room: string;
  teacher: string;
  day: string;
  start: string;
  end: string;
};

type TimetableDoc = {
  entries: TimetableEntry[];
};

type UserProfile = {
  notifications?: boolean;
}

export function NotificationScheduler() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [permission, setPermission] = useState('default');
  
  // Using a hardcoded guest ID for now to bypass authentication
  const guestUserId = "guest-timetable";

  // Effect to update notification permission state from the browser
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      const interval = setInterval(() => {
        if (Notification.permission !== permission) {
          setPermission(Notification.permission);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [permission]);

  const userRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'users', guestUserId);
  }, [firestore]);
  const { data: userProfile } = useDoc<UserProfile>(userRef);

  const timetableRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'timetables', guestUserId);
  }, [firestore]);
  const { data: timetable } = useDoc<TimetableDoc>(timetableRef);

  useEffect(() => {
    // Exit if permissions are not granted, or if necessary data is missing
    if (permission !== 'granted' || !timetable?.entries || !userProfile?.notifications) {
      return;
    }

    const scheduledNotifications = new Set<string>();

    const scheduleNotificationsForToday = () => {
      const now = new Date();
      const today = now.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"

      timetable.entries.forEach((entry) => {
        if (entry.day !== today) return;

        const [hours, minutes] = entry.start.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);

        // Schedule notification 15 minutes before class
        const notificationTime = new Date(classTime.getTime() - 15 * 60 * 1000);
        
        // Generate a unique ID for this specific notification instance
        const notificationId = `class-${entry.id}-${classTime.getFullYear()}-${classTime.getMonth()}-${classTime.getDate()}`;

        // Check if the notification time is in the future and hasn't already been scheduled
        if (notificationTime > now && !scheduledNotifications.has(notificationId)) {
          const delay = notificationTime.getTime() - now.getTime();

          setTimeout(() => {
            new Notification(`Class Reminder: ${entry.subject}`, {
              body: `Your class in ${entry.room} starts in 15 minutes.`,
              icon: '/coffee-icon.png', // Optional: add an icon to your public folder
            });
          }, delay);

          scheduledNotifications.add(notificationId);
        }
      });
    };
    
    scheduleNotificationsForToday();
    
    // Check for new classes to schedule every minute
    const interval = setInterval(scheduleNotificationsForToday, 60000);
    
    return () => clearInterval(interval);

  }, [timetable, permission, userProfile, toast]);

  return null; // This component doesn't render anything
}
