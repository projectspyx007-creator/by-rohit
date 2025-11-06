'use client';

import { ChatView } from "@/components/chat/chat-view";
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from "react";

export default function ChatPage() {
  const firestore = useFirestore();

  const timetableRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'timetables', 'guest-timetable');
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
