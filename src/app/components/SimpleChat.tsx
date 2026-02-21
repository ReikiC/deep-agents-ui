"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { ArrowUp, Square } from "lucide-react";

export function SimpleChat({ sessionId }: { sessionId?: string }) {
  const { accessToken } = useAuth();
  const { messages, isLoading, sendMessage, stopGeneration } = useChat({ sessionId });
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput("");
    await sendMessage(message);
  };

  if (!accessToken) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please login to continue</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Start a conversation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Type a message below to begin chatting
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="text-sm font-medium">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  {message.isStreaming && (
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
                      <span>Streaming</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="rounded-md bg-destructive px-3 py-2 text-sm text-white hover:bg-destructive/90"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
