"use client";

import { useState, useRef, useEffect } from "react";
import { generateChatResponse } from "@/ai/flows/ai-chatbot-assistance";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";

export type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatViewProps = {
  timetable: string;
  notices: string;
};

export function ChatView({ timetable, notices }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      text: "Hi! I'm your College Companion 🤖. Ask me anything about your classes, notices, or just what's happening on campus!",
    },
  ]);
  const [isPending, setIsPending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: "smooth"
        });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userInput: string) => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsPending(true);

    try {
      const response = await generateChatResponse({
        message: userInput,
        timetable,
        notices,
      });

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        text: response.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error generating chat response:", error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: "Sorry, I'm having a little trouble brewing a response right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-cream">
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <ChatMessages messages={messages} isPending={isPending} />
        </div>
        <div className="p-4 bg-background border-t">
            <ChatInput onSend={handleSend} isPending={isPending} />
        </div>
    </div>
  );
}
