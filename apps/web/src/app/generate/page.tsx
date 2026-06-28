"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CardDeck from "@/components/cards/CardDeck";
import GenerationProgress from "@/components/generation/GenerationProgress";
import { useGenerationStream } from "@/hooks/useGenerationStream";

export default function GeneratePage() {
  const router = useRouter();
  const { status, statusMessage, progress, cards, generate, error, reset } =
    useGenerationStream();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted) return;

    // 从 sessionStorage 读取产品输入
    const raw = sessionStorage.getItem("productInput");
    if (!raw) {
      // 没有输入数据，回到首页
      router.push("/");
      return;
    }

    const input = JSON.parse(raw);
    setHasStarted(true);

    // 启动生成
    generate(input).then(() => {
      // 清除 sessionStorage
      sessionStorage.removeItem("productInput");
    });
  }, [hasStarted, generate, router]);

  const handleNewGeneration = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-4 py-10">
      {/* 生成进度 */}
      {(status === "generating" || status === "completed") && (
        <GenerationProgress
          progress={progress}
          message={statusMessage}
          status={status}
        />
      )}

      {/* 错误状态 */}
      {status === "error" && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">😵</div>
          <p className="text-red-400 mb-2">生成过程中出现问题</p>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <button
            onClick={handleNewGeneration}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white
                       transition-colors"
          >
            重新开始
          </button>
        </div>
      )}

      {/* 卡片展示区 */}
      {status === "completed" && cards.length > 0 && (
        <>
          <CardDeck cards={cards} />

          {/* 操作按钮 */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={handleNewGeneration}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500
                         text-white font-semibold rounded-2xl
                         hover:scale-105 shadow-lg shadow-purple-500/25
                         transition-all duration-300"
            >
              ✨ 再生成一组
            </button>
          </div>
        </>
      )}
    </div>
  );
}
