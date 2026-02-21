"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient, AuthAPI, SessionsAPI, ChatAPI } from "@/api";

interface APIContextType {
  auth: AuthAPI;
  sessions: SessionsAPI;
  chat: ChatAPI;
  client: ApiClient;
  isReady: boolean;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      const storedApiUrl = localStorage.getItem("api_url");
      setApiUrl(storedApiUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
    }
    setIsReady(true);
  }, []);

  const getToken = () => accessToken;

  const client = new ApiClient(apiUrl, getToken);

  const value: APIContextType = {
    auth: new AuthAPI(client),
    sessions: new SessionsAPI(client),
    chat: new ChatAPI(client),
    client,
    isReady,
  };

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
}

export function useAPI() {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error("useAPI must be used within ApiProvider");
  }
  return context;
}
