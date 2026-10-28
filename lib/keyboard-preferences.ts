import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, NativeModules, Platform } from "react-native";

export type KeyboardTheme = "light" | "dark";

export type KeyboardSettings = {
  height: number;
  autoCorrect: boolean;
  suggestions: boolean;
  theme: KeyboardTheme;
};

const STORAGE_KEY = "ioskey.keyboard.settings";

export const DEFAULT_KEYBOARD_SETTINGS: KeyboardSettings = {
  height: 284,
  autoCorrect: true,
  suggestions: true,
  theme: "light",
};

type NativeKeyboardPreferences = {
  setKeyboardHeight?: (height: number) => void;
  setAutoCorrectEnabled?: (enabled: boolean) => void;
  setSuggestionsEnabled?: (enabled: boolean) => void;
  setTheme?: (theme: string) => void;
  openInputMethodSettings?: () => void;
  showInputMethodPicker?: () => void;
};

const nativeKeyboard = NativeModules.KeyboardPreferences as NativeKeyboardPreferences | undefined;

export async function loadKeyboardSettings(): Promise<KeyboardSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_KEYBOARD_SETTINGS;
    const saved = JSON.parse(raw) as Partial<KeyboardSettings>;
    return {
      ...DEFAULT_KEYBOARD_SETTINGS,
      ...saved,
      height: clampHeight(Number(saved.height ?? DEFAULT_KEYBOARD_SETTINGS.height)),
    };
  } catch {
    return DEFAULT_KEYBOARD_SETTINGS;
  }
}

export async function saveKeyboardSettings(settings: KeyboardSettings) {
  const normalized: KeyboardSettings = {
    ...settings,
    height: clampHeight(settings.height),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  nativeKeyboard?.setKeyboardHeight?.(normalized.height);
  nativeKeyboard?.setAutoCorrectEnabled?.(normalized.autoCorrect);
  nativeKeyboard?.setSuggestionsEnabled?.(normalized.suggestions);
  nativeKeyboard?.setTheme?.(normalized.theme);
}

export function clampHeight(value: number) {
  return Math.min(360, Math.max(220, Math.round(value / 4) * 4));
}

export function openInputMethodSettings() {
  if (Platform.OS !== "web" && nativeKeyboard?.openInputMethodSettings) {
    nativeKeyboard.openInputMethodSettings();
    return;
  }
  void Linking.openSettings();
}

export function showInputMethodPicker() {
  if (Platform.OS !== "web" && nativeKeyboard?.showInputMethodPicker) {
    nativeKeyboard.showInputMethodPicker();
    return;
  }
  openInputMethodSettings();
}
