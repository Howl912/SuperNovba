"use client";

import type { MarketingCard as MarketingCardType } from "@/lib/ai/types";

const ANGLE_COLORS: Record<string, string> = {
  emotional: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
  data: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  humor: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  social_proof: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  aspirational: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
};

const ANGLE_EMOJI: Record<string, string> = {
  emotional: "💭",
  data: "📊",
  humor: "😆",
  social_proof: "🔥",
  aspirational: "✨",
};

interface MarketingCardProps {
  card: MarketingCardType;
  isLoading?: boolean;
}

export default function MarketingCard({ card, isLoading }: MarketingCardProps) {
  if (isLoading) {
    return <CardSkeleton angleType={card.angleType} angleLabel={card.angleLabel} />;
  }

  const gradientColors =
    ANGLE_COLORS[card.angleType] || ANGLE_COLORS.emotional;
  const emoji = ANGLE_EMOJI[card.angleType] || "✨";

  return (
    <div
      className={`relative w-full max-w-sm mx-auto bg-gradient-to-br ${gradientColors}
                  backdrop-blur-xl border rounded-3xl overflow-hidden
                  shadow-2xl shadow-black/20 transition-all duration-500`}
    >
      {/* 角度标签 */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                         bg-black/40 backdrop-blur-md rounded-full
                         text-white/90 text-xs font-medium">
          <span>{emoji}</span>
          <span>{card.angleLabel}</span>
        </span>
      </div>

      {/* 配图区域 */}
      <div className="relative w-full h-64 bg-zinc-900/50 overflow-hidden">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.headline}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">{emoji}</div>
              <p className="text-zinc-500 text-sm">纯文字创意</p>
            </div>
          </div>
        )}
        {/* 渐变遮罩 */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* 文案区域 */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 leading-tight">
          {card.headline}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">{card.body}</p>
      </div>

      {/* 底部装饰 */}
      <div className="px-6 pb-4 flex items-center justify-between">
        <span className="text-zinc-600 text-xs">
          {new Date(card.createdAt).toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

// ── 骨架加载状态 ──
function CardSkeleton({
  angleType,
  angleLabel,
}: {
  angleType: string;
  angleLabel: string;
}) {
  const gradientColors =
    ANGLE_COLORS[angleType] || ANGLE_COLORS.emotional;
  const emoji = ANGLE_EMOJI[angleType] || "✨";

  return (
    <div
      className={`relative w-full max-w-sm mx-auto bg-gradient-to-br ${gradientColors}
                  backdrop-blur-xl border rounded-3xl overflow-hidden
                  shadow-2xl shadow-black/20 animate-pulse`}
    >
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5
                         bg-black/40 backdrop-blur-md rounded-full
                         text-white/90 text-xs font-medium">
          <span>{emoji}</span>
          <span>{angleLabel}</span>
        </span>
      </div>
      <div className="w-full h-64 bg-zinc-800/50 flex items-center justify-center">
        <div className="text-5xl mb-3 animate-bounce">{emoji}</div>
      </div>
      <div className="p-6 space-y-3">
        <div className="h-6 bg-white/10 rounded-lg w-3/4" />
        <div className="h-4 bg-white/10 rounded-lg w-full" />
        <div className="h-4 bg-white/10 rounded-lg w-2/3" />
      </div>
    </div>
  );
}
