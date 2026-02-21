"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSessions } from "@/hooks/useSessions";
import { ThreadList } from "./components/ThreadList";
import { ChatInterface } from "./components/ChatInterface";
import type { Session } from "@/types/api";

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();

  // 获取会话列表
  const { sessions, isLoading: sessionsLoading } = useSessions();

  // 根据 selectedSessionId 查找完整的会话对象
  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSessionSelect = (sessionId: string | undefined) => {
    setSelectedSessionId(sessionId);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen flex-col">
      <Header user={user} />
      <MainContent
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedSessionId={selectedSessionId}
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
      />
    </div>
  );
}

function Header({ user }: { user: { name?: string; email?: string } | null }) {
  const { logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 bg-background">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Universal Agent Chat</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{user?.name || user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

function MainContent({
  sidebarOpen,
  onSidebarToggle,
  selectedSessionId,
  sessions,
  onSessionSelect,
}: {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  selectedSessionId?: string;
  sessions: Session[];
  onSessionSelect: (sessionId: string | undefined) => void;
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <aside className="w-80 border-r border-border bg-background overflow-hidden">
              <ThreadList
                currentSessionId={selectedSessionId}
                onSessionSelect={onSessionSelect}
                onClose={() => onSidebarToggle()}
              />
            </aside>
            <div className="w-px bg-border" />
          </>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 overflow-hidden bg-background">
          {!sidebarOpen && (
            <button
              onClick={onSidebarToggle}
              className="absolute left-4 top-20 z-10 rounded-md border border-border bg-background p-2 hover:bg-accent shadow-sm"
            >
              ☰
            </button>
          )}
          <ChatInterface session={sessions.find(s => s.id === selectedSessionId)} key={selectedSessionId} />
        </main>
      </div>
    </div>
  );
}
