import { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, View, type TextStyle } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { BackLink, Heading, Screen, T } from '../components/ui';
import { COUNTRIES, SEASON_ABBR, currentSeasonFor, type Country } from '../lib/countries';
import { useAuth } from '../lib/auth';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export default function CountryPicker() {
  const { colors, setSeason } = useTheme();
  const { updateProfile, user } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const inSettings = mode === 'settings';
  const current = COUNTRIES.find((c) => c.name === user?.country);
  const [q, setQ] = useState('');
  const list = useMemo(() => COUNTRIES.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())), [q]);

  const pick = async (c: Country) => {
    setSeason(currentSeasonFor(c));
    await updateProfile({ country: c.name });
    if (inSettings) router.replace({ pathname: '/location-set', params: { country: c.name } });
    else router.replace('/loading');
  };

  return (
    <Screen>
      <View style={{ gap: space.sm }}>
        <BackLink />
        <Heading sub="this sets your seasons — rains & dry, or the classic four">where do you bird?</Heading>
      </View>
      {inSettings && current ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, height: 48, borderRadius: radius.md, backgroundColor: colors.actionPrimary, marginTop: space.xl }} accessibilityLabel={`current: ${current.name}`}>
          <T v="label" color={colors.textOnPrimary}>{current.name}</T>
          <T v="bodySm" color={colors.textOnPrimary}>{current.seasons.map((s) => SEASON_ABBR[s]).join(', ')}</T>
        </View>
      ) : null}
      <TextInput
        value={q} onChangeText={setQ} placeholder="type your country…" placeholderTextColor={colors.textDisabled}
        style={[type.bodyMd as TextStyle, { color: colors.textDefault, borderBottomWidth: 1, borderBottomColor: colors.borderDefault, paddingVertical: space.sm, marginTop: space.xl, marginBottom: space.lg, outlineWidth: 0 } as TextStyle]}
      />
      <FlatList
        data={list}
        keyExtractor={(c) => c.name}
        contentContainerStyle={{ gap: space.sm, paddingBottom: space.xl }}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button" onPress={() => pick(item)}
            style={({ pressed }) => [{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderDefault, backgroundColor: pressed ? colors.surfaceCardAlt : colors.surfacePage }]}
          >
            <T v="label">{item.name}</T>
            <T v="bodySm" color={colors.textLight}>{item.seasons.map((s) => SEASON_ABBR[s]).join(', ')}</T>
          </Pressable>
        )}
        ListEmptyComponent={<T v="bodyMd" color={colors.textLight}>no country by that name yet</T>}
      />
    </Screen>
  );
}
