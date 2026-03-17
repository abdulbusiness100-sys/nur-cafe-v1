import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../theme/colors";

type Props = { name?: string };

export default function AvatarButton({ name = "S" }: Props) {
  const nav = useNavigation<any>();
  const initial = (name || "S").trim().charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => nav.navigate("Profile")}
      hitSlop={10}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <View style={styles.badge}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
    </Pressable>
  );
}

const SIZE = 36;
const styles = StyleSheet.create({
  wrap: { padding: 2, borderRadius: 999 },
  badge: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand, // Nur green, so it pops like Blank Street
    borderWidth: 3,
    borderColor: colors.bg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  initial: { color: colors.card, fontWeight: "800" },
});
