import AsyncStorage from '@react-native-async-storage/async-storage';
export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try { const v = await AsyncStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
  },
  async set(key: string, value: unknown) { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} },
  async remove(key: string) { try { await AsyncStorage.removeItem(key); } catch {} },
};
