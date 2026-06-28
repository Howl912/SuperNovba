import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!description.trim() || isGenerating) return;
    setIsGenerating(true);

    // 传递参数到生成页面
    router.push({
      pathname: "/(tabs)/generate",
      params: { description: description.trim() },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          用 AI 打开{"\n"}产品营销的想象力
        </Text>
        <Text style={styles.heroSubtitle}>
          输入任意产品，AI 从情感、数据、幽默等多角度{"\n"}
          生成创意营销方向
        </Text>
      </View>

      {/* 输入区域 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={description}
          onChangeText={setDescription}
          placeholder='输入一款产品或一件物品...'
          placeholderTextColor="#71717a"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isGenerating}
        />

        <TouchableOpacity
          style={[
            styles.generateButton,
            (!description.trim() || isGenerating) && styles.generateButtonDisabled,
          ]}
          onPress={handleGenerate}
          disabled={!description.trim() || isGenerating}
          activeOpacity={0.8}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? "生成中..." : "✨ 生成营销创意"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 特性说明 */}
      <View style={styles.features}>
        <FeatureCard emoji="🎯" title="多维创意" desc="5种创意透镜" />
        <FeatureCard emoji="⚡" title="快速生成" desc="10秒出结果" />
        <FeatureCard emoji="✨" title="激发灵感" desc="打开想象空间" />
      </View>
    </ScrollView>
  );
}

function FeatureCard({
  emoji,
  title,
  desc,
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 24, paddingTop: 40 },
  hero: { marginBottom: 32, alignItems: "center" },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#a1a1aa",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
  inputContainer: { marginBottom: 40 },
  textInput: {
    backgroundColor: "rgba(24,24,27,0.8)",
    borderColor: "rgba(63,63,70,0.5)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    minHeight: 120,
  },
  generateButton: {
    backgroundColor: "#7c3aed",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  features: {
    flexDirection: "row",
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "rgba(24,24,27,0.5)",
    borderColor: "rgba(39,39,42,0.5)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  featureEmoji: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 4 },
  featureDesc: { fontSize: 12, color: "#71717a", textAlign: "center" },
});
