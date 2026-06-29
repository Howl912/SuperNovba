import {
  buildProductAnalysisPrompt,
  buildAngleGenerationPrompt,
  buildImagePromptEnhancement,
} from "./prompts";
import { generateImage } from "./imageGen";
import type {
  ProductProfile,
  MarketingCard,
  SSEEvent,
  AngleDefinition,
} from "./types";
import { CREATIVE_ANGLES } from "./types";

// ============================================================
// DeepSeek Chat Completion（纯 fetch，避免 SDK 兼容问题）
// ============================================================

function getDeepSeekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("Missing DEEPSEEK_API_KEY");

  const base =
    (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(
      /\/$/,
      ""
    ) + "/v1";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

  return { apiKey, baseURL: base, model };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chatCompletion(params: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { apiKey, baseURL, model } = getDeepSeekConfig();
  const url = `${baseURL}/chat/completions`;

  const body = JSON.stringify({
    model,
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.maxTokens ?? 2000,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `DeepSeek API ${response.status}: ${errText.slice(0, 300)}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(
      `DeepSeek 返回为空: ${JSON.stringify(data).slice(0, 300)}`
    );
  }

  return content;
}

// ============================================================
// 从 LLM 响应中提取 JSON（兼容 markdown code block）
// ============================================================

function extractJson(text: string): string {
  // 去掉 markdown ```json ... ``` 包裹
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  // 尝试找到第一个 { 到最后一个 }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

// ============================================================
// 工具函数
// ============================================================

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================
// 阶段1：产品分析
// ============================================================

async function stage1_analyzeProduct(
  description: string,
  imageAnalysis?: string,
  onEvent?: (event: SSEEvent) => void
): Promise<ProductProfile> {
  onEvent?.({
    type: "status",
    stage: "analyzing",
    message: "正在分析你的产品...",
    progress: 10,
  });

  const prompt = buildProductAnalysisPrompt({ description, imageAnalysis });

  const raw = await chatCompletion({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const json = extractJson(raw);
  const parsed = JSON.parse(json) as ProductProfile;

  // 基本校验
  if (!parsed.name || !Array.isArray(parsed.features)) {
    throw new Error(`产品分析返回格式错误: ${raw.slice(0, 200)}`);
  }

  return parsed;
}

// ============================================================
// 阶段2：单角度创意生成
// ============================================================

interface AngleResult {
  headline: string;
  body: string;
  visualConcept: string;
}

async function stage2_generateSingleAngle(
  product: ProductProfile,
  angle: AngleDefinition,
  cardIndex: number,
  onEvent?: (event: SSEEvent) => void
): Promise<{
  headline: string;
  body: string;
  imagePrompt: string;
  angleType: string;
  angleLabel: string;
  cardIndex: number;
}> {
  onEvent?.({
    type: "angle_start",
    cardIndex,
    angleType: angle.type,
    angleLabel: angle.label,
  });

  const prompt = buildAngleGenerationPrompt(product, angle);

  const raw = await chatCompletion({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
  });

  const json = extractJson(raw);
  const parsed = JSON.parse(json) as AngleResult;

  if (!parsed.headline || !parsed.body) {
    throw new Error(
      `角度生成返回格式错误 (${angle.label}): ${raw.slice(0, 200)}`
    );
  }

  // 生成优化的图片提示词
  const imagePrompt = await enhanceImagePrompt(
    parsed.headline,
    parsed.body,
    parsed.visualConcept || "",
    product.name,
    angle.label
  );

  return {
    headline: parsed.headline,
    body: parsed.body,
    imagePrompt,
    angleType: angle.type,
    angleLabel: angle.label,
    cardIndex,
  };
}

// ============================================================
// 阶段3：图片提示词优化
// ============================================================

async function enhanceImagePrompt(
  headline: string,
  body: string,
  visualConcept: string,
  productName: string,
  angleLabel: string
): Promise<string> {
  const prompt = buildImagePromptEnhancement(
    visualConcept,
    productName,
    angleLabel
  );

  const result = await chatCompletion({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return result.trim();
}

// ============================================================
// 阶段4：图片生成
// ============================================================

async function stage4_generateImageForCard(
  imagePrompt: string,
  cardIndex: number,
  onEvent?: (event: SSEEvent) => void
): Promise<string | null> {
  onEvent?.({
    type: "image_generating",
    cardIndex,
  });

  try {
    const imageUrl = await generateImage(imagePrompt);
    onEvent?.({
      type: "image_ready",
      cardIndex,
      imageUrl,
    });
    return imageUrl;
  } catch (error) {
    console.error(`图片生成失败 (card ${cardIndex}):`, error);
    return null;
  }
}

// ============================================================
// 主流水线编排
// ============================================================

export async function runGenerationPipeline(
  input: { description: string; imageBase64?: string },
  onEvent: (event: SSEEvent) => void,
  options?: { angleCount?: number; imageCount?: number }
): Promise<MarketingCard[]> {
  const angleCount = options?.angleCount ?? 5;
  const imageCount = options?.imageCount ?? 2;

  try {
    // ── 阶段1：产品分析 ──
    const product = await stage1_analyzeProduct(
      input.description,
      input.imageBase64 ? "[图片已上传]" : undefined,
      onEvent
    );

    console.log("[Pipeline] 产品分析完成:", product.name);

    // ── 阶段2+3：多角度并行生成 ──
    onEvent({
      type: "status",
      stage: "generating_angles",
      message: "正在构思创意营销角度...",
      progress: 30,
    });

    const selectedAngles = selectAngles(angleCount);

    const angleResults = await Promise.all(
      selectedAngles.map((angle, index) =>
        stage2_generateSingleAngle(product, angle, index, onEvent)
      )
    );

    console.log(
      `[Pipeline] 角度生成完成: ${angleResults.length} 个角度`
    );

    // ── 阶段4：图片生成 ──
    onEvent({
      type: "status",
      stage: "generating_images",
      message: "正在生成营销视觉...",
      progress: 70,
    });

    const cardsToIllustrate = angleResults.slice(0, imageCount);

    const imageUrls = await Promise.all(
      cardsToIllustrate.map((card) =>
        stage4_generateImageForCard(card.imagePrompt, card.cardIndex, onEvent)
      )
    );

    // ── 阶段5：组装卡片 ──
    onEvent({
      type: "status",
      stage: "assembling",
      message: "正在组装营销卡片...",
      progress: 90,
    });

    const now = new Date().toISOString();
    const cards: MarketingCard[] = angleResults.map((angle, index) => ({
      id: generateId(),
      headline: angle.headline,
      body: angle.body,
      imageUrl: index < imageCount ? imageUrls[index] : null,
      imagePrompt: angle.imagePrompt,
      angleType: angle.angleType as MarketingCard["angleType"],
      angleLabel: angle.angleLabel,
      isSaved: false,
      createdAt: now,
    }));

    return cards;
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.error("[Pipeline] 错误:", message);
    onEvent({
      type: "error",
      message: `生成失败：${message}`,
      retryable: true,
    });
    throw error;
  }
}

// ============================================================
// 辅助函数
// ============================================================

function selectAngles(count: number): AngleDefinition[] {
  const shuffled = [...CREATIVE_ANGLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CREATIVE_ANGLES.length));
}
