import { NextRequest } from "next/server";
import { runGenerationPipeline } from "@/lib/ai/pipeline";
import type { SSEEvent, CompleteEvent } from "@/lib/ai/types";

// ============================================================
// POST /api/generate
// ============================================================
//
// 接收用户输入，返回 SSE 事件流
// 每个事件都是 JSON 格式：data: {"type": "...", ...}
//
// 请求体：
//   { description: string, imageBase64?: string }
//
// 返回：Server-Sent Events 流
//   事件序列：status → angle_start → angle_result → image_ready → complete

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 最大允许 60 秒（Vercel Hobby 限制）

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, imageBase64 } = body;

    // ── 输入验证 ──
    if (!description || typeof description !== "string") {
      return new Response(
        JSON.stringify({ error: "请提供产品描述" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (description.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "产品描述至少需要 3 个字符" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── 创建 SSE 流 ──
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let completed = false;

        // SSE 事件发送器
        const sendEvent = (event: SSEEvent) => {
          if (completed) return;
          const data = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          const cards = await runGenerationPipeline(
            { description, imageBase64 },
            sendEvent,
            { angleCount: 5, imageCount: 2 }
          );

          // 发送完成事件
          const sessionId = `session_${Date.now()}`;
          const completeEvent: CompleteEvent = {
            type: "complete",
            totalCards: cards.length,
            sessionId,
          };
          sendEvent(completeEvent);

          completed = true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "未知错误";
          sendEvent({
            type: "error",
            message: `生成失败：${message}`,
            retryable: true,
          });
          completed = true;
        } finally {
          controller.close();
        }
      },
    });

    // ── 返回 SSE 响应 ──
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲（Vercel）
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "请求格式错误",
        detail: error instanceof Error ? error.message : "未知错误",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
