import type { Season } from '../theme/tokens';
// "where do you bird?" — sets which seasons the diary cycles through.
const RD: Season[] = ['wet', 'dry'];
const FOUR: Season[] = ['spring', 'summer', 'autumn', 'winter'];
export type Country = { name: string; seasons: Season[] };
export const COUNTRIES: Country[] = [
  { name: 'Nigeria', seasons: RD }, { name: 'Ghana', seasons: RD }, { name: 'Cameroon', seasons: RD },
  { name: 'Kenya', seasons: RD }, { name: 'Senegal', seasons: RD }, { name: 'Tanzania', seasons: RD },
  { name: 'Uganda', seasons: RD }, { name: 'India', seasons: RD }, { name: 'Brazil', seasons: RD },
  { name: 'Indonesia', seasons: RD }, { name: 'Thailand', seasons: RD }, { name: 'Philippines', seasons: RD },
  { name: 'Afghanistan', seasons: FOUR }, { name: 'Australia', seasons: FOUR }, { name: 'Canada', seasons: FOUR },
  { name: 'France', seasons: FOUR }, { name: 'Germany', seasons: FOUR }, { name: 'Japan', seasons: FOUR },
  { name: 'Mexico', seasons: FOUR }, { name: 'Russia', seasons: FOUR }, { name: 'South Africa', seasons: FOUR },
  { name: 'United Kingdom', seasons: FOUR }, { name: 'United States', seasons: FOUR },
];
export const SEASON_ABBR: Record<Season, string> = { spring: 'Sp', summer: 'Su', autumn: 'Au', winter: 'Wi', wet: 'R', dry: 'D' };

/** Rough current season for a country (northern-hemisphere months; rains ≈ Apr–Oct). */
export function currentSeasonFor(c: Country, date = new Date()): Season {
  const m = date.getMonth();
  if (c.seasons.includes('wet')) return m >= 3 && m <= 9 ? 'wet' : 'dry';
  const south = ['Australia', 'South Africa', 'Brazil'].includes(c.name);
  const idx = Math.floor(((m + 10) % 12) / 3); // Mar-May spring …
  const order: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return order[south ? (idx + 2) % 4 : idx];
}

export const SEASON_NAME: Record<Season, string> = { spring: 'spring', summer: 'summer', autumn: 'autumn', winter: 'winter', wet: 'rainy', dry: 'dry' };
export const countryByName = (name?: string) => COUNTRIES.find((c) => c.name === name);
/** "spring, summer, autumn & winter" / "rainy & dry" */
export const seasonsSentence = (c: Country) => {
  const n = (c.seasons.includes('wet') ? ['wet', 'dry'] as Season[] : c.seasons).map((s) => SEASON_NAME[s]);
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} & ${n[n.length - 1]}` : n[0];
};
