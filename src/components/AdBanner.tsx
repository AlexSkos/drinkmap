// src/components/AdBanner.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

// Тестовый unitId от Google. Перед релизом поменяешь на свой реальный.
const unitId = __DEV__ ? TestIds.BANNER : "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";

export default function AdBanner() {
  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(e) => {
          // Тихо гасим ошибки показа, чтобы UI не скакал
          console.log("Ad failed:", e?.message);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    // можно держать небольшой нижний отступ
    marginBottom: 8,
  },
});
