"use client";

import { useState, useRef } from "react";

interface ProductInputProps {
  onSubmit: (data: { description: string; imageBase64?: string }) => void;
  isGenerating: boolean;
}

export default function ProductInput({ onSubmit, isGenerating }: ProductInputProps) {
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64.split(",")[1]); // 去掉 data:image/...;base64, 前缀
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isGenerating) return;
    onSubmit({
      description: description.trim(),
      imageBase64,
    });
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      {/* 文字输入区 */}
      <div className="relative">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="输入一款产品或一件物品...&#10;比如：「一款主打降噪的无线耳机，续航30小时，外观简约」"
          rows={4}
          className="w-full p-5 text-lg bg-zinc-900/50 border border-zinc-700/50
                     rounded-2xl text-white placeholder-zinc-500 resize-none
                     focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     transition-all duration-300"
          disabled={isGenerating}
        />
        {/* 字数提示 */}
        <div className="absolute bottom-3 right-3 text-xs text-zinc-600">
          {description.length}/500
        </div>
      </div>

      {/* 图片上传区 */}
      {imagePreview ? (
        <div className="mt-3 relative inline-block">
          <img
            src={imagePreview}
            alt="产品预览"
            className="w-24 h-24 object-cover rounded-xl border border-zinc-700"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                       text-white text-xs flex items-center justify-center
                       hover:bg-red-600 transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-zinc-400
                     bg-zinc-900/50 border border-zinc-700/50 rounded-xl
                     hover:border-zinc-600 hover:text-zinc-300 transition-all"
          disabled={isGenerating}
        >
          <span>📷</span>
          <span>上传产品图片（可选）</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={!description.trim() || isGenerating}
        className="mt-5 w-full py-4 px-6 text-lg font-semibold rounded-2xl
                   bg-gradient-to-r from-purple-600 to-pink-500
                   text-white shadow-lg shadow-purple-500/25
                   hover:shadow-purple-500/40 hover:scale-[1.02]
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-300"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </span>
        ) : (
          "✨ 生成营销创意"
        )}
      </button>
    </form>
  );
}
