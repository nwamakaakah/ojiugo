import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';

/**
 * Small sound + touch cues for the moments that matter. Sounds are quiet, short, mix with
 * whatever else is playing, and stay silent when the phone is on silent.
 *
 * The players live in <SoundCues />, mounted once at the root, using Expo's own useAudioPlayer hook —
 * so they're created, loaded and released the way expo-audio expects. cue() just asks them to play.
 */
export type Cue = 'chirp' | 'stamp' | 'tear';

const players: Partial<Record<Cue, AudioPlayer>> = {};

/** Mount once near the root of the app. */
export function SoundCues() {
  const chirp = useAudioPlayer(require('../../assets/sounds/chirp.wav'));
  const stamp = useAudioPlayer(require('../../assets/sounds/stamp.wav'));
  const tear = useAudioPlayer(require('../../assets/sounds/tear.wav'));
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
    try { chirp.volume = 0.35; stamp.volume = 0.5; tear.volume = 0.4; } catch { /* ignore */ }
    players.chirp = chirp; players.stamp = stamp; players.tear = tear;
    return () => { delete players.chirp; delete players.stamp; delete players.tear; };
  }, [chirp, stamp, tear]);
  return null;
}

function haptic(c: Cue) {
  if (Platform.OS === 'web') return;
  const h = c === 'chirp'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.impactAsync(c === 'stamp' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
  h.catch(() => {});
}

/** Play a cue: its sound and its haptic together. Sound is a nicety — it's skipped if it isn't ready. */
export function cue(c: Cue) {
  haptic(c);
  const p = players[c];
  if (!p) return;
  try {
    if (!p.isLoaded) return;
    p.seekTo(0).catch(() => {}).finally(() => { try { p.play(); } catch { /* ignore */ } });
  } catch { /* ignore */ }
}

/** A light tick for selections (chips, toggles, radio options). */
export function tick() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}
