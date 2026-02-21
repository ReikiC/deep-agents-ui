"use client";

import { User, Bot } from "lucide-react";
import { MarkdownContent } from "./MarkdownContent";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    result?: string;
    status: "pending" | "completed" | "error";
  }>;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, toolCalls, isStreaming }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={`flex max-w-[70%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {content ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {isUser ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : (
                <MarkdownContent content={content} />
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          )}

          {isStreaming && content && (
            <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
              <span>Streaming</span>
              <span className="animate-pulse">...</span>
            </div>
          )}
        </div>

        {/* Tool Calls */}
        {toolCalls && toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {toolCalls.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs"
              >
                <span className="font-medium">🔧 {tool.name}</span>
                <span className="text-muted-foreground">
                  ({tool.status})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
