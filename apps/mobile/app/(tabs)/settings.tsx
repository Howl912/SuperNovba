import { View, Text, StyleSheet } from "react-native";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚙️</Text>
      <Text style={styles.title}>设置</Text>
      <Text style={styles.subtitle}>账号和偏好设置将在后续版本中开放</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>SuperNovba v0.1.0</Text>
        <Text style={styles.infoText}>
          跨平台 AI 多模态营销物料生成工具
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#71717a", textAlign: "center", marginBottom: 32 },
  infoCard: {
    backgroundColor: "rgba(24,24,27,0.5)",
    borderColor: "rgba(39,39,42,0.5)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  infoTitle: { fontSize: 15, fontWeight: "600", color: "#fff", marginBottom: 4 },
  infoText: { fontSize: 13, color: "#71717a", textAlign: "center" },
});
