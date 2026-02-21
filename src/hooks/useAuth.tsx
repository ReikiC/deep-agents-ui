"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { AuthState, User, LoginRequest, RegisterRequest } from "@/types/auth";
import { AuthAPI } from "@/api";

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 初始化：从 localStorage 恢复认证状态
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (token) {
      // 验证 token 是否有效
      validateToken(token);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const apiUrl = localStorage.getItem("api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const getToken = () => token;
      const authAPI = new AuthAPI({ getBaseUrl: () => apiUrl } as any);
      (authAPI as any).client = { get };

      const user = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      });

      setState({
        user,
        accessToken: token,
        refreshToken: localStorage.getItem("refresh_token"),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // Token 无效，清除状态
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (data: LoginRequest) => {
    const apiUrl = localStorage.getItem("api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Login failed");
    }

    const { access_token, refresh_token } = await response.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    // 获取用户信息
    const user = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    }).then((res) => res.json());

    setState({
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const register = async (data: RegisterRequest) => {
    const apiUrl = localStorage.getItem("api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Registration failed");
    }

    const { access_token, refresh_token } = await response.json();
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    // 获取用户信息
    const user = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    }).then((res) => res.json());

    setState({
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshToken = async () => {
    const { refreshToken: currentRefreshToken } = state;
    if (!currentRefreshToken) throw new Error("No refresh token");

    const apiUrl = localStorage.getItem("api_url") || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: currentRefreshToken }),
    });

    if (!response.ok) {
      // Refresh token 也过期了，需要重新登录
      logout();
      throw new Error("Session expired. Please login again.");
    }

    const { access_token } = await response.json();
    localStorage.setItem("access_token", access_token);

    setState((prev) => ({
      ...prev,
      accessToken: access_token,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
