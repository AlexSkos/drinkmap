// src/screens/ReportScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Image,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useLang } from "../i18n/LanguageContext";

/* === THEME === */
const BRAND_COLOR = "#6c97b0";
const TOPBAR_H = 100;
const BOTBAR_H = 64;



/* --- картинки как на главном экране --- */
const TITLE_IMG = require("../../assets/Mapa_txt_png_02.png");
const FOUNTAIN_HERO = require("../../assets/fountain_png_01.png");

type Props = NativeStackScreenProps<RootStackParamList, "Report">;

export default function ReportScreen({ navigation }: Props) {
  const { t } = useLang(); // ← хук ДОЛЖЕН быть внутри компонента
  const insets = useSafeAreaInsets();
  const [msg, setMsg] = React.useState("");
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

  const onSend = () => {
    Alert.alert(t("thanks"), t("message_queued_stub"));
    setMsg("");
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

      {/* Логотип + фонтан */}
      <View style={styles.header}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
        <View style={styles.heroWrap}>
          <Image source={FOUNTAIN_HERO} style={styles.hero} resizeMode="contain" />
        </View>
      </View>

      {/* Карточка с формой */}
      <View style={styles.cardWrap}>
        <Text style={styles.cardTitle}>🛠️{"  "}{t("report")}</Text>
        <Text style={styles.label}>{t("send_message")}:</Text>

        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder={t("issue_placeholder")}
          multiline
          textAlignVertical="top"
          style={styles.input}
        />

        <View style={styles.row}>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onSend}>
            <Text style={[styles.btnTxt, styles.btnTxtPrimary]}>{t("send")}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => navigation.replace("Menu")}>
            <Text style={styles.btnTxt}>{t("back_to_menu")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Нижняя полоса */}
      
    </View>
  );
}

const SHADOW =
  Platform.OS === "android"
    ? { elevation: 10 }
    : {
        shadowColor: "rgba(0,0,0,0.25)",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
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

  /* Шапка с логотипом */
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

  cardWrap: {
    marginTop: 10,
    marginHorizontal: 22,
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    ...SHADOW,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  label: {
    marginTop: 6,
    marginBottom: 8,
    color: BRAND_COLOR,
    fontSize: 18,
    fontWeight: "800",
  },
  input: {
    minHeight: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    fontSize: 16,
  },

  row: { flexDirection: "row", gap: 12, marginTop: 14 },

  btn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: BRAND_COLOR },
  btnTxt: { fontSize: 16, fontWeight: "800", color: "#111827" },
  btnTxtPrimary: { color: "#fff" },

});
