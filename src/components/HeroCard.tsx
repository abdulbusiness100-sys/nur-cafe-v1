import React from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../theme/colors";
import type { MenuItem } from "../data/menu";

const W = Dimensions.get("window").width;
const CARD_W = W * 0.86;

type Props = {
    item: MenuItem;
    onPress?: (item: MenuItem) => void;
};

export default function HeroCard({ item, onPress }: Props) {
    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.95}
            onPress={() => onPress?.(item)}
        >
            {item.image ? (
                <Image source={typeof item.image === 'number' ? item.image : { uri: item.image as string }} style={styles.img} />
            ) : (
                <View style={[styles.img, styles.imgPlaceholder]} />
            )}

            <LinearGradient
                colors={["rgba(0,0,0,0.18)", "rgba(0,0,0,0)"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.25 }}
                style={styles.gradTop}
            />
            <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.55)"]}
                start={{ x: 0.5, y: 0.2 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradBottom}
            />

            <View style={styles.textWrap}>
                <Text style={styles.season}>Autumn 2025</Text>
                <Text style={styles.title} numberOfLines={2}>
                    {item.name}
                </Text>
                <TouchableOpacity style={styles.btn} activeOpacity={0.9} onPress={() => onPress?.(item)}>
                    <Text style={styles.btnText}>ORDER NOW</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_W,
        height: CARD_W * 1.1,
        borderRadius: 28,
        overflow: "hidden",
        marginRight: 14,
        backgroundColor: colors.card,
        position: "relative",
    },
    img: { width: "100%", height: "100%" },
    imgPlaceholder: { backgroundColor: colors.brandSoft },
    gradTop: { position: "absolute", left: 0, right: 0, top: 0, height: "25%" },
    gradBottom: { position: "absolute", left: 0, right: 0, bottom: 0, height: "45%" },
    textWrap: { position: "absolute", left: 18, right: 18, bottom: 18 },
    season: {
        color: "#F4F1EE",
        opacity: 0.95,
        fontSize: 16,
        marginBottom: 4,
        fontFamily: "Manrope_700Bold",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 34,
        lineHeight: 36,
        fontFamily: "Manrope_800ExtraBold",
        textShadowColor: "rgba(0,0,0,0.25)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    btn: {
        backgroundColor: colors.card,
        borderRadius: 28,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 14,
        borderWidth: 2,
        borderColor: colors.brand,
    },
    btnText: {
        color: colors.brand,
        fontFamily: "Manrope_800ExtraBold",
        letterSpacing: 0.5,
    },
});
