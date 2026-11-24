// Field-guide details per species. Only European Robin is filled in (copy from the Figma "Bird Info" frame);
// the rest will come from a bird database (e.g. eBird taxonomy + Xeno-canto recordings) once it's connected.
export type Recording = { kind: string; place: string; length: string; url?: string };
export type SpeciesInfo = {
  scientific?: string;
  about?: string;
  facts?: { label: string; value: string }[];
  recordings?: Recording[];
};
const INFO: Record<string, SpeciesInfo> = {
  'european robin': {
    scientific: 'Erithacus rubecula',
    about: 'A small, round garden bird with a warm orange breast. Famous for its sweet, wistful song — often the first voice at dawn and the last at dusk. Bold and curious, it\'ll happily follow a gardener\'s spade for a freshly turned worm.',
    facts: [
      { label: 'survival outlook', value: 'least concern' },
      { label: 'habitat', value: 'woodland & gardens' },
      { label: 'diet', value: 'seeds & insects' },
      { label: 'seen', value: 'year-round' },
    ],
  },
};
export const speciesInfo = (name: string): SpeciesInfo => INFO[name.toLowerCase()] ?? {};
