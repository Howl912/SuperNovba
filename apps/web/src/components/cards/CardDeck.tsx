"use client";

import { useState } from "react";
import type { MarketingCard as MarketingCardType } from "@/lib/ai/types";
import MarketingCard from "./MarketingCard";

interface CardDeckProps {
  cards: MarketingCardType[];
}

export default function CardDeck({ cards }: CardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-4xl mb-4">🎯</p>
        <p>等待创意生成...</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const isLast = currentIndex >= cards.length - 1;
  const isLoading =
    !currentCard?.headline && !currentCard?.body;

  const goToNext = () => {
    if (!isLast) setCurrentIndex((i) => i + 1);
  };

  const goToPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 进度指示器 */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? "w-8 bg-purple-500"
                : index < currentIndex
                ? "w-1.5 bg-purple-500/50"
                : "w-1.5 bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* 卡片计数 */}
      <p className="text-center text-zinc-600 text-sm mb-4">
        {currentIndex + 1} / {cards.length} 个创意角度
      </p>

      {/* 当前卡片 */}
      <div className="relative transition-all duration-500 transform">
        <MarketingCard card={currentCard} isLoading={isLoading} />
      </div>

      {/* 导航按钮 */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700
                     text-white text-xl flex items-center justify-center
                     hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-all duration-300"
        >
          ←
        </button>

        <button
          onClick={goToNext}
          disabled={isLast}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500
                     text-white text-xl flex items-center justify-center
                     hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                     shadow-lg shadow-purple-500/25 transition-all duration-300"
        >
          →
        </button>
      </div>

      {/* 键盘提示（Web 端） */}
      <p className="text-center text-zinc-700 text-xs mt-4">
        使用 ← → 方向键切换卡片
      </p>
    </div>
  );
}
