// SAMPLE PRODUCTS — placeholders from the Figma design. Swap in the real range (name, blurb, price, category).
export type Product = { name: string; blurb: string; price: number; category: 'paper goods' | 'to wear' | 'for nests'; icon: 'feather' | 'ring' | 'book'; tone: 'plum' | 'gold' | 'clay' };
const base = { name: 'the field journal', blurb: 'a pocket-sized notebook for scribbles in the field, before they reach the app', price: 45 };
export const PRODUCTS: Product[] = [
  { ...base, category: 'paper goods', icon: 'feather', tone: 'plum' },
  { ...base, category: 'paper goods', icon: 'ring', tone: 'gold' },
  { ...base, category: 'paper goods', icon: 'book', tone: 'clay' },
  { ...base, category: 'to wear', icon: 'ring', tone: 'gold' },
  { ...base, category: 'for nests', icon: 'book', tone: 'clay' },
  { ...base, category: 'paper goods', icon: 'feather', tone: 'plum' },
];
export const CATEGORIES = ['everything', 'paper goods', 'to wear', 'for nests'] as const;
