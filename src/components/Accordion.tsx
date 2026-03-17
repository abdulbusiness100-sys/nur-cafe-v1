// src/components/Accordion.tsx
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../theme/colors";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type QA = { q: string; a: string };
type Props = { items: QA[] };

export default function Accordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => (v === i ? null : i));
  };

  return (
    <View style={{ gap: 10 }}>
      {items.map((it, i) => {
        const expanded = open === i;
        return (
          <View key={`faq-${i}`} style={styles.card}>
            <Pressable style={styles.row} onPress={() => toggle(i)}>
              <Text style={styles.q}>{it.q}</Text>
              <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.text} />
            </Pressable>
            {expanded && <Text style={styles.a}>{it.a}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  q: { flex: 1, fontSize: 16, fontWeight: "700", color: colors.text, marginRight: 6 },
  a: { marginTop: 8, color: colors.subText, lineHeight: 20, fontSize: 14 },
});
