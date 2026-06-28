import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperNovba — AI 营销创意生成器",
  description:
    "输入一款产品，AI 从多个创意角度生成营销物料，激发你的营销灵感。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/50">
          <nav className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SuperNovba
              </span>
            </a>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <a href="/" className="hover:text-white transition-colors">
                首页
              </a>
              <a href="/library" className="hover:text-white transition-colors">
                我的收藏
              </a>
            </div>
          </nav>
        </header>

        {/* 主内容 */}
        <main className="flex-1">{children}</main>

        {/* 底部 */}
        <footer className="border-t border-zinc-800/50 py-6">
          <p className="text-center text-zinc-600 text-xs">
            SuperNovba — 用 AI 打开产品营销的无限可能
          </p>
        </footer>
      </body>
    </html>
  );
}
