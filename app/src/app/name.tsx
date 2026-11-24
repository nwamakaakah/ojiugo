import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Press as Pressable } from '../components/Press';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BackLink, T } from '../components/ui';
import { BirdThumb } from '../components/BirdThumb';
import { Line } from '../components/form';
import { shortDate, useEntries } from '../lib/entries';
import { nameMystery } from '../lib/naming';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

// Mystery Bird / ID Suggestions — "two to name" (Figma 2012:12038)
export default function TwoToName() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const all = (useEntries() ?? []).filter((e) => !e.species && (!id || e.id === id));
  const [typed, setTyped] = useState<Record<string, string>>({});
  const card = { backgroundColor: colors.surfacePage, borderRadius: radius.xl, padding: space.lg, gap: space.md, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 };
  const btn = { height: 48, borderRadius: radius.pill, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.actionPrimary };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: space.sm }}>
          <BackLink />
          <T v="displayLg">two to name</T>
          <T v="bodyLg" color={colors.textSubtle}>we think we spotted these — your call</T>
        </View>
        {all.length === 0 ? <T v="bodyMd" color={colors.textSubtle}>no mystery birds right now — every bird has a name</T> : null}
        {all.map((e) => (
          <View key={e.id} style={card}>
            <T v="bodySm" color={colors.textLight}>{[shortDate(e.createdAt).toLowerCase(), e.place].filter(Boolean).join(' • ')}</T>
            {e.suggestion ? (
              <>
                <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                  <BirdThumb uri={e.photo} size={50} r={radius.sm} />
                  <T v="bodyLg" color={colors.textSubtle} style={{ flex: 1 }}>we think your {shortDate(e.createdAt).toLowerCase()} bird might be a <T v="label" style={{ fontSize: 16 }}>{e.suggestion.species}</T></T>
                </View>
                <Pressable accessibilityRole="button" style={btn} onPress={() => router.push({ pathname: '/bird', params: { name: e.suggestion!.species, entry: e.id } })}>
                  <T v="button" color={colors.textOnPrimary}>view the bird’s info</T>
                </Pressable>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                  <BirdThumb uri={e.photo} size={50} r={radius.sm} />
                  <T v="bodyMd" color={colors.textSubtle} style={{ flex: 1 }}>{e.describe ?? e.note ?? 'no suggestion yet — know what it was?'}</T>
                </View>
                <Line value={typed[e.id] ?? ''} onChangeText={(t) => setTyped({ ...typed, [e.id]: t })} placeholder="name it yourself" autoCapitalize="words" />
                <Pressable accessibilityRole="button" disabled={!typed[e.id]?.trim()} style={[btn, !typed[e.id]?.trim() && { backgroundColor: colors.actionPrimaryDisabled }]} onPress={() => nameMystery(e, typed[e.id].trim())}>
                  <T v="button" color={typed[e.id]?.trim() ? colors.textOnPrimary : colors.actionPrimaryDisabledLabel}>that’s my bird</T>
                </Pressable>
              </>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
