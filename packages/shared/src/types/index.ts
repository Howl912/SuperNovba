// 创意角度类型
export type AngleType =
  | "emotional"      // 情感叙事
  | "data"           // 数据/理性
  | "humor"          // 幽默/反差
  | "social_proof"   // 社交认同
  | "aspirational";  // 生活方式/向往

// 营销卡片
export interface MarketingCard {
  id: string;
  headline: string;         // 标题 (≤80字符)
  body: string;             // 文案 (≤200字符)
  imageUrl: string | null;  // AI 生成的配图 URL
  imagePrompt: string;      // 用于生成图片的提示词
  angleType: AngleType;
  angleLabel: string;       // 角度中文标签，如 "情感叙事"
  isSaved: boolean;
  createdAt: string;
}

// 产品画像（阶段1输出）
export interface ProductProfile {
  name: string;
  features: string[];        // 产品特征
  targetAudience: string;    // 目标受众
  uniqueSellingPoint: string; // 独特卖点
  category: string;          // 产品类别
}

// 产品输入
export interface ProductInput {
  description: string;
  imageBase64?: string;     // 可选的图片 base64
  imageMimeType?: string;   // 图片 MIME 类型
}

// SSE 事件类型
export type SSEEvent =
  | StatusEvent
  | ProductProfileEvent
  | AngleStartEvent
  | AngleResultEvent
  | ImageGeneratingEvent
  | ImageReadyEvent
  | CompleteEvent
  | ErrorEvent;

export interface StatusEvent {
  type: "status";
  stage: "analyzing" | "generating_angles" | "generating_images" | "assembling";
  message: string;
  progress: number; // 0-100
}

export interface ProductProfileEvent {
  type: "product_profile";
  data: ProductProfile;
}

export interface AngleStartEvent {
  type: "angle_start";
  cardIndex: number;
  angleType: AngleType;
  angleLabel: string;
}

export interface AngleResultEvent {
  type: "angle_result";
  cardIndex: number;
  headline: string;
  body: string;
  imagePrompt: string;
  angleType: AngleType;
  angleLabel: string;
}

export interface ImageGeneratingEvent {
  type: "image_generating";
  cardIndex: number;
}

export interface ImageReadyEvent {
  type: "image_ready";
  cardIndex: number;
  imageUrl: string;
}

export interface CompleteEvent {
  type: "complete";
  totalCards: number;
  sessionId: string;
}

export interface ErrorEvent {
  type: "error";
  cardIndex?: number;
  message: string;
  retryable: boolean;
}

// 生成会话
export interface GenerationSession {
  id: string;
  userId: string | null;    // null = 匿名用户
  productInput: ProductInput;
  cards: MarketingCard[];
  status: "generating" | "completed" | "failed";
  createdAt: string;
}

// 匿名使用追踪（localStorage 中存储）
export interface AnonymousUsage {
  generationCount: number;
  lastGenerationAt: string;
}

export const MAX_ANONYMOUS_GENERATIONS = 3;
