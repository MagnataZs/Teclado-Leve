import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { KeyboardSettings } from "@/lib/keyboard-preferences";

type KeyboardPreviewProps = {
  settings: KeyboardSettings;
};

const rows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

export function KeyboardPreview({ settings }: KeyboardPreviewProps) {
  const previewHeight = Math.min(252, Math.max(194, settings.height * 0.7));
  const isDark = settings.theme === "dark";

  return (
    <View style={[styles.shell, { height: previewHeight }, isDark && styles.shellDark]}>
      {settings.suggestions ? (
        <View style={[styles.suggestionBar, isDark && styles.suggestionBarDark]}>
          <Text style={[styles.suggestion, isDark && styles.textLight]}>olá</Text>
          <Text style={[styles.suggestionActive, isDark && styles.suggestionActiveDark]}>olá!</Text>
          <Text style={[styles.suggestion, isDark && styles.textLight]}>olhar</Text>
          <View style={styles.suggestionSpark}>
            <View style={styles.sparkDot} />
          </View>
        </View>
      ) : null}
      <View style={styles.keyRows}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => {
              const isAction = key === "⇧" || key === "⌫";
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.key,
                    isAction && styles.actionKey,
                    isDark && styles.keyDark,
                    pressed && styles.keyPressed,
                  ]}
                >
                  {key === "⌫" ? (
                    <Ionicons name="backspace-outline" size={14} color={isDark ? "#F5F1E8" : "#303238"} />
                  ) : (
                    <Text style={[styles.keyText, isDark && styles.textLight]}>{key}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={styles.bottomRow}>
          <Pressable style={[styles.bottomKey, isDark && styles.actionKeyDark]}><Text style={[styles.bottomText, isDark && styles.textLight]}>123</Text></Pressable>
          <Pressable style={[styles.spaceKey, isDark && styles.spaceKeyDark]}><Text style={[styles.spaceText, isDark && styles.textLight]}>português (BR)</Text></Pressable>
          <Pressable style={[styles.bottomKey, isDark && styles.actionKeyDark]}><Text style={[styles.bottomText, isDark && styles.textLight]}>↵</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    borderRadius: 22,
    backgroundColor: "#E8E8ED",
    paddingHorizontal: 7,
    paddingTop: 7,
    paddingBottom: 8,
    overflow: "hidden",
  },
  shellDark: { backgroundColor: "#202126" },
  suggestionBar: {
    height: 31,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#C5C6CB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    gap: 9,
  },
  suggestionBarDark: { borderBottomColor: "#3B3C43" },
  suggestion: { flex: 1, fontSize: 11, color: "#676A72", textAlign: "center" },
  suggestionActive: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: "#1B1D21",
    fontSize: 11,
    backgroundColor: "#D8F56A",
    paddingVertical: 5,
    borderRadius: 8,
  },
  suggestionActiveDark: { color: "#111214" },
  suggestionSpark: { width: 17, alignItems: "center" },
  sparkDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D8F56A" },
  keyRows: { flex: 1, justifyContent: "space-between", paddingTop: 5 },
  keyRow: { flexDirection: "row", gap: 5, justifyContent: "center" },
  key: {
    flex: 1,
    height: 30,
    maxWidth: 34,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#808188",
    shadowOpacity: 0.14,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  keyDark: { backgroundColor: "#34353B", shadowOpacity: 0 },
  actionKey: { backgroundColor: "#D2D3D8" },
  actionKeyDark: { backgroundColor: "#4B4C54" },
  keyPressed: { transform: [{ scale: 0.94 }], opacity: 0.78 },
  keyText: { fontSize: 14, color: "#303238", fontWeight: "500" },
  textLight: { color: "#F5F1E8" },
  bottomRow: { flexDirection: "row", gap: 5, alignItems: "center" },
  bottomKey: { width: 44, height: 30, borderRadius: 6, backgroundColor: "#D2D3D8", alignItems: "center", justifyContent: "center" },
  spaceKey: { flex: 1, height: 30, borderRadius: 6, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  spaceKeyDark: { backgroundColor: "#34353B" },
  bottomText: { fontSize: 10, color: "#303238", fontWeight: "700" },
  spaceText: { fontSize: 9, color: "#62646B" },
});
