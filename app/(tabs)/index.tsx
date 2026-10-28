import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { KeyboardPreview } from "@/components/keyboard-preview";
import { ScreenContainer } from "@/components/screen-container";
import {
  clampHeight,
  DEFAULT_KEYBOARD_SETTINGS,
  loadKeyboardSettings,
  openInputMethodSettings,
  saveKeyboardSettings,
  showInputMethodPicker,
  type KeyboardSettings,
} from "@/lib/keyboard-preferences";

const INK = "#F5F1E8";
const MUTED = "#96979D";
const CARD = "#1B1D21";
const BORDER = "#2B2D32";
const LIME = "#D8F56A";

export default function HomeScreen() {
  const [settings, setSettings] = useState<KeyboardSettings>(DEFAULT_KEYBOARD_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<KeyboardSettings>(DEFAULT_KEYBOARD_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    loadKeyboardSettings().then((loaded) => {
      setSettings(loaded);
      setSavedSettings(loaded);
      setLoading(false);
    });
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  const update = <K extends keyof KeyboardSettings>(key: K, value: KeyboardSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSavedMessage(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveKeyboardSettings(settings);
    setSavedSettings(settings);
    setSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2200);
  };

  if (loading) {
    return (
      <ScreenContainer containerClassName="bg-[#111214]" safeAreaClassName="bg-[#111214]">
        <View style={styles.loading}><ActivityIndicator color={LIME} /></View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      edges={["top", "left", "right"]}
      containerClassName="bg-[#111214]"
      safeAreaClassName="bg-[#111214]"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <View style={styles.brandLine}>
              <View style={styles.brandDot} />
              <Text style={styles.brand}>iOSKey</Text>
            </View>
            <Text style={styles.kicker}>CONTROLE DE DIGITAÇÃO</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>PRONTO</Text>
          </View>
        </View>

        <View style={styles.heroRow}>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Seu teclado,</Text>
            <Text style={styles.titleAccent}>do seu jeito.</Text>
            <Text style={styles.subtitle}>Leve, bonito e ajustado para a sua forma de digitar.</Text>
          </View>
          <View style={styles.heroMark}><Ionicons name="sparkles" size={22} color="#111214" /></View>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardEyebrow}>PREVIEW AO VIVO</Text>
              <Text style={styles.cardTitle}>Toque, veja, ajuste.</Text>
            </View>
            <Text style={styles.heightBadge}>{settings.height} dp</Text>
          </View>
          <KeyboardPreview settings={settings} />
          <Text style={styles.previewHint}>A aparência acompanha suas preferências.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>PERSONALIZAÇÃO</Text>
          <Text style={styles.sectionMeta}>LOCAL · SEM NUVEM</Text>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="resize-outline" size={18} color={LIME} /></View>
            <View style={styles.settingCopy}>
              <Text style={styles.settingTitle}>Altura do teclado</Text>
              <Text style={styles.settingCaption}>Mais espaço ou mais tela, você decide.</Text>
            </View>
            <Text style={styles.valueText}>{settings.height}</Text>
          </View>
          <View style={styles.stepper}>
            <Pressable style={styles.stepButton} onPress={() => update("height", clampHeight(settings.height - 8))}>
              <Ionicons name="remove" size={18} color={INK} />
            </Pressable>
            <View style={styles.stepTrack}><View style={[styles.stepFill, { width: `${((settings.height - 220) / 140) * 100}%` }]} /></View>
            <Pressable style={styles.stepButton} onPress={() => update("height", clampHeight(settings.height + 8))}>
              <Ionicons name="add" size={18} color={INK} />
            </Pressable>
          </View>
          <View style={styles.rangeLabels}><Text style={styles.rangeText}>220</Text><Text style={styles.rangeText}>360 dp</Text></View>

          <View style={styles.divider} />
          <PreferenceRow icon="create-outline" title="Autocorreção" caption="Corrige deslizes enquanto você escreve." value={settings.autoCorrect} onChange={(value) => update("autoCorrect", value)} />
          <View style={styles.divider} />
          <PreferenceRow icon="chatbubble-ellipses-outline" title="Sugestões" caption="Palavras relevantes na ponta dos dedos." value={settings.suggestions} onChange={(value) => update("suggestions", value)} />
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionLabel}>APARÊNCIA</Text></View>
        <View style={styles.themeRow}>
          <ThemeButton label="Claro" icon="sunny-outline" active={settings.theme === "light"} onPress={() => update("theme", "light")} />
          <ThemeButton label="Escuro" icon="moon-outline" active={settings.theme === "dark"} onPress={() => update("theme", "dark")} />
        </View>

        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, !isDirty && styles.saveButtonQuiet]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#111214" /> : <><Text style={styles.saveText}>{savedMessage ? "Preferências aplicadas" : "Aplicar preferências"}</Text><Ionicons name={savedMessage ? "checkmark" : "arrow-forward"} size={18} color="#111214" /></>}
        </Pressable>

        <View style={styles.activationCard}>
          <View style={styles.activationTop}><View style={styles.activationIcon}><Ionicons name="keypad-outline" size={18} color={LIME} /></View><View style={styles.activationCopy}><Text style={styles.activationTitle}>Quase pronto para digitar</Text><Text style={styles.activationText}>Ative o iOSKey no Android e escolha-o como teclado padrão.</Text></View></View>
          <View style={styles.activationActions}>
            <Pressable style={styles.secondaryButton} onPress={openInputMethodSettings}><Text style={styles.secondaryText}>Ativar teclado</Text><Ionicons name="settings-outline" size={15} color={INK} /></Pressable>
            <Pressable style={styles.secondaryButton} onPress={showInputMethodPicker}><Text style={styles.secondaryText}>Escolher</Text><Ionicons name="chevron-forward" size={15} color={INK} /></Pressable>
          </View>
        </View>

        <Text style={styles.footer}>iOSKey 1.0  ·  Digitação local  ·  Menos RAM, mais foco</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

type PreferenceRowProps = { icon: keyof typeof Ionicons.glyphMap; title: string; caption: string; value: boolean; onChange: (value: boolean) => void };
function PreferenceRow({ icon, title, caption, value, onChange }: PreferenceRowProps) {
  return <View style={styles.preferenceRow}><View style={styles.settingIcon}><Ionicons name={icon} size={18} color={LIME} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingCaption}>{caption}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: "#3A3C42", true: LIME }} thumbColor={value ? "#111214" : "#B8B9BD"} ios_backgroundColor="#3A3C42" /></View>;
}

type ThemeButtonProps = { label: string; icon: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void };
function ThemeButton({ label, icon, active, onPress }: ThemeButtonProps) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.themeButton, active && styles.themeButtonActive, pressed && styles.pressed]}><Ionicons name={icon} size={18} color={active ? "#111214" : MUTED} /><Text style={[styles.themeText, active && styles.themeTextActive]}>{label}</Text>{active && <Ionicons name="checkmark-circle" size={16} color="#111214" />}</Pressable>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34, gap: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  brandDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: LIME },
  brand: { color: INK, fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  kicker: { color: MUTED, fontSize: 9, fontWeight: "800", letterSpacing: 1.5, marginTop: 6 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, borderColor: "#33363B", borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: LIME },
  statusText: { color: MUTED, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  heroRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 12 },
  heroCopy: { flex: 1, paddingRight: 18 },
  title: { color: INK, fontSize: 34, lineHeight: 36, fontWeight: "800", letterSpacing: -1.3 },
  titleAccent: { color: LIME, fontSize: 34, lineHeight: 36, fontWeight: "800", letterSpacing: -1.3 },
  subtitle: { color: MUTED, fontSize: 14, lineHeight: 20, marginTop: 11, maxWidth: 270 },
  heroMark: { width: 53, height: 53, borderRadius: 18, backgroundColor: LIME, alignItems: "center", justifyContent: "center", transform: [{ rotate: "8deg" }] },
  previewCard: { backgroundColor: CARD, borderRadius: 24, borderWidth: 1, borderColor: BORDER, padding: 14, gap: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardEyebrow: { color: MUTED, fontSize: 9, letterSpacing: 1.5, fontWeight: "800" },
  cardTitle: { color: INK, fontSize: 16, fontWeight: "700", marginTop: 3 },
  heightBadge: { color: "#111214", fontSize: 11, fontWeight: "800", backgroundColor: LIME, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  previewHint: { color: MUTED, fontSize: 11, textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 3 },
  sectionLabel: { color: MUTED, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  sectionMeta: { color: "#5E6168", fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  settingsCard: { backgroundColor: CARD, borderRadius: 22, borderWidth: 1, borderColor: BORDER, padding: 15 },
  settingRow: { flexDirection: "row", alignItems: "center" },
  preferenceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 3 },
  settingIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#272A2E", alignItems: "center", justifyContent: "center", marginRight: 11 },
  settingCopy: { flex: 1 },
  settingTitle: { color: INK, fontSize: 14, fontWeight: "700" },
  settingCaption: { color: MUTED, fontSize: 11, lineHeight: 15, marginTop: 3 },
  valueText: { color: LIME, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 },
  stepButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: "#2A2D31", alignItems: "center", justifyContent: "center" },
  stepTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: "#303238", overflow: "hidden" },
  stepFill: { height: "100%", backgroundColor: LIME, borderRadius: 3 },
  rangeLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 40, marginTop: 5 },
  rangeText: { color: "#62656B", fontSize: 10 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 13 },
  themeRow: { flexDirection: "row", gap: 10 },
  themeButton: { flex: 1, height: 50, borderRadius: 15, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  themeButtonActive: { backgroundColor: LIME, borderColor: LIME },
  themeText: { color: MUTED, fontSize: 13, fontWeight: "700" },
  themeTextActive: { color: "#111214" },
  saveButton: { minHeight: 54, borderRadius: 17, backgroundColor: LIME, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  saveButtonQuiet: { opacity: 0.88 },
  saveText: { color: "#111214", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  activationCard: { backgroundColor: "#16181B", borderRadius: 21, borderWidth: 1, borderColor: BORDER, padding: 15, gap: 14 },
  activationTop: { flexDirection: "row", alignItems: "flex-start" },
  activationIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#272A2E", alignItems: "center", justifyContent: "center", marginRight: 11 },
  activationCopy: { flex: 1 },
  activationTitle: { color: INK, fontSize: 14, fontWeight: "800" },
  activationText: { color: MUTED, fontSize: 11, lineHeight: 16, marginTop: 4 },
  activationActions: { flexDirection: "row", gap: 9 },
  secondaryButton: { flex: 1, minHeight: 38, borderRadius: 12, borderWidth: 1, borderColor: "#3A3D42", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondaryText: { color: INK, fontSize: 11, fontWeight: "700" },
  footer: { color: "#5E6168", textAlign: "center", fontSize: 10, marginTop: 2 },
});
