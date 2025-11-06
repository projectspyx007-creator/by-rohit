"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string) => void;
  isPending: boolean;
};

export function ChatInput({ onSend, isPending }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Ask the coach..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPending}
        className="flex-1 rounded-full h-12 px-5"
      />
      <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="rounded-full h-12 w-12 flex-shrink-0">
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
