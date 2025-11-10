import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-view";
import { Icons } from "../icons";

type ChatMessagesProps = {
  messages: Message[];
  isPending: boolean;
};

export function ChatMessages({ messages, isPending }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <Avatar className="h-8 w-8 border-2 border-primary/50">
              <div className="flex h-full w-full items-center justify-center bg-primary">
                <Icons.Coffee className="h-5 w-5 text-primary-foreground" />
              </div>
            </Avatar>
          )}

          <div
            className={cn(
              "max-w-[75%] rounded-2xl px-4 py-2",
              message.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-background text-foreground rounded-bl-none shadow-sm"
            )}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        </div>
      ))}
      {isPending && (
        <div className="flex items-start gap-3 justify-start">
            <Avatar className="h-8 w-8 border-2 border-primary/50">
                <div className="flex h-full w-full items-center justify-center bg-primary">
                    <Icons.Coffee className="h-5 w-5 text-primary-foreground" />
                </div>
            </Avatar>
            <div className="bg-background text-foreground rounded-2xl rounded-bl-none px-4 py-2 shadow-sm flex items-center gap-1">
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></span>
            </div>
        </div>
      )}
    </>
  );
}
