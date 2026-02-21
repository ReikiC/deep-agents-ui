"use client";

import { useState } from "react";
import { useSessions } from "@/hooks/useSessions";
import { MessageSquare, Trash2, Plus } from "lucide-react";

interface ThreadListProps {
  onSessionSelect?: (sessionId: string) => void;
  currentSessionId?: string;
  onClose?: () => void;
}

export function ThreadList({ onSessionSelect, currentSessionId, onClose }: ThreadListProps) {
  const { sessions, isLoading, createSession, deleteSession } = useSessions();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const newSession = await createSession({ title: "New Chat" });
      onSessionSelect?.(newSession.id);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession(sessionId);
      if (currentSessionId === sessionId) {
        onSessionSelect?.("");
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold">Sessions</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-accent"
          >
            ✕
          </button>
        )}
      </div>

      <div className="border-b border-border p-4">
        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Creating..." : "New Session"}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No sessions yet. Create one to get started!
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li
                key={session.id}
                onClick={() => onSessionSelect?.(session.id)}
                className={`group relative cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
                  currentSessionId === session.id
                    ? "bg-accent"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {session.title || "Untitled"}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {session.message_count || 0} messages
                    </div>
                    {session.last_message && (
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {session.last_message.content.slice(0, 50)}...
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
