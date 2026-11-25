import * as Location from 'expo-location';

/**
 * Place search for "name the spot", using Photon (photon.komoot.io): free, no key, OpenStreetMap data.
 * Results are biased toward where the birder last logged a bird, so nearby spots come first.
 */
export type Place = { name: string; area: string; lat: number; lon: number };

const BASE = 'https://photon.komoot.io';

type Feature = { geometry: { coordinates: [number, number] }; properties: Record<string, string | undefined> };

function toPlace(f: Feature): Place | null {
  const p = f.properties;
  const name = p.name ?? p.street ?? p.city ?? p.county ?? p.state;
  if (!name) return null;
  // town, then state — e.g. "Amawbia" · "Awka South, Anambra"
  const area = [p.city ?? p.town ?? p.district ?? p.locality ?? p.county, p.state]
    .filter((x, i, a): x is string => !!x && x !== name && a.indexOf(x) === i)
    .join(', ');
  const [lon, lat] = f.geometry.coordinates;
  return { name, area, lat, lon };
}

const dedupe = (list: Place[]) => list.filter((p, i) => list.findIndex((q) => q.name === p.name && q.area === p.area) === i);

export async function searchPlaces(q: string, near?: { lat: number; lon: number } | null, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ q, limit: '8', lang: 'en' });
  if (near) { params.set('lat', String(near.lat)); params.set('lon', String(near.lon)); }
  const res = await fetch(`${BASE}/api/?${params}`, { signal });
  if (!res.ok) throw new Error(`place search ${res.status}`);
  const json = (await res.json()) as { features: Feature[] };
  return dedupe(json.features.map(toPlace).filter((p): p is Place => !!p)).slice(0, 5);
}

export async function placeAt(lat: number, lon: number): Promise<Place | null> {
  const res = await fetch(`${BASE}/reverse?lat=${lat}&lon=${lon}&lang=en`);
  if (!res.ok) return null;
  const json = (await res.json()) as { features: Feature[] };
  return json.features[0] ? toPlace(json.features[0]) : null;
}

/** "El Paradiso, Awka, Anambra" — the spot, its town and its state, as saved on the page. */
export const placeLabel = (p: Place) => [p.name, ...p.area.split(', ')].filter((x, i, a) => !!x && a.indexOf(x) === i).join(', ');

/** The phone's own map service names the spot first (works best on iPhone and Android); Photon is the backup. */
async function nameHere(lat: number, lon: number): Promise<Place | null> {
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    if (a) {
      const town = a.city ?? a.district ?? a.subregion ?? null;
      const spot = a.name && !/^\d+$/.test(a.name) ? a.name : a.street ?? a.district ?? town;
      if (spot) {
        const area = [town, a.region].filter((x, i, arr): x is string => !!x && x !== spot && arr.indexOf(x) === i).join(', ');
        return { name: spot, area, lat, lon };
      }
    }
  } catch { /* fall through to Photon */ }
  return placeAt(lat, lon).catch(() => null);
}

/** Where the phone is now, named. Asks for permission the first time. */
export async function placeHere(): Promise<{ place: Place | null; error?: string }> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') return { place: null, error: 'ọjịugo needs location access to find where you are — you can still type the spot' };
  try {
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lon } = pos.coords;
    const named = await nameHere(lat, lon);
    return { place: named ? { ...named, lat, lon } : { name: 'where I was standing', area: '', lat, lon } };
  } catch {
    return { place: null, error: 'couldn’t find you just now — try again outside, or type the spot' };
  }
}

/** "6.2101, 7.0712" — how coordinates are kept on a page. */
export const formatCoords = (lat: number, lon: number) => `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
export function parseCoords(s?: string) {
  const m = s?.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  return m ? { lat: Number(m[1]), lon: Number(m[2]) } : null;
}
