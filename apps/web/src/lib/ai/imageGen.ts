// ============================================================
// Seedream 5.0 图片生成接口（火山引擎 Ark 平台）
// ============================================================
//
// 鉴权方式：API Key（Bearer Token）
// API 文档：https://www.volcengine.com/docs/6791/
//
// 流程：
// 1. POST /api/v3/images/generations → 提交生成任务
// 2. 若返回 data[].url → 同步完成，直接使用
//    若返回 id → 异步任务，轮询 GET /api/v3/images/generations/{id}
// 3. 下载图片 → 上传到 Supabase Storage 持久化

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000; // 每次轮询间隔 2 秒

// ============================================================
// Ark API 响应类型
// ============================================================

interface ArkImageSyncResponse {
  created: number;
  data: Array<{ url: string }>;
}

interface ArkImageAsyncResponse {
  id: string;
  model: string;
  status: "queued" | "running" | "succeeded" | "failed";
  output?: {
    results: Array<{ url: string }>;
  };
  error?: { message: string };
}

// ============================================================
// 环境变量读取
// ============================================================

function getConfig() {
  const apiKey = process.env.VOLCENGINE_API_KEY;
  const model =
    process.env.VOLCENGINE_MODEL || "doubao-seedream-5.0-260128";
  const host =
    process.env.VOLCENGINE_API_HOST || "https://ark.cn-beijing.volces.com";

  return { apiKey, model, host };
}

function getAuthHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

// ============================================================
// 主函数：生成图片
// ============================================================

export async function generateImage(prompt: string): Promise<string> {
  const { apiKey, model, host } = getConfig();

  // ── 未配置 API Key：返回占位图 ──
  if (!apiKey) {
    console.log(`[Seedream Placeholder] Would generate: ${prompt.slice(0, 60)}...`);
    return generatePlaceholderImage(prompt);
  }

  try {
    // Step 1: 提交生成任务
    const body = JSON.stringify({
      model,
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const submitUrl = `${host}/api/v3/images/generations`;
    console.log(`[Seedream] Submitting to: ${submitUrl}`);

    const response = await fetch(submitUrl, {
      method: "POST",
      headers: getAuthHeaders(apiKey),
      body,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `Seedream API 请求失败 (${response.status}): ${errBody.slice(0, 200)}`
      );
    }

    const result = await response.json();
    console.log(
      `[Seedream] Response keys: ${Object.keys(result).join(", ")}`
    );

    // ── 同步完成：response.data[].url 直接可用 ──
    if (result.data?.[0]?.url) {
      const imageUrl = (result as ArkImageSyncResponse).data[0].url;
      return await uploadToStorage(imageUrl);
    }

    // ── 异步任务：response.id → 轮询 ──
    if (result.id) {
      const taskId = result.id;
      console.log(`[Seedream] Async task created: ${taskId}`);
      const imageUrl = await pollTask(taskId, apiKey, host);
      return await uploadToStorage(imageUrl);
    }

    throw new Error(
      `Seedream 返回格式未知: ${JSON.stringify(result).slice(0, 300)}`
    );
  } catch (error) {
    console.error("[Seedream] Generation failed:", error);
    throw error;
  }
}

// ============================================================
// 轮询异步任务
// ============================================================

async function pollTask(
  taskId: string,
  apiKey: string,
  host: string
): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const pollUrl = `${host}/api/v3/images/generations/${taskId}`;
    const response = await fetch(pollUrl, {
      method: "GET",
      headers: getAuthHeaders(apiKey),
    });

    if (!response.ok) {
      throw new Error(
        `Seedream 轮询失败 (${response.status}): ${await response.text()}`
      );
    }

    const result: ArkImageAsyncResponse = await response.json();

    if (result.status === "succeeded") {
      const imageUrl = result.output?.results?.[0]?.url;
      if (!imageUrl) throw new Error("Seedream 返回结果中没有图片 URL");
      return imageUrl;
    }

    if (result.status === "failed") {
      throw new Error(
        `Seedream 生成失败: ${result.error?.message || "未知原因"}`
      );
    }

    // 打印轮询进度
    if (attempt % 5 === 0) {
      console.log(
        `[Seedream] 轮询中... task=${taskId} status=${result.status} (第${attempt + 1}次)`
      );
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Seedream 任务超时（已轮询 ${MAX_POLL_ATTEMPTS} 次）`);
}

// ============================================================
// 上传到 Supabase Storage（持久化）
// ============================================================

async function uploadToStorage(imageUrl: string): Promise<string> {
  // TODO: 生产环境应下载图片并上传到 Supabase Storage
  // Seedream 返回的 URL 有过期时间（通常 24h）
  console.log(`[Storage] 图片生成成功: ${imageUrl.slice(0, 80)}...`);
  return imageUrl;
}

// ============================================================
// 占位图（无 API Key 时使用）
// ============================================================

function generatePlaceholderImage(prompt: string): string {
  const colors = [
    ["#6366f1", "#8b5cf6"],
    ["#ec4899", "#f43f5e"],
    ["#06b6d4", "#3b82f6"],
    ["#f59e0b", "#ef4444"],
    ["#10b981", "#6366f1"],
  ];
  const [c1, c2] = colors[Math.floor(Math.random() * colors.length)];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <text x="256" y="256" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui,sans-serif" font-size="18" fill="rgba(255,255,255,0.8)">
    ✨ AI Generated Visual
  </text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ============================================================
// 工具函数
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
