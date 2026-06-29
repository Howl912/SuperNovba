import { createOpenAI } from "@ai-sdk/openai";
import { generateText, generateObject } from "ai";
import { z } from "zod";
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
// DeepSeek 客户端配置
// ============================================================

function getDeepSeekClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY environment variable");
  }

  // 确保 baseURL 以 /v1 结尾（SDK 需要完整路径来拼接 /chat/completions）
  let baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
  if (!baseURL.endsWith("/v1")) {
    baseURL = baseURL.replace(/\/$/, "") + "/v1";
  }

  return createOpenAI({
    apiKey,
    baseURL,
  });
}

// ============================================================
// 工具函数：生成唯一 ID
// ============================================================

function generateId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================================
// 阶段1：产品分析
// ============================================================

const productProfileSchema = z.object({
  name: z.string(),
  features: z.array(z.string()).min(3).max(8),
  targetAudience: z.string(),
  uniqueSellingPoint: z.string(),
  category: z.string(),
});

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

  const deepseek = getDeepSeekClient();
  const prompt = buildProductAnalysisPrompt({ description, imageAnalysis });

  const result = await generateObject({
    model: deepseek("deepseek-chat"),
    schema: productProfileSchema,
    prompt,
    temperature: 0.7,
  });

  return result.object;
}

// ============================================================
// 阶段2：多角度并行生成 ⭐ 核心差异化
// ============================================================

const angleResultSchema = z.object({
  headline: z.string().max(80),
  body: z.string().max(200),
  visualConcept: z.string(),
});

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

  const deepseek = getDeepSeekClient();
  const prompt = buildAngleGenerationPrompt(product, angle);

  const result = await generateObject({
    model: deepseek("deepseek-chat"),
    schema: angleResultSchema,
    prompt,
    temperature: 0.9, // 高 temperature 确保多样性
  });

  // 阶段3（合并）：为这个角度生成优化的图片提示词
  const imagePrompt = await enhanceImagePrompt(
    result.object.headline,
    result.object.body,
    result.object.visualConcept,
    product.name,
    angle.label
  );

  const cardData = {
    headline: result.object.headline,
    body: result.object.body,
    imagePrompt,
    angleType: angle.type,
    angleLabel: angle.label,
    cardIndex,
  };

  onEvent?.({
    type: "angle_result",
    cardIndex,
    headline: cardData.headline,
    body: cardData.body,
    imagePrompt: cardData.imagePrompt,
    angleType: cardData.angleType as SSEEvent extends { type: "angle_result" }
      ? SSEEvent["angleType"]
      : never,
    angleLabel: cardData.angleLabel,
  });

  return cardData;
}

async function enhanceImagePrompt(
  headline: string,
  body: string,
  visualConcept: string,
  productName: string,
  angleLabel: string
): Promise<string> {
  const deepseek = getDeepSeekClient();
  const prompt = buildImagePromptEnhancement(
    visualConcept,
    productName,
    angleLabel
  );

  const result = await generateText({
    model: deepseek("deepseek-chat"),
    prompt,
    temperature: 0.7,
  });

  return result.text.trim();
}

// ============================================================
// 阶段4：图片生成（并行，含轮询）
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
    console.error(`Image generation failed for card ${cardIndex}:`, error);
    // 图片生成失败不阻塞流程，返回 null
    return null;
  }
}

// ============================================================
// 主流水线编排
// ============================================================

export async function runGenerationPipeline(
  input: {
    description: string;
    imageBase64?: string;
  },
  onEvent: (event: SSEEvent) => void,
  options?: {
    angleCount?: number; // 生成几个角度，默认 5
    imageCount?: number; // 其中几张配图，默认 2
  }
): Promise<MarketingCard[]> {
  const angleCount = options?.angleCount ?? 5;
  const imageCount = options?.imageCount ?? 2;

  try {
    // ── 阶段1：产品分析 ──
    const product = await stage1_analyzeProduct(
      input.description,
      input.imageBase64 ? "[图片已上传，基于描述分析]" : undefined,
      onEvent
    );

    // ⚠️ 如果有图片 base64，需要先做图片理解
    // TODO: 接入多模态模型（如 GPT-4o）做图片分析
    // 当前版本：基于文字描述分析
    if (input.imageBase64) {
      console.log(
        "Image input received, multimodal analysis will be added in future version"
      );
    }

    // ── 阶段2+3：多角度并行生成 ──
    onEvent?.({
      type: "status",
      stage: "generating_angles",
      message: "正在构思创意营销角度...",
      progress: 30,
    });

    // 随机选取角度（确保每次都有不同的创意组合）
    const selectedAngles = selectAngles(angleCount);

    // 并行生成所有角度
    const angleResults = await Promise.all(
      selectedAngles.map((angle, index) =>
        stage2_generateSingleAngle(product, angle, index, onEvent)
      )
    );

    // ── 阶段4：图片生成（仅前 N 张卡片配图） ──
    onEvent?.({
      type: "status",
      stage: "generating_images",
      message: "正在生成营销视觉...",
      progress: 70,
    });

    // 选择前 imageCount 张卡片生成配图
    const cardsToIllustrate = angleResults.slice(0, imageCount);

    // 并行生成图片
    const imageUrls = await Promise.all(
      cardsToIllustrate.map((card) =>
        stage4_generateImageForCard(card.imagePrompt, card.cardIndex, onEvent)
      )
    );

    // ── 阶段5：组装卡片 ──
    onEvent?.({
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
    const message =
      error instanceof Error ? error.message : "未知错误";
    onEvent?.({
      type: "error",
      message: `生成失败：${message}`,
      retryable: true,
    });
    throw error;
  }
}

// ============================================================
// 辅助函数：随机选取角度
// ============================================================

function selectAngles(count: number): AngleDefinition[] {
  const shuffled = [...CREATIVE_ANGLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, CREATIVE_ANGLES.length));
}
