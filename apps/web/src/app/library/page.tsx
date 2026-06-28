import Link from "next/link";

export default function LibraryPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-2xl font-bold text-white mb-3">我的收藏</h1>
        <p className="text-zinc-500 mb-8">
          你保存的营销创意卡片将在这里展示
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl
                     text-white transition-colors inline-block"
        >
          去生成创意 →
        </Link>
      </div>
    </div>
  );
}
