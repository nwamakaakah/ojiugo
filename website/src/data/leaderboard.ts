// SAMPLE DATA — the names and numbers from the Figma design.
// Replace with real rankings from the app's database once people are logging birds.
export type Birder = { name: string; place: string; observations: number; species: number; you?: boolean };
type Board = { week: Birder[]; month: Birder[]; all: Birder[] };
const sample: Birder[] = [
  { name: 'Rivera', place: 'Bogotá, CO', observations: 184, species: 240 },
  { name: 'Tomás', place: 'Bogotá, CO', observations: 184, species: 240 },
  { name: 'Amara', place: 'Bogotá, CO', observations: 184, species: 240 },
  ...Array.from({ length: 7 }, () => ({ name: 'Priya', place: 'Kochi, IN', observations: 120, species: 205 })),
];
export const BOARD: Board = { week: sample, month: sample, all: sample };
export const YOU: { rank: number } & Birder = { rank: 100, name: 'Nwamaka', place: 'Kochi, IN', observations: 120, species: 205, you: true };
export const IS_SAMPLE = true;
