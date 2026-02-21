/**
 * 会话管理 Hook
 * 替换原有的 useThreads，适配 Universal Agent Backend
 */

import useSWRInfinite from "swr/infinite";
import type { Session } from "@/types/api";
import { useAPI } from "@/providers/ApiProvider";

interface UseSessionsOptions {
  limit?: number;
}

export function useSessions(options: UseSessionsOptions = {}) {
  const api = useAPI();
  const limit = options.limit || 20;

  const { data, error, isLoading, size, setSize, mutate } = useSWRInfinite(
    (pageIndex: number, previousPageData: { sessions: Session[] } | null) => {
      // 未认证时不获取数据
      if (!api) return null;

      // 如果上一页没有数据，说明已经到底了
      if (previousPageData && previousPageData.sessions.length === 0) {
        return null;
      }

      return [`sessions`, pageIndex, limit];
    },
    async ([_, pageIndex, limit]) => {
      return api.sessions.list({
        limit,
        offset: pageIndex * limit,
      });
    },
    {
      revalidateFirstPage: true,
      revalidateOnFocus: true,
    }
  );

  const sessions = data?.flatMap((page) => page.sessions) || [];
  const total = data?.[0]?.total || 0;
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isReachingEnd = sessions.length >= total;

  const createSession = async (data: { title?: string }) => {
    const newSession = await api.sessions.create(data);
    mutate(); // 刷新列表
    return newSession;
  };

  const deleteSession = async (id: string) => {
    await api.sessions.delete(id);
    mutate(); // 刷新列表
  };

  const updateSession = async (id: string, data: { title?: string }) => {
    const updated = await api.sessions.update(id, data);
    mutate(); // 刷新列表
    return updated;
  };

  return {
    sessions,
    total,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    error,
    size,
    setSize,
    mutate,
    createSession,
    deleteSession,
    updateSession,
  };
}

// 导出别名，保持向后兼容
export { useSessions as useThreads };
