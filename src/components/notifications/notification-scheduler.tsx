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

export function NotificationScheduler() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [permission, setPermission] = useState(Notification.permission);

  const timetableRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // Assuming a guest user for now as per previous changes
    return doc(firestore, 'timetables', 'guest-timetable');
  }, [firestore]);
  const { data: timetable } = useDoc<TimetableDoc>(timetableRef);

  useEffect(() => {
    // Function to check and update permission status
    const checkPermission = () => {
      setPermission(Notification.permission);
    };
    // Check permission status periodically in case it changes in browser settings
    const interval = setInterval(checkPermission, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (permission !== 'granted' || !timetable?.entries) {
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

        const notificationTime = new Date(classTime.getTime() - 15 * 60 * 1000);

        // Check if the notification time is in the future and hasn't been scheduled
        const notificationId = `class-${entry.id}-${notificationTime.getTime()}`;
        if (notificationTime > now && !scheduledNotifications.has(notificationId)) {
          const delay = notificationTime.getTime() - now.getTime();

          setTimeout(() => {
            new Notification(`Class Reminder: ${entry.subject}`, {
              body: `Your class in ${entry.room} starts in 15 minutes.`,
              icon: '/coffee-icon.png', // Optional: you'd need to add an icon to your public folder
            });
          }, delay);

          scheduledNotifications.add(notificationId);
        }
      });
    };
    
    // Schedule notifications for today
    scheduleNotificationsForToday();
    
    // Check for new classes to schedule every minute
    const interval = setInterval(scheduleNotificationsForToday, 60000);
    
    return () => clearInterval(interval);

  }, [timetable, permission, toast]);

  return null; // This component doesn't render anything
}
