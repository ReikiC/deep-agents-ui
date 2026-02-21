/**
 * 聊天 Hook
 * 适配 Universal Agent Backend 的 REST API + SSE
 */

import { useCallback, useState, useRef, useEffect } from "react";
import { useAPI } from "@/providers/ApiProvider";
import type { ChatMessage, ToolCallStep } from "@/types/api";
import type { SSEMessageEvent } from "@/types/api";

interface UseChatOptions {
  sessionId?: string;
  onMessage?: (message: ChatMessage) => void;
  onToolCall?: (toolCall: ToolCallStep) => void;
  onComplete?: () => void;
}

export function useChat(options: UseChatOptions = {}) {
  const api = useAPI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(options.sessionId);
  const cancelStreamRef = useRef<(() => void) | null>(null);

  // 当 sessionId 改变时，加载历史消息
  useEffect(() => {
    const loadMessages = async () => {
      if (!options.sessionId || !api) {
        setMessages([]);
        return;
      }

      try {
        const historyMessages = await api.sessions.getMessages(options.sessionId);
        // 转换 MessageInDB 到 ChatMessage 格式
        const chatMessages: ChatMessage[] = historyMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
          timestamp: msg.created_at,
          tool_calls: msg.tool_calls,
        }));
        setMessages(chatMessages);
      } catch (error) {
        console.error("Failed to load message history:", error);
        setError("Failed to load message history");
      }
    };

    loadMessages();
  }, [options.sessionId, api]);

  // 清理：组件卸载时取消流式请求
  useEffect(() => {
    return () => {
      if (cancelStreamRef.current) {
        cancelStreamRef.current();
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!api) {
        setError("API not initialized. Please check your authentication.");
        return;
      }

      setError(null);
      setIsLoading(true);

      setIsLoading(true);

      // 添加用户消息到状态
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 创建一个临时的 assistant 消息用于流式更新
      const tempAssistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, tempAssistantMessage]);

      try {
        // 发送流式请求
        const cancel = await api.chat.streamChat(
          {
            message: content,
            session_id: currentSessionId,
          },
          // onEvent
          (event: SSEMessageEvent) => {
            switch (event.event) {
              case "content_delta":
                // 后端发送的是 content_delta 事件
                if (event.data.content) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAssistantMessage.id
                        ? { ...msg, content: (msg.content || "") + event.data.content }
                        : msg
                    )
                  );
                }
                break;

              case "tool_call_start":
                // 工具调用开始
                const toolCallStart: ToolCallStep = {
                  id: `tc-${Date.now()}`,
                  name: event.data.tool_name || "",
                  arguments: event.data.arguments || {},
                  status: "pending",
                };
                options.onToolCall?.(toolCallStart);
                break;

              case "tool_call_end":
                // 工具调用结束
                const toolCallEnd: ToolCallStep = {
                  id: `tc-${Date.now()}`,
                  name: event.data.tool_name || "",
                  arguments: {},
                  result: event.data.result,
                  status: event.data.status === "success" ? "completed" : "error",
                };
                options.onToolCall?.(toolCallEnd);
                break;

              case "done":
                // 标记流式结束
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAssistantMessage.id
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                setIsLoading(false);
                options.onComplete?.();
                break;

              case "error":
                console.error("SSE Error:", event.data);
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === tempAssistantMessage.id
                      ? {
                          ...msg,
                          content: `Error: ${event.data.error || "Unknown error"}`,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
                setIsLoading(false);
                break;

              default:
                // 处理其他事件类型（如果有的话）
                console.log("Unknown event:", event.event);
            }
          },
          // onError
          (error: Error) => {
            console.error("Chat error:", error);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === tempAssistantMessage.id
                  ? {
                      ...msg,
                      content: `Error: ${error.message}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsLoading(false);
          }
        );

        cancelStreamRef.current = cancel;
      } catch (error) {
        console.error("Failed to send message:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAssistantMessage.id
              ? {
                  ...msg,
                  content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsLoading(false);
      }
    },
    [api, currentSessionId, options]
  );

  const stopGeneration = useCallback(async () => {
    if (currentTaskId && api) {
      try {
        await api.chat.cancelTask(currentTaskId);
      } catch (error) {
        console.error("Failed to cancel task:", error);
      }
    }

    // 取消流式连接
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }

    setIsLoading(false);
  }, [currentTaskId, api]);

  const continueGeneration = useCallback(
    async (instruction?: string) => {
      if (!currentTaskId || !api) {
        throw new Error("No active task to continue");
      }

      setIsLoading(true);
      try {
        await api.chat.continueTask(currentTaskId, instruction || "Please continue");
        // 重新发送消息以获取继续的响应
        // 这里需要根据实际需求调整
      } catch (error) {
        console.error("Failed to continue task:", error);
        setIsLoading(false);
      }
    },
    [currentTaskId, api]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const setSessionId = useCallback((sessionId: string | undefined) => {
    setCurrentSessionId(sessionId);
    clearMessages();
  }, [clearMessages]);

  return {
    messages,
    isLoading,
    error,
    currentSessionId,
    currentTaskId,
    sendMessage,
    stopGeneration,
    continueGeneration,
    clearMessages,
    setSessionId,
  };
}
