"use client";

import { useRouter } from "next/navigation";
import ProductInput from "@/components/input/ProductInput";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (data: { description: string; imageBase64?: string }) => {
    setIsGenerating(true);

    // 将输入数据存储到 sessionStorage，generate 页面会读取
    sessionStorage.setItem("productInput", JSON.stringify(data));

    // 跳转到生成页面
    router.push("/generate");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20">
      {/* Hero 区域 */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            用 AI 打开
          </span>
          <br />
          <span className="text-white">产品营销的想象力</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
          输入任意产品，AI 从情感、数据、幽默、社交、生活方式等多角度
          生成创意营销方向——帮你发现产品被忽视的可能性。
        </p>
      </div>

      {/* 输入区域 */}
      <ProductInput onSubmit={handleSubmit} isGenerating={isGenerating} />

      {/* 下方引导 */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
        <FeatureCard
          emoji="🎯"
          title="多维创意"
          description="5种创意透镜，从不同角度挖掘产品可能性"
        />
        <FeatureCard
          emoji="⚡"
          title="快速生成"
          description="10秒内完成多角度营销创意构思"
        />
        <FeatureCard
          emoji="✨"
          title="激发灵感"
          description="不是替代你的判断，而是打开你的想象空间"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 text-center">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
