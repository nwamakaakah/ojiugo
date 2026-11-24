import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { resolveColors, type Appearance, type Colors, type Season } from './tokens';
import { storage } from '../lib/storage';

/** 'auto' follows the time of day on the phone; the others pin a mode. */
export type LightMode = 'auto' | Appearance;

/** Daylight from 6:00 to 18:59 local time, lamplight from 19:00 to 5:59. */
export const DAYLIGHT_START = 6;
export const LAMPLIGHT_START = 19;
export function appearanceForTime(d = new Date()): Appearance {
  const h = d.getHours();
  return h >= DAYLIGHT_START && h < LAMPLIGHT_START ? 'daylight' : 'lamplight';
}

type ThemeCtx = {
  colors: Colors;
  season: Season;
  appearance: Appearance;
  lightMode: LightMode;
  setSeason: (s: Season) => void;
  setLightMode: (m: LightMode) => void;
};
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [season, setSeasonState] = useState<Season>('dry');
  const [lightMode, setLightModeState] = useState<LightMode>('auto');
  const [clock, setClock] = useState<Appearance>(appearanceForTime());

  useEffect(() => {
    storage.get<{ season?: Season; lightMode?: LightMode }>('ojiugo.theme', {}).then((t) => {
      if (t.season) setSeasonState(t.season);
      if (t.lightMode) setLightModeState(t.lightMode);
    });
  }, []);

  // Re-check the clock every minute and whenever the app comes back to the foreground.
  useEffect(() => {
    const tick = () => setClock(appearanceForTime());
    const id = setInterval(tick, 60_000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && tick());
    return () => { clearInterval(id); sub.remove(); };
  }, []);

  const appearance: Appearance = lightMode === 'auto' ? clock : lightMode;

  const value = useMemo<ThemeCtx>(() => ({
    colors: resolveColors(season, appearance),
    season,
    appearance,
    lightMode,
    setSeason: (s) => { setSeasonState(s); storage.set('ojiugo.theme', { season: s, lightMode }); },
    setLightMode: (m) => { setLightModeState(m); storage.set('ojiugo.theme', { season, lightMode: m }); },
  }), [season, appearance, lightMode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside ThemeProvider');
  return v;
}
