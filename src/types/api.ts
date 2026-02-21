/**
 * API 响应类型定义
 * 适配 Universal Agent Backend
 */

// ============ 会话相关 ============

export interface Session {
  id: string;
  title: string | null;
  model: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
  last_message?: MessageSummary;
}

export interface MessageSummary {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export interface SessionListResponse {
  sessions: Session[];
  total: number;
}

export interface SessionDetail {
  id: string;
  title: string | null;
  model: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages: MessageInDB[];
}

export interface SessionCreate {
  title?: string;
  model?: string;
}

export interface SessionUpdate {
  title?: string;
  model?: string;
}

// ============ 消息相关 ============

export interface MessageInDB {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: ToolCall[];
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: "pending" | "completed" | "error";
}

// ============ 聊天请求 ============

export interface ChatRequest {
  message: string;
  session_id?: string;
}

// ============ SSE 事件类型 ============

export interface SSEMessageEvent {
  event: "message" | "tool_call" | "error" | "end" | "metadata" | "content_delta" | "tool_call_start" | "tool_call_end" | "task_created" | "done";
  data: {
    // 通用字段
    task_id?: string;
    session_id?: string;
    timestamp?: string;

    // 消息事件
    role?: "user" | "assistant" | "system";
    content?: string;
    message_id?: string;

    // 工具调用事件
    tool_name?: string;
    tool_call_id?: string;
    arguments?: Record<string, unknown>;
    result?: string;
    status?: "pending" | "completed" | "error";

    // 错误事件
    error?: string;
    error_code?: string;

    // 元数据事件
    thread_id?: string;
  };
}

// ============ 任务相关 ============

export interface TaskInfo {
  task_id: string;
  session_id: string;
  status: "running" | "completed" | "cancelled" | "error";
  created_at: string;
  cancelled_at?: string;
  error?: string;
}

// ============ 前端使用的消息类型 ============

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: ToolCallStep[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface ToolCallStep {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
  status: "pending" | "completed" | "error";
}
