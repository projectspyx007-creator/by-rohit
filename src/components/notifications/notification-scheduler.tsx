'use client';

import { useEffect, useRef } from 'react';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';

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
  const { user } = useUser();
  const scheduledNotificationsRef = useRef(new Set<string>());
  const scheduledTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userRef);

  const timetableRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'timetables', user.uid);
  }, [firestore, user]);
  const { data: timetable } = useDoc<TimetableDoc>(timetableRef);

  useEffect(() => {
    const scheduleNotifications = () => {
      // Clear any previously scheduled timeouts to avoid duplicates
      scheduledTimeoutsRef.current.forEach(clearTimeout);
      scheduledTimeoutsRef.current = [];

      // Exit if permissions aren't granted or data is missing
      if (Notification.permission !== 'granted' || !timetable?.entries || !userProfile?.notifications) {
        return;
      }

      const now = new Date();
      const todayDayString = now.toLocaleDateString('en-US', { weekday: 'long' });

      timetable.entries.forEach((entry) => {
        if (entry.day !== todayDayString) return;

        const [hours, minutes] = entry.start.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);

        // Schedule notification 15 minutes before the class
        const notificationTime = new Date(classTime.getTime() - 15 * 60 * 1000);

        // A unique ID for this specific day's notification instance
        const notificationId = `class-reminder-${entry.id}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        
        // Check if the notification time is in the future and not already fired today
        if (notificationTime > now && !scheduledNotificationsRef.current.has(notificationId)) {
          const delay = notificationTime.getTime() - now.getTime();

          const timeoutId = setTimeout(() => {
            // Check permission again right before sending
            if (Notification.permission === 'granted') {
              new Notification(`Class Reminder: ${entry.subject}`, {
                body: `Your class in ${entry.room} starts in 15 minutes.`,
                icon: '/coffee-icon.png',
                tag: notificationId, // Use tag to prevent re-notification if already shown
              });
              // Mark this notification as fired for this session
              scheduledNotificationsRef.current.add(notificationId);
            }
          }, delay);
          
          scheduledTimeoutsRef.current.push(timeoutId);
        }
      });
    };

    // Run the scheduler immediately and then every minute
    scheduleNotifications();
    const interval = setInterval(scheduleNotifications, 60000);

    // Cleanup on component unmount
    return () => {
      clearInterval(interval);
      scheduledTimeoutsRef.current.forEach(clearTimeout);
    };

  }, [timetable, userProfile]);

  return null; // This component doesn't render anything
}
