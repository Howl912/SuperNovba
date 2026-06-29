import { NextRequest } from "next/server";

// 最简测试：直接 fetch DeepSeek API，返回完整原始响应
export async function GET(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = request.nextUrl.searchParams.get("model") || "deepseek-chat";

  const url = `${baseURL}/v1/chat/completions`;

  console.log(`[Test] Calling: ${url} with model: ${model}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "说你好" }],
        max_tokens: 50,
      }),
    });

    const status = response.status;
    const body = await response.text();
    const headers = Object.fromEntries(response.headers.entries());

    return Response.json({
      ok: response.ok,
      status,
      url,
      model,
      headers: {
        "content-type": headers["content-type"],
        "x-ds-trace-id": headers["x-ds-trace-id"] || "n/a",
      },
      body: body.slice(0, 1000),
    });
  } catch (error) {
    return Response.json({
      error: String(error),
      url,
      model,
    });
  }
}
