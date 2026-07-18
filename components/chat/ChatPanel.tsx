"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";

interface ChatPanelProps {
  messages: ChatMessage[];
  suggestedPrompts: string[];
  disabled: boolean;
  loading: boolean;
  onSend: (message: string) => void;
  onPromptSelect: (message: string) => void;
}

export function ChatPanel({
  messages,
  suggestedPrompts,
  disabled,
  loading,
  onSend,
  onPromptSelect
}: ChatPanelProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim() || disabled) {
      return;
    }

    onSend(message);
    setMessage("");
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-5 text-primary" aria-hidden />
          Conversation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask follow-ups without losing scene context.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="max-h-[380px] min-h-[220px] space-y-3 overflow-y-auto rounded-lg border bg-background/70 p-3"
          aria-live="polite"
        >
          {messages.length ? (
            messages.map((chatMessage) => (
              <ChatBubble key={chatMessage.id} message={chatMessage} />
            ))
          ) : (
            <div className="flex h-full min-h-[190px] items-center justify-center text-center text-sm text-muted-foreground">
              Ask a recommendation question after the scene is understood.
            </div>
          )}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              CityMind is reasoning...
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.slice(0, 4).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={disabled}
              onClick={() => onPromptSelect(prompt)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            disabled={disabled}
            placeholder={
              disabled
                ? "Capture a scene before asking..."
                : "Ask CityMind what you should do next..."
            }
            aria-label="Ask CityMind a follow-up question"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={disabled || !message.trim() || loading}>
              <Send aria-hidden />
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3", isUser && "justify-end")}
    >
      {!isUser ? (
        <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4" aria-hidden />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-card text-card-foreground"
        )}
      >
        {message.content}
      </div>
      {isUser ? (
        <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <UserRound className="size-4" aria-hidden />
        </span>
      ) : null}
    </motion.div>
  );
}
