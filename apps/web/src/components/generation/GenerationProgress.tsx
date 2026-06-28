"use client";

interface GenerationProgressProps {
  progress: number;
  message: string;
  status: "idle" | "generating" | "completed" | "error";
}

export default function GenerationProgress({
  progress,
  message,
  status,
}: GenerationProgressProps) {
  if (status === "idle" || status === "error") return null;

  const stageMessages: Record<string, string> = {
    analyzing: "🔍 正在分析产品特征...",
    generating_angles: "💡 正在构思创意营销角度...",
    generating_images: "🎨 正在生成营销视觉...",
    assembling: "📦 正在组装创意卡片...",
  };

  const displayMessage = message || "准备中...";

  return (
    <div className="w-full max-w-lg mx-auto my-8">
      {/* 进度条 */}
      <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500
                     rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 状态文字 */}
      <div className="mt-4 text-center">
        <p className="text-white/80 text-sm animate-pulse">{displayMessage}</p>
        <p className="text-zinc-600 text-xs mt-1">
          {status === "completed"
            ? "✅ 生成完成"
            : `创意引擎运行中... ${progress}%`}
        </p>
      </div>
    </div>
  );
}
