'use client';

import { ChatView } from "@/components/chat/chat-view";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from "react";

export default function ChatPage() {
  const firestore = useFirestore();
  // Using a hardcoded guest ID for now to bypass authentication for development
  const guestUserId = "guest-timetable";

  const timetableRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'timetables', guestUserId);
  }, [firestore]);
  const { data: timetableDoc } = useDoc(timetableRef);

  const noticesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'notices'), orderBy('createdAt', 'desc'));
  }, [firestore]);
  const { data: noticesCollection } = useCollection(noticesQuery);

  const [timetable, setTimetable] = useState("{}");
  const [notices, setNotices] = useState("[]");

  useEffect(() => {
    if (timetableDoc) {
      setTimetable(JSON.stringify(timetableDoc));
    }
  }, [timetableDoc]);

  useEffect(() => {
    if (noticesCollection) {
      setNotices(JSON.stringify(noticesCollection));
    }
  }, [noticesCollection]);

  return <ChatView timetable={timetable} notices={notices} />;
}
