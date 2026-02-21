/**
 * 认证相关 API
 */

import { ApiClient } from "./client";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "@/types/auth";

export class AuthAPI {
  constructor(private client: ApiClient) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>("/api/v1/auth/login", data);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return this.client.post<LoginResponse>("/api/v1/auth/register", data);
  }

  async getCurrentUser(): Promise<User> {
    return this.client.get<User>("/api/v1/auth/me");
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    // 注意：此端点不需要认证
    const url = `${this.client.getBaseUrl()}/api/v1/auth/refresh`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return response.json();
  }
}
