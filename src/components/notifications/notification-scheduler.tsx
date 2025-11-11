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

type TimetableDoc = { entries: TimetableEntry[] };
type UserProfile = { notifications?: boolean };

export function NotificationScheduler() {
  const firestore = useFirestore();
  const { user } = useUser();
  const scheduledNotificationsRef = useRef(new Set<string>());
  const scheduledTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const scheduleNotifications = () => {
      scheduledTimeoutsRef.current.forEach(clearTimeout);
      scheduledTimeoutsRef.current = [];

      if (Notification.permission !== 'granted' || !timetable?.entries || !userProfile?.notifications) {
        return;
      }

      const now = new Date();
      const todayDayString = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      timetable.entries.forEach((entry) => {
        if (entry.day.toLowerCase() !== todayDayString) return;

        const [hours, minutes] = entry.start.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);

        const notificationTime = new Date(classTime.getTime() - 15 * 60 * 1000);
        const notificationId = `class-reminder-${entry.id}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        if (notificationTime > now && !scheduledNotificationsRef.current.has(notificationId)) {
          const delay = notificationTime.getTime() - now.getTime();

          const timeoutId = setTimeout(() => {
            if (Notification.permission === 'granted') {
              new Notification(`Class Reminder: ${entry.subject}`, {
                body: `Your class in ${entry.room} starts in 15 minutes.`,
                icon: '/coffee-icon.png',
                tag: notificationId,
              });
              scheduledNotificationsRef.current.add(notificationId);
            }
          }, delay);

          scheduledTimeoutsRef.current.push(timeoutId);
        }
      });
    };

    scheduleNotifications();
    const interval = setInterval(scheduleNotifications, 60000);

    return () => {
      clearInterval(interval);
      scheduledTimeoutsRef.current.forEach(clearTimeout);
    };
  }, [timetable, userProfile]);

  return null;
}
