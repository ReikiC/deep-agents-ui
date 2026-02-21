/**
 * 聊天 API
 * 处理流式聊天和任务控制
 */

import { ApiClient } from "./client";
import type { ChatRequest, SSEMessageEvent } from "@/types/api";

export class ChatAPI {
  constructor(private client: ApiClient) {}

  /**
   * 发送流式聊天消息
   * 使用 fetch + ReadableStream 处理 SSE
   */
  async streamChat(
    request: ChatRequest,
    onEvent: (event: SSEMessageEvent) => void,
    onError: (error: Error) => void
  ): Promise<() => void> {
    const token = localStorage.getItem("access_token");
    const baseUrl = this.client.getBaseUrl();

    // 构建查询参数
    const params = new URLSearchParams();
    params.append("message", request.message);
    if (request.session_id) {
      params.append("session_id", request.session_id);
    }

    const url = `${baseUrl}/api/v1/chat/single/toolcalls/stream/v2`;

    // 使用 fetch 获取流式响应
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = "";
    let currentEvent = "message"; // 默认事件类型

    const processBuffer = () => {
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 保留最后一个不完整的行

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          // 更新事件类型
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          // 解析数据
          const data = line.slice(6);
          try {
            const eventData = JSON.parse(data);
            // 使用当前事件类型包装数据
            onEvent({
              event: currentEvent,
              data: eventData,
            } as SSEMessageEvent);
          } catch (e) {
            console.error("Failed to parse SSE event:", e, data);
          }
        }
        // 空行表示事件结束
        else if (line.trim() === "") {
          currentEvent = "message"; // 重置为默认事件类型
        }
      }
    };

    // 异步读取流
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          processBuffer();
        }
      } catch (error) {
        onError(error as Error);
      }
    };

    readStream();

    // 返回取消函数
    return () => reader.cancel();
  }

  /**
   * 取消正在运行的任务
   */
  async cancelTask(taskId: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/task/${taskId}`);
  }

  /**
   * 继续已取消的任务
   */
  async continueTask(taskId: string, instruction: string): Promise<void> {
    return this.client.post<void>(`/api/v1/task/continue/${taskId}`, {
      instruction,
      save_history: true,
    });
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<{
    task_id: string;
    session_id: string;
    status: string;
    created_at: string;
    cancelled_at?: string;
    error?: string;
  }> {
    return this.client.get(`/api/v1/task/${taskId}`);
  }
}
