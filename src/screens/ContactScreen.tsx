// src/screens/ContactScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Image,
  Platform,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useLang } from "../i18n/LanguageContext";

const BRAND_COLOR = "#6c97b0";
const TOPBAR_H = 100;
const BOTBAR_H = 64;



const TITLE_IMG = require("../../assets/Mapa_txt_png_02.png");
const FOUNTAIN_HERO = require("../../assets/fountain_png_01.png");

type Props = NativeStackScreenProps<RootStackParamList, "Contact">;

export default function ContactScreen({ navigation }: Props) {
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const [locText, setLocText] = React.useState("—");

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        const acc = pos.coords.accuracy ? ` ±${Math.round(pos.coords.accuracy)}m` : "";
        setLocText(`${lat}, ${lng}${acc}`);
      } catch {}
    })();
  }, []);

  // Левый столбец (подписи)
  const labels = ["e-mail", "telegram", "instagram"];

  // Правый столбец (кликабельные контакты)
  const links = [
    { label: "vinchensocarbone@gmail.com", url: "mailto:vinchensocarbone@gmail.com" },
    { label: "t.me/aleksandrskosyrskii", url: "https://t.me/aleksandrskosyrskii" },
    {
      label: "instagram.com/alexanderskosyrskiy",
      url: "https://www.instagram.com/alexanderskosyrskiy/",
    },
  ];

  const open = (url?: string) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.root, { paddingBottom: BOTBAR_H + insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLOR} />

      {/* Верхняя полоса */}
      <SafeAreaView style={{ backgroundColor: BRAND_COLOR }} />
      <View style={[styles.topBar, { height: TOPBAR_H }]}>
        <Text style={styles.topBarCoords} numberOfLines={1}>
          {locText}
        </Text>
      </View>

      {/* Шапка */}
      <View style={styles.header}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
        <View style={styles.heroWrap}>
          <Image source={FOUNTAIN_HERO} style={styles.hero} resizeMode="contain" />
        </View>
      </View>

      {/* Контент */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.envelope}>✉️</Text>
          <Text style={styles.sectionTitle}>{t("contact_title") || "Contact us"}</Text>
        </View>

        <View style={styles.grid}>
          {/* Левый столбец — подписи */}
          <View style={styles.colLeft}>
            {labels.map((txt) => (
              <Text key={txt} style={styles.labelText}>
                {txt}
              </Text>
            ))}
          </View>

          {/* Правый столбец — кликабельные ссылки */}
          <View style={styles.colRight}>
            {links.map((it) => (
              <Pressable
                key={it.label}
                onPress={() => open(it.url)}
                style={styles.linkWrap}
                android_ripple={{ color: "#e6eff5" }}
                accessibilityRole="link"
                accessibilityLabel={it.label}
              >
                <Text
                  style={styles.linkText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {it.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.menuBtn} onPress={() => navigation.replace("Menu")}>
          <Text style={styles.menuBtnText}>{t("back_to_menu") || "Back to menu"}</Text>
        </Pressable>
      </View>

      {/* Нижняя полоса */}
     
    </View>
  );
}

const SHADOW =
  Platform.OS === "android"
    ? { elevation: 8 }
    : {
        shadowColor: "rgba(0,0,0,0.2)",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  topBar: {
    backgroundColor: BRAND_COLOR,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  topBarCoords: {
    position: "absolute",
    right: 12,
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  header: {
    height: 160,
    flexDirection: "row",
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
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

  content: {
    marginTop: 16,
    paddingHorizontal: 28,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  envelope: { fontSize: 26 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  grid: {
    flexDirection: "row",
    gap: 28,
    paddingRight: 12,
    paddingBottom: 10,
  },

  colLeft: { flex: 1, paddingRight: 6 },
  colRight: { flex: 1, minWidth: 0 }, // minWidth:0 нужно, чтобы Text корректно обрезался

  labelText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    paddingVertical: 12,
  },

  linkWrap: { paddingVertical: 12 },
  linkText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6c97b0",
  },

  menuBtn: {
    marginTop: 26,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    ...SHADOW,
  },
  menuBtnText: { fontSize: 16, fontWeight: "800", color: "#111827" },
});

