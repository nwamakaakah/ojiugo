import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Small sound + touch cues for the moments that matter. Sounds are quiet, short, mix with
 * whatever else is playing, and stay silent when the phone is on silent.
 */
export type Cue = 'chirp' | 'stamp' | 'tear';

const FILES: Record<Cue, number> = {
  chirp: require('../../assets/sounds/chirp.wav'),
  stamp: require('../../assets/sounds/stamp.wav'),
  tear: require('../../assets/sounds/tear.wav'),
};
const VOLUME: Record<Cue, number> = { chirp: 0.35, stamp: 0.5, tear: 0.4 };

const players: Partial<Record<Cue, AudioPlayer>> = {};
let ready = false;

function player(c: Cue) {
  if (!ready) {
    ready = true;
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }
  let p = players[c];
  if (!p) { p = createAudioPlayer(FILES[c]); p.volume = VOLUME[c]; players[c] = p; }
  return p;
}

function haptic(c: Cue) {
  if (Platform.OS === 'web') return;
  const h = c === 'chirp'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.impactAsync(c === 'stamp' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
  h.catch(() => {});
}

/** Play a cue: its sound and its haptic together. */
export function cue(c: Cue) {
  haptic(c);
  try { const p = player(c); p.seekTo(0); p.play(); } catch { /* sound is a nicety */ }
}

/** A light tick for selections (chips, toggles, radio options). */
export function tick() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}
