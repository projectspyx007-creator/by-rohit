import { ChatView } from "@/components/chat/chat-view";

export default function ChatPage() {
  // In a real app, you would fetch these from your database
  const timetable = "{}";
  const notices = "[]";

  return <ChatView timetable={timetable} notices={notices} />;
}
