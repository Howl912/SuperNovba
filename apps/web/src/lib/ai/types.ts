// ============================================================
// AI Pipeline 内部类型定义
// ============================================================

// 创意角度类型
export type AngleType =
  | "emotional"
  | "data"
  | "humor"
  | "social_proof"
  | "aspirational";

// 创意角度定义
export interface AngleDefinition {
  type: AngleType;
  label: string;
  emoji: string;
  description: string;
}

// 产品画像（阶段1输出）
export interface ProductProfile {
  name: string;
  features: string[];
  targetAudience: string;
  uniqueSellingPoint: string;
  category: string;
}

// 营销卡片
export interface MarketingCard {
  id: string;
  headline: string;
  body: string;
  imageUrl: string | null;
  imagePrompt: string;
  angleType: AngleType;
  angleLabel: string;
  isSaved: boolean;
  createdAt: string;
}

// SSE 事件
export interface StatusEvent {
  type: "status";
  stage: "analyzing" | "generating_angles" | "generating_images" | "assembling";
  message: string;
  progress: number;
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

export type SSEEvent =
  | StatusEvent
  | AngleStartEvent
  | AngleResultEvent
  | ImageGeneratingEvent
  | ImageReadyEvent
  | CompleteEvent
  | ErrorEvent;

// 创意角度列表
export const CREATIVE_ANGLES: AngleDefinition[] = [
  {
    type: "emotional",
    label: "情感叙事",
    emoji: "💭",
    description:
      "用情感共鸣讲故事，引发用户内心深处的情绪连接。聚焦产品如何改变人的生活、情感和关系。",
  },
  {
    type: "data",
    label: "数据说话",
    emoji: "📊",
    description:
      "用事实、数据和逻辑说服用户。强调产品的效率提升、性价比、可量化的优势，让理性消费者无法拒绝。",
  },
  {
    type: "humor",
    label: "幽默反差",
    emoji: "😆",
    description:
      "用幽默、反讽、意想不到的对比制造记忆点。让人会心一笑的同时记住产品。不要低俗，要有智慧的反差感。",
  },
  {
    type: "social_proof",
    label: "社交认同",
    emoji: "🔥",
    description:
      "营造「大家都在用」的氛围。强调产品的流行度、社交货币属性、圈层认同感，让用户觉得不用就会落伍。",
  },
  {
    type: "aspirational",
    label: "向往生活",
    emoji: "✨",
    description:
      "描绘使用产品后的理想生活图景。不直接卖产品，而是卖一种生活方式、一种身份认同、一种更好的自己。",
  },
];
