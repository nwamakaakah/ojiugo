import { useState } from 'react';
import { Pressable, TextInput, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { T } from '../components/ui';
import { PeekingBird } from '../components/illustrations';
import { TabBar } from '../components/TabBar';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export default function Entries() {
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const search = `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${colors.iconSubtle}" stroke-width="1.4" stroke-linecap="round"><path d="M10 3.2c4 0 7.2 2.9 7.1 6.8-.1 3.8-3.4 6.9-7.4 6.8C5.8 16.7 2.8 13.7 3 9.9 3.2 6 6.2 3.2 10 3.2Z"/><path d="M14.8 15.2c1.5 1.3 2.8 2.6 4 4"/></svg>`;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgApp }} edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: space.lg, paddingTop: space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: space.xs }}>
            <T v="displayLg">your entries</T>
            <T v="overline" color={colors.textLight}>0 scribbles  •  0 species</T>
          </View>
          <Pressable style={{ borderWidth: 1, borderColor: colors.borderDefault, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs, marginTop: space.xs }}>
            <T v="ui">view as list</T>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, borderBottomWidth: 1, borderBottomColor: colors.borderDefault, marginTop: space.xl, paddingBottom: space.sm }}>
          <SvgXml xml={search} width={22} height={22} />
          <TextInput value={q} onChangeText={setQ} placeholder="looking for a memory?" placeholderTextColor={colors.textDisabled} style={[type.bodyMd as TextStyle, { flex: 1, color: colors.textDefault, outlineWidth: 0 } as TextStyle]} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
          <PeekingBird width={240} />
          <T v="bodyMd" style={{ textAlign: 'center', maxWidth: 220 }}>no birds yet — your first sighting is waiting</T>
        </View>
      </View>
      <TabBar active="entries" />
    </SafeAreaView>
  );
}
