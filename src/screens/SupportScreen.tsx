// src/screens/SupportScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { useLang } from "../i18n/LanguageContext";

const BRAND_COLOR = "#6c97b0";
const TOPBAR_H = 100;

const TITLE_IMG = require("../../assets/Mapa_txt_png_02.png");
const FOUNTAIN_HERO = require("../../assets/fountain_png_01.png");

type Props = NativeStackScreenProps<RootStackParamList, "Support">;

export default function SupportScreen({ navigation }: Props) {
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  const preset = [1, 10, 25];
  const [selected, setSelected] = React.useState<number | null>(1);
  const [amount, setAmount] = React.useState<string>("1");

  const choose = (v: number) => {
    setSelected(v);
    setAmount(String(v));
  };

  const onContinue = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num < 1) {
      Alert.alert("Error", t("minAmount") || "Minimum donation is 1 €");
      return;
    }
    Alert.alert("Donate", `You chose ${num} €`);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_COLOR} />
      <SafeAreaView style={{ backgroundColor: BRAND_COLOR }} />
      <View style={[styles.topBar, { height: TOPBAR_H }]} />

      {/* Шапка */}
      <View style={styles.header}>
        <Image source={TITLE_IMG} style={styles.titleImg} resizeMode="contain" />
        <View style={styles.heroWrap}>
          <Image source={FOUNTAIN_HERO} style={styles.hero} resizeMode="contain" />
        </View>
      </View>

      {/* Контент (скролл + подъем при клавиатуре) */}
      <KeyboardAvoidingKeyboardWrapper>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrap}>
            {/* Быстрые суммы */}
            {preset.map((v, i) => {
              const active = selected === v;
              return (
                <View key={v} style={i > 0 ? { marginTop: 14 } : undefined}>
                  <Pressable
                    onPress={() => choose(v)}
                    style={({ pressed }) => [
                      styles.amountBtn,
                      active && styles.amountBtnActive,
                      pressed && { opacity: 0.95 },
                    ]}
                    android_ripple={{ color: "#e6eff5" }}
                  >
                    <Text style={[styles.amountText, active && styles.amountTextActive]}>{v} €</Text>
                  </Pressable>
                </View>
              );
            })}

            {/* Разделитель */}
            <View style={styles.orRow}>
              <View style={styles.hr} />
              <Text style={styles.orText}>{t("or") || "or"}</Text>
              <View style={styles.hr} />
            </View>

            {/* Поле ввода суммы */}
            <View style={styles.inputWrap}>
              <Text style={styles.currency}>€</Text>
              <TextInput
                value={amount}
                onChangeText={(txt) => {
                  let clean = txt.replace(/[^\d]/g, "");
                  if (clean !== "" && parseInt(clean, 10) < 1) clean = "1";
                  setAmount(clean);
                  setSelected(null);
                }}
                placeholder={t("typeAmount") || "Type your amount"}
                keyboardType="number-pad"
                returnKeyType="done"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Continue */}
            <Pressable
              style={({ pressed }) => [
                styles.continueBtn,
                { backgroundColor: BRAND_COLOR },
                pressed && { opacity: 0.92 },
              ]}
              onPress={onContinue}
            >
              <Text style={styles.continueText}>{t("continue") || "Continue"}</Text>
            </Pressable>

            {/* Back */}
            <Pressable style={styles.menuBtn} onPress={() => navigation.replace("Menu")}>
              <Text style={styles.menuBtnText}>{t("back_to_menu") || "Back to menu"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingKeyboardWrapper>
    </View>
  );
}

/** Небольшая обертка для Android/iOS, чтобы поле не пряталось под клавиатурой */
function KeyboardAvoidingKeyboardWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {children}
      </KeyboardAvoidingView>
    );
  }
  return <>{children}</>;
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
  heroWrap: { width: 150, height: "100%", alignItems: "center", justifyContent: "center", marginLeft: 8 },
  hero: { width: "100%", height: "85%" },

  scroll: { flex: 1 },

  cardWrap: {
    marginTop: 10,
    borderRadius: 22,
    backgroundColor: "#fff",
    padding: 18,
    ...SHADOW,
  },

  amountBtn: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    alignItems: "center",
  },
  amountBtnActive: {
    backgroundColor: "#dbeafe",
    borderColor: BRAND_COLOR,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  amountTextActive: {
    color: "#335466",
  },

  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  hr: { flex: 1, height: 1.5, backgroundColor: "#6c97b0" },
  orText: { color: "#0f172a", fontWeight: "800", marginHorizontal: 14 },

  inputWrap: { position: "relative", marginTop: 6, marginBottom: 14 },
  currency: {
    position: "absolute",
    left: 14,
    top: 0,
    bottom: 0,
    textAlignVertical: "center",
    color: "#9ca3af",
    fontWeight: "800",
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingLeft: 36,
    paddingRight: 12,
    fontSize: 18,
    color: "#111827",
    backgroundColor: "#fff",
  },

  continueBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  continueText: { fontSize: 18, fontWeight: "900", color: "#fff" },

  menuBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  menuBtnText: { fontSize: 16, fontWeight: "800", color: "#111827" },
});
