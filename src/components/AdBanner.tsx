// src/components/AdBanner.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAdsConsent } from "../ads/AdsConsentContext";

const unitId = __DEV__ ? TestIds.BANNER : "ca-app-pub-7043971991251749/4304794200";

export default function AdBanner() {
  const { adsReady } = useAdsConsent();

  if (!adsReady) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
