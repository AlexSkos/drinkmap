// src/screens/HistoryScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useLang } from "../i18n/LanguageContext";

const BRAND_COLOR = "#6c97b0";
const TOPBAR_H = 80;

const TITLE_IMG = require("../../assets/Mapa_txt_png_02.png");
const FOUNTAIN_HERO = require("../../assets/fountain_png_01.png");

type Props = NativeStackScreenProps<RootStackParamList, "History">;

export default function HistoryScreen({ navigation }: Props) {
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLOR} />

      {/* Верхняя полоса */}
      <SafeAreaView style={{ backgroundColor: BRAND_COLOR }} />
      <View style={[styles.topBar, { height: TOPBAR_H }]} />

      {/* Шапка с логотипом */}
      <View style={styles.header}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
        <View style={styles.heroWrap}>
          <Image source={FOUNTAIN_HERO} style={styles.hero} resizeMode="contain" />
        </View>
      </View>

      {/* Контентная область занимает всё оставшееся место */}
      <View style={styles.content}>
        <View style={styles.cardWrap}>
          <Text style={styles.cardTitle}>{t("guideTitle")}</Text>

          {/* Скролл внутри карточки занимает всё оставшееся место */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.p}>{t("historyText")}</Text>
          </ScrollView>

          <Pressable style={styles.menuBtn} onPress={() => navigation.replace("Menu")}>
            <Text style={styles.menuBtnText}>{t("back_to_menu")}</Text>
          </Pressable>
        </View>
      </View>
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
  topBar: { backgroundColor: BRAND_COLOR },

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

  /* Вся оставшаяся часть экрана */
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 0,
  },

  /* Карточка тянется по высоте контента и может заполнять всё */
  cardWrap: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },

  /* Скролл внутри карточки — flex:1, чтобы кнопка была внизу карточки */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  p: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
  },

  menuBtn: {
    marginTop: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  menuBtnText: { fontSize: 16, fontWeight: "800", color: "#111827" },
});

