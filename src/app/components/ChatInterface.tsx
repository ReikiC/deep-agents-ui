"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Settings } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { ConfigDialog } from "./ConfigDialog";
import type { Session } from "@/types/api";

interface ChatInterfaceProps {
  session?: Session;
  onSessionChange?: (session: Session) => void;
}

export function ChatInterface({ session, onSessionChange }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [configOpen, setConfigOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, error, sendMessage, stopGeneration } = useChat({
    sessionId: session?.id,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="font-semibold">
            {session?.title || "New Conversation"}
          </h2>
          {session && (
            <p className="text-xs text-muted-foreground">
              {session.message_count} messages
            </p>
          )}
        </div>
        <button
          onClick={() => setConfigOpen(true)}
          className="rounded-md p-2 hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            <div className="font-medium">Error</div>
            <div className="mt-1">{error}</div>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-4 text-4xl">💬</div>
              <h3 className="text-lg font-semibold">Start a conversation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask me anything! I can help with various tasks using available tools.
              </p>
              <div className="mt-4 text-left space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Try:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li className="cursor-pointer hover:text-foreground" onClick={() => setInput("帮我搜索一下今天的天气")}>
                    • 帮我搜索一下今天的天气
                  </li>
                  <li className="cursor-pointer hover:text-foreground" onClick={() => setInput("计算 123 * 456 等于多少")}>
                    • 计算 123 * 456 等于多少
                  </li>
                  <li className="cursor-pointer hover:text-foreground" onClick={() => setInput("什么是人工智能？")}>
                    • 什么是人工智能？
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role as "user" | "assistant" | "system"}
                content={message.content}
                toolCalls={message.tool_calls}
                isStreaming={message.isStreaming}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            disabled={isLoading}
            className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stopGeneration}
              className="rounded-md bg-destructive px-3 py-2 text-sm text-white hover:bg-destructive/90 transition-colors"
              title="Stop generation"
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
              title="Send message"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          {isLoading ? (
            "Generating response..."
          ) : (
            "Press Enter to send, Shift+Enter for new line"
          )}
        </p>
      </div>

      {/* Settings Dialog */}
      <ConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  );
}
