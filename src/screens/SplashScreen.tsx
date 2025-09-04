// src/screens/SplashScreen.tsx
import React from "react";
import { View, Image, StyleSheet, StatusBar, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = { Splash: undefined; Menu: undefined; Map: undefined };
type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

/* === Настройки заставки === */
const MIN_DURATION_MS = 3000; // минимум 3 секунды
const IMAGE_SRC = require("../../assets/start_screen_02.jpg");
const IMAGE_ASPECT: "contain" | "cover" = "contain";

/* === Версию вписываешь вручную === */
const APP_VERSION = "0.0.1"; // ← поменяешь на любую (например 0.0.2)

/* Положение текста версии (px от нижнего края) */
const VERSION_OFFSET_FROM_BOTTOM = 90;

export default function SplashScreen({ navigation }: Props) {
  React.useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace("Menu");
    }, MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0ea5e9" />
      <Image source={IMAGE_SRC} style={styles.img} resizeMode={IMAGE_ASPECT} />

      {/* Версия приложения */}
      <View style={[styles.versionWrap, { bottom: VERSION_OFFSET_FROM_BOTTOM }]}>
        <Text style={styles.versionText}>v{APP_VERSION}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: "120%",
    height: "120%",
  },
  versionWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    fontWeight: "600",
  },
});

