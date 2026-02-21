/**
 * 会话管理 API
 */

import { ApiClient } from "./client";
import type {
  Session,
  SessionListResponse,
  SessionDetail,
  SessionCreate,
  SessionUpdate,
  MessageInDB,
} from "@/types/api";

export class SessionsAPI {
  constructor(private client: ApiClient) {}

  async list(params: { limit?: number; offset?: number } = {}): Promise<SessionListResponse> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());

    return this.client.get<SessionListResponse>(
      `/api/v1/sessions?${searchParams.toString()}`
    );
  }

  async get(id: string): Promise<SessionDetail> {
    return this.client.get<SessionDetail>(`/api/v1/sessions/${id}`);
  }

  async create(data: SessionCreate): Promise<Session> {
    return this.client.post<Session>("/api/v1/sessions", data);
  }

  async update(id: string, data: SessionUpdate): Promise<Session> {
    return this.client.put<Session>(`/api/v1/sessions/${id}`, data);
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.client.delete<{ message: string }>(`/api/v1/sessions/${id}`);
  }

  async restore(id: string): Promise<Session> {
    return this.client.post<Session>(`/api/v1/sessions/${id}/restore`);
  }

  async getMessages(id: string): Promise<MessageInDB[]> {
    return this.client.get<MessageInDB[]>(`/api/v1/sessions/${id}/messages`);
  }
}
