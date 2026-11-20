import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, space, type } from '../theme';

export function Screen({ children, title, eyebrow }: { children: ReactNode; title?: string; eyebrow?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: 120, gap: space.lg }}>
        {title && (
          <View style={{ gap: 4 }}>
            {eyebrow && <Text style={type.eyebrow}>{eyebrow.toUpperCase()}</Text>}
            <Text style={type.display}>{title}</Text>
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const Section = ({ title, action, children }: { title: string; action?: string; children: ReactNode }) => (
  <View style={{ gap: space.sm }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={type.h2}>{title}</Text>
      {action && <Text style={{ color: colors.accent, fontSize: 13 }}>{action}</Text>}
    </View>
    {children}
  </View>
);

export const Card = ({ children, style }: { children: ReactNode; style?: ViewStyle }) => (
  <View style={[{ backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space.md, gap: 6 }, style]}>
    {children}
  </View>
);

export const Pill = ({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) => (
  <Pressable
    onPress={() => { Haptics.selectionAsync().catch(() => {}); onPress?.(); }}
    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1,
      borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent : 'transparent' }}>
    <Text style={{ color: active ? '#000' : colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
  </Pressable>
);

export const Button = ({ label, onPress, variant = 'primary' }: { label: string; onPress?: () => void; variant?: 'primary' | 'ghost' }) => (
  <Pressable
    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); onPress?.(); }}
    style={({ pressed }) => [{ paddingVertical: 14, borderRadius: radius.pill, alignItems: 'center', opacity: pressed ? 0.8 : 1 },
      variant === 'primary' ? { backgroundColor: colors.accent } : { borderWidth: 1, borderColor: colors.border }]}>
    <Text style={{ color: variant === 'primary' ? '#000' : colors.text, fontWeight: '800', letterSpacing: 0.5 }}>{label}</Text>
  </Pressable>
);

export const Hero = ({ eyebrow, title, subtitle, cta, onPress }: { eyebrow: string; title: string; subtitle?: string; cta?: string; onPress?: () => void }) => (
  <LinearGradient colors={['#032A67', '#000000']} style={{ borderRadius: radius.lg, padding: space.lg, gap: 10, borderWidth: 1, borderColor: colors.border }}>
    <Text style={type.eyebrow}>{eyebrow.toUpperCase()}</Text>
    <Text style={type.h1}>{title}</Text>
    {subtitle && <Text style={[type.body, { color: colors.muted }]}>{subtitle}</Text>}
    {cta && <View style={{ marginTop: 6 }}><Button label={cta} onPress={onPress} /></View>}
  </LinearGradient>
);

export const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: space.sm }, rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm } });
