import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import type { MarketingCard } from "@/lib/types";

// ⚠️ 当前是骨架实现，SSE 流消费逻辑将在 Phase 3 完整实现
// 移动端的 SSE 解析与 Web 端共享 useGenerationStream 的逻辑

export default function GenerateScreen() {
  const { description } = useLocalSearchParams<{ description: string }>();
  const [status, setStatus] = useState<"generating" | "completed" | "error">("generating");
  const [cards, setCards] = useState<MarketingCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("正在连接 AI 引擎...");

  useEffect(() => {
    if (!description) {
      router.back();
      return;
    }

    // TODO: Phase 3 实现完整的 SSE 流消费
    // 当前显示占位状态
    const timer = setTimeout(() => {
      setStatus("completed");
      setProgress(100);
      setStatusMessage("移动端生成功能将在 Phase 3 实现");
    }, 2000);

    return () => clearTimeout(timer);
  }, [description]);

  if (status === "error") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorEmoji}>😵</Text>
        <Text style={styles.errorText}>生成失败</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>返回首页</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 进度指示 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{statusMessage}</Text>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>

      {/* 生成中动画 */}
      {status === "generating" && (
        <View style={styles.generatingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.generatingText}>AI 创意引擎运行中...</Text>
        </View>
      )}

      {/* 完成状态 */}
      {status === "completed" && cards.length === 0 && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderEmoji}>🚧</Text>
          <Text style={styles.placeholderTitle}>移动端开发中</Text>
          <Text style={styles.placeholderDesc}>
            卡片滑动浏览功能将在 Phase 3 完整实现。{"\n"}
            当前可通过 Web 端体验完整功能。
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>← 返回首页</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// 移动端本地类型（共享包链接待 Phase 3 完善）
type MarketingCard = {
  id: string;
  headline: string;
  body: string;
  imageUrl: string | null;
  angleType: string;
  angleLabel: string;
  isSaved: boolean;
  createdAt: string;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 24 },
  progressContainer: { marginTop: 20, marginBottom: 40 },
  progressBar: {
    height: 4,
    backgroundColor: "#27272a",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7c3aed",
    borderRadius: 2,
  },
  progressText: { color: "#a1a1aa", fontSize: 14, marginTop: 12, textAlign: "center" },
  progressPercent: { color: "#71717a", fontSize: 12, marginTop: 4, textAlign: "center" },
  generatingContainer: { alignItems: "center", paddingTop: 40 },
  generatingText: { color: "#a1a1aa", fontSize: 14, marginTop: 16 },
  placeholderContainer: { alignItems: "center", paddingTop: 40 },
  placeholderEmoji: { fontSize: 48, marginBottom: 16 },
  placeholderTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 12 },
  placeholderDesc: {
    fontSize: 14, color: "#71717a", textAlign: "center",
    lineHeight: 22, marginBottom: 24,
  },
  errorEmoji: { fontSize: 48, textAlign: "center", marginTop: 60 },
  errorText: { color: "#f87171", fontSize: 16, textAlign: "center", marginTop: 12 },
  retryButton: {
    backgroundColor: "#27272a", borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24, marginTop: 16,
  },
  retryButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
