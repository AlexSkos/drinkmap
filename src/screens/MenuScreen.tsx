// src/screens/MenuScreen.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useLang } from "../i18n/LanguageContext";
import { useAdsConsent } from "../ads/AdsConsentContext";

// ↓↓↓ AdMob
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

/* =======================
   KNOBS
======================= */
const BRAND_COLOR = "#6c97b0";
const TOPBAR_H = 100;
const BOTBAR_H = 44;

// Позиция переключателя языка (в синей полосе)
const LANG_SWITCHER_TOP = 56;
const LANG_SWITCHER_LEFT = 12;

// Геометрия сетки
const GRID_HPAD = 16;
const COL_GAP = 14;
const MIN_TILE_W = 150;

// Размеры карточек/текста
const SCALE = 0.8;
const BASE_TILE_HEIGHT = 145;
const TILE_HEIGHT = Math.round(BASE_TILE_HEIGHT * SCALE);
const TILE_RADIUS = 16;
const TILE_PAD = Math.round(14 * SCALE);
const ICON_SIZE = Math.round(40 * SCALE);
const SUBTITLE_FS = Math.max(12, Math.round(15 * SCALE));

// Шапка
const HEADER_HEIGHT = 170;
const HEADER_PAD_H = 30;
const GRID_TOP_MARGIN = 85;

/* =======================
   COLORS / ASSETS
======================= */
const COLORS = {
  brand: BRAND_COLOR,
  bg: "#ffffff",
  title: "#0f172a",
  tileBg: "#d2dfe6",
  tileText: "#0f172a",
};

const TITLE_IMG = require("../../assets/Mapa_txt_png_02.png");
const FOUNTAIN_HERO = require("../../assets/fountain_png_01.png");

// Ключ для кэша координат
const LAST_LOC_KEY = "menu:last_location";

type Props = NativeStackScreenProps<RootStackParamList, "Menu">;

type MenuItem = {
  key: string;
  title: string;
  emoji: string;
  onPress: () => void;
};

// PROD ID сюда
const PROD_BANNER_UNIT_ID = "ca-app-pub-7043971991251749/4304794200";
const BANNER_UNIT_ID = __DEV__ ? TestIds.BANNER : PROD_BANNER_UNIT_ID;

export default function MenuScreen({ navigation }: Props) {
  const { width: screenW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { lang, setLang, t } = useLang();
  const { adsReady, privacyOptionsRequired, showPrivacyOptions } = useAdsConsent();

  const handlePrivacyOptionsPress = React.useCallback(() => {
    showPrivacyOptions().catch((error) => {
      if (__DEV__) {
        console.warn("Privacy options form failed:", error);
      }
    });
  }, [showPrivacyOptions]);

  // геолокация в топ-баре (замораживаем до рестарта)
  const [loc, setLoc] = React.useState<{ lat: number; lng: number; acc?: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        // 1) сперва из кэша
        const saved = await AsyncStorage.getItem(LAST_LOC_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
            setLoc(parsed);
            return;
          }
        }
        // 2) если нет — запросить
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          acc: pos.coords.accuracy ?? undefined,
        };
        setLoc(value);
        await AsyncStorage.setItem(LAST_LOC_KEY, JSON.stringify(value));
      } catch {}
    })();
  }, []);

  const locText = React.useMemo(() => {
    if (!loc) return "—";
    const lat = loc.lat.toFixed(4);
    const lng = loc.lng.toFixed(4);
    const acc = loc.acc ? ` ±${Math.round(loc.acc)}m` : "";
    return `${lat}, ${lng}${acc}`;
  }, [loc]);

  /* =======================
     LAYOUT: responsive
  ====================== */
  const gridW = Math.max(0, screenW - GRID_HPAD * 2);
  const canTwoCols = (gridW - COL_GAP) / 2 >= MIN_TILE_W;
  const cols = canTwoCols ? 2 : 1;
  const tileW = cols === 2 ? Math.floor((gridW - COL_GAP) / 2) : Math.floor(gridW);

  const items: MenuItem[] = [
    { key: "map", title: t("map"), emoji: "🗺️", onPress: () => navigation.replace("Map") },
    { key: "report", title: t("report"), emoji: "🛠️", onPress: () => navigation.navigate("Report") },
    { key: "guide", title: t("guide"), emoji: "📘", onPress: () => navigation.navigate("History") },
    { key: "contact", title: t("contact"), emoji: "✉️", onPress: () => navigation.navigate("Contact") },
  ];

  return (
    <View style={[styles.root, { paddingBottom: BOTBAR_H + insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.brand} />

      {/* Верхняя полоса */}
      <SafeAreaView style={{ backgroundColor: COLORS.brand }} />
      <View style={[styles.topBar, { height: TOPBAR_H }]}>
        {/* Переключатель языка */}
        <View style={[styles.langSwitcher, { top: LANG_SWITCHER_TOP, left: LANG_SWITCHER_LEFT }]}>
          <Pressable
            onPress={() => setLang("en")}
            style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
          >
            <Text style={[styles.langText, lang === "en" && styles.langTextActive]}>EN</Text>
          </Pressable>
          <Pressable
            onPress={() => setLang("es")}
            style={[styles.langBtn, lang === "es" && styles.langBtnActive]}
          >
            <Text style={[styles.langText, lang === "es" && styles.langTextActive]}>ES</Text>
          </Pressable>
        </View>

        {privacyOptionsRequired && (
          <Pressable
            onPress={handlePrivacyOptionsPress}
            style={({ pressed }) => [styles.privacyBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.privacyText}>{lang === "es" ? "Privacidad" : "Privacy"}</Text>
          </Pressable>
        )}

        <Text style={styles.topBarText} numberOfLines={1}>
          {locText}
        </Text>
      </View>

      {/* Шапка с изображениями */}
      <View style={[styles.header, { marginTop: 8 }]}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
        <View style={styles.heroWrap}>
          <Image source={FOUNTAIN_HERO} style={styles.hero} resizeMode="contain" />
        </View>
      </View>

      {/* Сетка */}
      <View style={[styles.grid, { marginTop: GRID_TOP_MARGIN, paddingHorizontal: GRID_HPAD }]}>
        <View style={[styles.tilesWrap, { width: gridW }]}>
          {items.map((it, idx) => {
            const isLeftInRow = cols === 2 ? idx % 2 === 0 : false;
            return (
              <Pressable
                key={it.key}
                style={({ pressed }) => [
                  styles.tile,
                  { width: tileW },
                  cols === 2 && isLeftInRow ? { marginRight: COL_GAP } : null,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                android_ripple={{ color: "#e6f6ff" }}
                onPress={it.onPress}
              >
                <Text style={styles.emoji}>{it.emoji}</Text>
                <Text style={styles.tileText} numberOfLines={2}>
                  {it.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

      </View>

      {/* Реклама (встроенный баннер AdMob) */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {adsReady && (
          <BannerAd
            unitId={BANNER_UNIT_ID}
            // Adaptive баннер сам подстроится по высоте, ширина берётся из контейнера
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          />
        )}
      </View>
    </View>
  );
}

/* =======================
   STYLES
======================= */
const TILE_SHADOW =
  Platform.OS === "android"
    ? { elevation: 6 }
    : {
        shadowColor: "rgba(0,0,0,0.24)",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },

  topBar: {
    backgroundColor: COLORS.brand,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  topBarText: {
    position: "absolute",
    right: 10,
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  privacyBtn: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  privacyText: {
    color: "#446577",
    fontWeight: "800",
  },

  langSwitcher: {
    position: "absolute",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  langBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
  langBtnActive: { backgroundColor: "#ffffff" },
  langText: { fontWeight: "800", color: "#446577" },
  langTextActive: { color: "#1f2a37" },

  header: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    paddingHorizontal: HEADER_PAD_H,
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleImg: { flex: 1, height: "80%" },
  heroWrap: {
    width: 150,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  hero: { width: "100%", height: "85%" },

  grid: { paddingBottom: 16 },
  tilesWrap: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },

  tile: {
    height: TILE_HEIGHT,
    backgroundColor: COLORS.tileBg,
    borderRadius: TILE_RADIUS,
    padding: TILE_PAD,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    ...TILE_SHADOW,
  },

  emoji: { fontSize: ICON_SIZE, marginBottom: Math.round(10 * SCALE) },
  tileText: {
    fontSize: SUBTITLE_FS,
    fontWeight: "700",
    color: COLORS.tileText,
    textAlign: "center",
  },

});






