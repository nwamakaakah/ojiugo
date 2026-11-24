import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { resolveColors, type Appearance, type Colors, type Season } from './tokens';
import { storage } from '../lib/storage';

type ThemeCtx = {
  colors: Colors;
  season: Season;
  appearance: Appearance;
  setSeason: (s: Season) => void;
  setAppearance: (a: Appearance) => void;
};
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [season, setSeasonState] = useState<Season>('dry');
  const [appearance, setAppearanceState] = useState<Appearance>(system === 'dark' ? 'lamplight' : 'daylight');

  useEffect(() => {
    storage.get<{ season?: Season; appearance?: Appearance }>('ojiugo.theme', {}).then((t) => {
      if (t.season) setSeasonState(t.season);
      if (t.appearance) setAppearanceState(t.appearance);
    });
  }, []);

  const value = useMemo<ThemeCtx>(() => ({
    colors: resolveColors(season, appearance),
    season,
    appearance,
    setSeason: (s) => { setSeasonState(s); storage.set('ojiugo.theme', { season: s, appearance }); },
    setAppearance: (a) => { setAppearanceState(a); storage.set('ojiugo.theme', { season, appearance: a }); },
  }), [season, appearance]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside ThemeProvider');
  return v;
}
