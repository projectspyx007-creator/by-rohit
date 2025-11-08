'use client';

import { ChatView } from "@/components/chat/chat-view";
import { useFirestore, useDoc, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from "react";

export default function ChatPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const timetableRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'timetables', user.uid);
  }, [firestore, user]);
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
  
  if (isUserLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return <ChatView timetable={timetable} notices={notices} />;
}
