// ọjịugo design tokens — copied from the Figma variable collections
// (Primitives, Seasons, Semantics, Typography, Dimensions).

type Ramp = Record<'25'|'50'|'100'|'200'|'300'|'400'|'500'|'600'|'700'|'800'|'900'|'950', string>;
const ramp = (v: string[]): Ramp => {
  const k = ['25','50','100','200','300','400','500','600','700','800','900','950'] as const;
  return Object.fromEntries(k.map((key, i) => [key, v[i]])) as Ramp;
};

export const primitives = {
  green: ramp(['#f2f2ec','#e9eae2','#dddfd4','#c6cbbb','#afb7a2','#96a186','#7d8b6a','#6a7559','#575f47','#444936','#343626','#27271a']),
  olive: ramp(['#f6f4ea','#f0eddf','#e9e4ce','#dcd4b0','#cec492','#bfb270','#b0a04f','#948642','#786d36','#5c5329','#433c1e','#302b16']),
  clay: ramp(['#f6f1eb','#f1e8e0','#eadbd1','#ddc3b4','#d0ac98','#c19279','#b3785a','#96654b','#7a533d','#5d402e','#443021','#312418']),
  blue: ramp(['#f2f3f1','#eaeceb','#dde1e3','#c6cfd5','#b0bcc7','#97a8b8','#7e93a8','#6b7c8b','#58646f','#454d52','#343839','#272826']),
  mossdeep: ramp(['#f0f0ea','#e5e6de','#d5d8cd','#b8beaf','#9ca490','#7c886e','#5c6b4c','#4f5b40','#424b34','#353a28','#2a2c1d','#212115']),
  taupe: ramp(['#f3f1ec','#ebe8e2','#e0dcd4','#ccc6ba','#b7afa1','#a19684','#8a7d68','#756a57','#605646','#4a4335','#373126','#29241a']),
  gold: ramp(['#f8f4eb','#f4eee0','#efe5d1','#e6d5b4','#ddc698','#d3b479','#c9a35a','#a8894b','#886e3d','#67542e','#4a3d21','#352b18']),
  plum: ramp(['#f3f1f0','#ebe8ea','#e0dce1','#ccc6d1','#b8afc1','#a196b0','#8b7d9e','#766a83','#605668','#4b434e','#383136','#292424']),
  terracotta: ramp(['#f7f0e9','#f3e7dc','#eed9ca','#e4c0a9','#daa788','#cf8c64','#c4703f','#a45f35','#854e2c','#653d22','#492e19','#342213']),
  rose: ramp(['#f6f2ee','#f2eae6','#ebdfdb','#dfcbc7','#d3b7b3','#c6a09c','#b98a86','#9b7470','#7e5e59','#604942','#46352e','#322720']),
  sky: ramp(['#f3f4f3','#ebefef','#e0e7ea','#ccd8e2','#b8c9d9','#a2b9d0','#8ca9c6','#768ea4','#617282','#4b5760','#383f42','#2a2c2b']),
  sage: ramp(['#f4f5ee','#eef0e7','#e4e8dc','#d3dbc9','#c2ceb5','#afbfa0','#9cb08a','#849373','#6b775c','#535a44','#3d4130','#2c2e20']),
  butter: ramp(['#f9f6ec','#f7f2e3','#f3ecd5','#eee1bd','#e8d6a4','#e1ca89','#dbbe6e','#b79f5c','#93804a','#706137','#504527','#38301b']),
  blush: ramp(['#f8f2ee','#f5eae6','#f0dfda','#e8cbc5','#e0b7b0','#d7a099','#ce8a82','#ad746c','#8b5e56','#6a4941','#4c352d','#35271f']),
};

// sand & mist have an extra 850 step
export const sand = { '25':'#fdfaf1','50':'#f9f4e8','100':'#f7f2e6','200':'#e9e3d3','300':'#cac4b5','400':'#aaa497','500':'#8a8479','600':'#6b655b','700':'#4c463d','800':'#2c261f','850':'#27221b','900':'#221d17','950':'#171310' };
export const mist = { '25':'#fbfbf3','50':'#f6f6eb','100':'#f4f4e9','200':'#e5e6d6','300':'#c6c7b8','400':'#a7a79a','500':'#87877c','600':'#69685d','700':'#4a493f','800':'#2a2921','850':'#25241d','900':'#202019','950':'#161511' };

// Seasons collection: which ramp each mode uses for primary + surface, plus its glass/shadow/overlay tints.
export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'wet' | 'dry';
export const SEASONS: { id: Season; label: string }[] = [
  { id: 'spring', label: 'spring' }, { id: 'summer', label: 'summer' }, { id: 'autumn', label: 'autumn' },
  { id: 'winter', label: 'winter' }, { id: 'wet', label: 'rains' }, { id: 'dry', label: 'dry' },
];
const seasonDef: Record<Season, { primary: keyof typeof primitives; surface: 'sand' | 'mist'; shadowLight: string; shadowDark: string; overlay: string; tint: string }> = {
  spring: { primary: 'green',    surface: 'sand', shadowLight: '68,73,54',  shadowDark: '18,19,15', overlay: '52,54,38', tint: '125,139,106' },
  summer: { primary: 'olive',    surface: 'sand', shadowLight: '92,83,41',  shadowDark: '25,22,11', overlay: '67,60,30', tint: '176,160,79' },
  autumn: { primary: 'clay',     surface: 'sand', shadowLight: '93,64,46',  shadowDark: '25,17,13', overlay: '68,48,33', tint: '179,120,90' },
  winter: { primary: 'blue',     surface: 'mist', shadowLight: '69,77,82',  shadowDark: '18,21,24', overlay: '52,56,57', tint: '126,147,168' },
  wet:    { primary: 'mossdeep', surface: 'mist', shadowLight: '53,58,40',  shadowDark: '13,15,11', overlay: '42,44,29', tint: '92,107,76' },
  dry:    { primary: 'taupe',    surface: 'sand', shadowLight: '74,67,53',  shadowDark: '19,18,15', overlay: '55,49,38', tint: '138,125,104' },
};

export type Appearance = 'daylight' | 'lamplight';

/** Semantics collection resolved for one season + appearance. */
export function resolveColors(season: Season, appearance: Appearance) {
  const s = seasonDef[season];
  const p = primitives[s.primary];
  const sf = s.surface === 'sand' ? sand : mist;
  const d = appearance === 'daylight';
  const pick = <T,>(day: T, lamp: T) => (d ? day : lamp);
  const rgba = (rgb: string, a: number) => `rgba(${rgb},${a})`;
  return {
    bgDesk: pick(sf['200'], sf['950']),
    bgApp: pick(sf['100'], sf['900']),
    surfacePage: pick(sf['25'], sf['800']),
    surfaceCardAlt: pick(sf['50'], sf['850']),
    borderDefault: pick(sf['300'], sf['600']),
    borderSubtle: pick(sf['200'], sf['700']),
    borderLight: pick(sf['100'], sf['800']),
    textDefault: pick(sf['900'], sf['50']),
    textSubtle: pick(sf['700'], sf['200']),
    textLight: pick(sf['600'], sf['300']),
    textDisabled: pick(sf['500'], sf['400']),
    textOnPrimary: pick(sand['25'], sand['950']),
    textInteractive: pick(p['700'], p['300']),
    textCritical: pick(primitives.blush['700'], primitives.blush['300']),
    textSuccess: pick(primitives.sage['700'], primitives.sage['300']),
    textJoy: pick(primitives.gold['700'], primitives.gold['300']),
    textWonder: pick(primitives.plum['700'], primitives.plum['300']),
    actionPrimary: pick(p['700'], p['300']),
    actionPrimaryHover: pick(p['800'], p['200']),
    actionPrimaryPressed: pick(p['900'], p['100']),
    actionPrimaryDisabled: pick(sf['200'], sf['700']),
    actionPrimaryDisabledLabel: pick(sf['400'], sf['500']),
    actionSecondary: pick(p['100'], p['800']),
    actionSecondaryLabel: pick(p['800'], p['100']),
    iconDefault: pick(sf['800'], sf['100']),
    iconSubtle: pick(sf['600'], sf['300']),
    iconLight: pick(sf['500'], sf['400']),
    softInteractiveFill: pick(p['100'], p['800']),
    softInteractiveLabel: pick(p['800'], p['200']),
    softNeutralFill: pick(sf['200'], sf['700']),
    softWonderFill: pick(primitives.plum['100'], primitives.plum['800']),
    navGlassFill: pick(s.surface === 'sand' ? 'rgba(253,250,241,0.7)' : 'rgba(251,251,243,0.7)', s.surface === 'sand' ? 'rgba(39,34,27,0.62)' : 'rgba(37,36,29,0.62)'),
    navGlassTint: rgba(s.tint, 0.06),
    overlayScrim: rgba(s.overlay, d ? 0.54 : 0.72),
    shadow: d ? rgba(s.shadowLight, 0.16) : rgba(s.shadowDark, 0.55),
    gold: primitives.gold['500'],
    terracotta: primitives.terracotta['500'],
    leafGreen: primitives.green['400'],
    isDark: !d,
  };
}
export type Colors = ReturnType<typeof resolveColors>;

// Typography collection
export const fonts = {
  display: 'Caveat_700Bold',
  regular: 'Mali_400Regular',
  medium: 'Mali_500Medium',
  semibold: 'Mali_600SemiBold',
  bold: 'Mali_700Bold',
};
export const type = {
  displayXl: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  displayLg: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36 },
  title: { fontFamily: fonts.semibold, fontSize: 26, lineHeight: 30 },
  handNote: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: 0.2 },
  bodyLg: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26 },
  bodyMd: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24 },
  bodySm: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  button: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 16, letterSpacing: 0.2 },
  ui: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, letterSpacing: 0.1 },
  overline: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' as const },
};

// Dimensions collection
export const space = { none: 0, '2xs': 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48, '4xl': 64 };
export const radius = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const control = { sm: 32, md: 40, lg: 48, touchMin: 48 };
