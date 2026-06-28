"use client";

import { useState, useCallback, useRef } from "react";
import type { SSEEvent, MarketingCard } from "@/lib/ai/types";

// ============================================================
// useGenerationStream — SSE 流消费 Hook
// ============================================================
//
// 用法：
//   const { cards, status, generate } = useGenerationStream();
//   await generate({ description: "一款无线耳机" });

interface GenerationState {
  status: "idle" | "generating" | "completed" | "error";
  statusMessage: string;
  progress: number;
  cards: MarketingCard[];
  error: string | null;
  sessionId: string | null;
}

const initialState: GenerationState = {
  status: "idle",
  statusMessage: "",
  progress: 0,
  cards: [],
  error: null,
  sessionId: null,
};

export function useGenerationStream() {
  const [state, setState] = useState<GenerationState>(initialState);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (input: { description: string; imageBase64?: string }) => {
      // 重置状态
      setState({
        ...initialState,
        status: "generating",
        statusMessage: "正在连接 AI 引擎...",
      });

      // 中断之前的请求
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "请求失败");
        }

        // ── 读取 SSE 流 ──
        const reader = response.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // 按行分割处理 SSE 事件
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // 最后一个不完整行保留

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: SSEEvent = JSON.parse(line.slice(6));
                handleSSEEvent(event);
              } catch {
                // 跳过无法解析的行
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setState((prev) => ({
          ...prev,
          status: "error",
          error: (error as Error).message,
        }));
      }
    },
    []
  );

  // ── SSE 事件处理 ──
  function handleSSEEvent(event: SSEEvent) {
    setState((prev) => {
      switch (event.type) {
        case "status":
          return {
            ...prev,
            statusMessage: event.message,
            progress: event.progress,
          };

        case "angle_start": {
          // 为即将到来的卡片预留位置（骨架卡片）
          const skeletonCard: MarketingCard = {
            id: `skeleton_${event.cardIndex}`,
            headline: "",
            body: "",
            imageUrl: null,
            imagePrompt: "",
            angleType: event.angleType,
            angleLabel: event.angleLabel,
            isSaved: false,
            createdAt: new Date().toISOString(),
          };
          const cards = [...prev.cards];
          cards[event.cardIndex] = skeletonCard;
          return { ...prev, cards };
        }

        case "angle_result": {
          const cards = [...prev.cards];
          const existing = cards[event.cardIndex] || ({} as MarketingCard);
          cards[event.cardIndex] = {
            ...existing,
            id: `card_${event.cardIndex}_${Date.now()}`,
            headline: event.headline,
            body: event.body,
            imagePrompt: event.imagePrompt,
            angleType: event.angleType,
            angleLabel: event.angleLabel,
          };
          return { ...prev, cards };
        }

        case "image_generating": {
          const cards = [...prev.cards];
          if (cards[event.cardIndex]) {
            cards[event.cardIndex] = {
              ...cards[event.cardIndex],
              imageUrl: null, // 显示加载状态
            };
          }
          return { ...prev, cards };
        }

        case "image_ready": {
          const cards = [...prev.cards];
          if (cards[event.cardIndex]) {
            cards[event.cardIndex] = {
              ...cards[event.cardIndex],
              imageUrl: event.imageUrl,
            };
          }
          return { ...prev, cards };
        }

        case "complete":
          return {
            ...prev,
            status: "completed" as const,
            progress: 100,
            sessionId: event.sessionId,
          };

        case "error":
          return {
            ...prev,
            status: "error" as const,
            error: event.message,
          };

        default:
          return prev;
      }
    });
  }

  // ── 重置状态 ──
  const reset = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState(initialState);
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}
