// src/storage/ratings.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (id: string) => `rating_${id}`;

export async function getRating(id: string): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(key(id));
    const n = v ? parseInt(v, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

// ставим рейтинг только если не был установлен ранее
export async function setRatingOnce(id: string, value: number): Promise<number> {
  try {
    const existing = await AsyncStorage.getItem(key(id));
    if (existing) {
      const n = parseInt(existing, 10) || 0;
      return n; // уже есть — возвращаем прежнее
    }
    await AsyncStorage.setItem(key(id), String(value));
    return value;
  } catch {
    return 0;
  }
}

