"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAPI } from "@/providers/ApiProvider";

export default function DebugPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const api = useAPI();
  const [sessions, setSessions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("Testing API...");
        console.log("API client:", api);
        const result = await api.sessions.list();
        console.log("Sessions result:", result);
        setSessions(result);
      } catch (err) {
        console.error("API error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    if (isAuthenticated && api) {
      testAPI();
    }
  }, [isAuthenticated, api]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        <p className="text-red-500">Not authenticated</p>
        <a href="/login" className="text-blue-500 underline">Go to login</a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">API Status</h2>
          <p>API Client: {api ? "✅ Initialized" : "❌ Not initialized"}</p>
          <p>Access Token: {localStorage.getItem("access_token") ? "✅ Present" : "❌ Missing"}</p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded text-red-600">
            <h2 className="font-semibold">Error</h2>
            <p>{error}</p>
          </div>
        )}

        {sessions && (
          <div className="bg-green-50 p-4 rounded">
            <h2 className="font-semibold">Sessions Loaded</h2>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(sessions, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-semibold">Actions</h2>
          <button
            onClick={() => window.location.href = "/"}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
