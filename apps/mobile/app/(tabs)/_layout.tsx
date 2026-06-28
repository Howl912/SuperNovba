import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#27272a",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#a855f7",
        tabBarInactiveTintColor: "#71717a",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          headerTitle: "SuperNovba",
          tabBarLabel: "首页",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: "生成",
          headerTitle: "创意生成",
          tabBarLabel: "生成",
          tabBarIcon: ({ color }) => <TabIcon emoji="✨" color={color} />,
          href: null, // 不在 tab 中显示，通过首页跳转
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "收藏",
          headerTitle: "我的收藏",
          tabBarLabel: "收藏",
          tabBarIcon: ({ color }) => <TabIcon emoji="📚" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          headerTitle: "设置",
          tabBarLabel: "设置",
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}

// 简易 Emoji Tab Icon（生产环境建议用 @expo/vector-icons）
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return (
    <Text style={{ fontSize: 20, color, opacity: color === "#71717a" ? 0.5 : 1 }}>
      {emoji}
    </Text>
  );
}
