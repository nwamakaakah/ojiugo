import { AppState } from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { storage } from './storage';

/**
 * Offline-first diary storage.
 *
 * Every page is written to the phone first (so birding without signal just works), marked "dirty",
 * then pushed to Supabase when there's a connection. Changes made on other phones arrive through
 * Supabase Realtime (live) and a catch-up pull whenever the app comes back to the foreground.
 * In demo mode (no Supabase keys) it's simply phone storage, as before.
 */

export type Row = Record<string, unknown> & { id: string; createdAt: string; kind?: string; species?: string; photo?: string };
type Local = Row & { _dirty?: boolean; _deleted?: boolean };

const LEGACY = 'ojiugo.entries';                 // pages saved before accounts were synced
const cacheKey = (uid: string | null) => (uid ? `ojiugo.entries.${uid}` : LEGACY);
const pulledKey = (uid: string) => `ojiugo.entries.${uid}.pulledAt`;

let uid: string | null = null;
let channel: RealtimeChannel | null = null;
let pushing = false;
let retry: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

/** Screens subscribe so they redraw the moment anything changes — here or on another phone. */
export function onEntriesChange(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
const emit = () => listeners.forEach((fn) => fn());

const readAll = () => storage.get<Local[]>(cacheKey(uid), []);
const writeAll = (list: Local[]) => storage.set(cacheKey(uid), list);

/** The diary as the screens see it (torn-out pages hidden). */
export async function readRows(): Promise<Row[]> {
  return (await readAll()).filter((r) => !r._deleted).map(({ _dirty, _deleted, ...r }) => r as Row);
}

export async function saveRow(row: Row) {
  const list = await readAll();
  const i = list.findIndex((r) => r.id === row.id);
  const next: Local = { ...row, _dirty: true };
  if (i >= 0) list[i] = next; else list.push(next);
  await writeAll(list); emit(); schedulePush(0);
}

export async function removeRow(id: string) {
  const list = await readAll();
  const r = list.find((x) => x.id === id);
  if (!r) return;
  if (supabase && uid) { r._deleted = true; r._dirty = true; await writeAll(list); }
  else await writeAll(list.filter((x) => x.id !== id));
  emit(); schedulePush(0);
}

// ── server shape ↔ phone shape ───────────────────────────────
type Remote = { id: string; kind: string; seen_at: string; species: string | null; data: Record<string, unknown>; updated_at: string; deleted_at: string | null };
const toRemote = (r: Local) => {
  const { id, kind, createdAt, species, _dirty, _deleted, ...data } = r;
  return { id, kind: kind ?? 'entry', seen_at: createdAt, species: species ?? null, data, deleted_at: _deleted ? new Date().toISOString() : null };
};
const fromRemote = (x: Remote): Row => ({ ...(x.data ?? {}), id: x.id, kind: x.kind, createdAt: x.seen_at, ...(x.species ? { species: x.species } : {}) });

// ── photos: local file → private bucket, kept as a long-lived signed link ──
const isLocal = (uri?: string) => !!uri && !/^https?:\/\//.test(uri);
async function uploadPhoto(r: Local): Promise<string | undefined> {
  if (!supabase || !uid || !isLocal(r.photo)) return r.photo;
  const res = await fetch(r.photo!);
  const body = await res.arrayBuffer();
  const type = res.headers.get('content-type') || 'image/jpeg';
  const path = `${uid}/${r.id}.${type.includes('png') ? 'png' : 'jpg'}`;
  const up = await supabase.storage.from('photos').upload(path, body, { contentType: type, upsert: true });
  if (up.error) throw up.error;
  const signed = await supabase.storage.from('photos').createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

// ── push dirty pages up ──────────────────────────────────────
function schedulePush(ms: number) {
  if (!supabase || !uid) return;
  if (retry) clearTimeout(retry);
  retry = setTimeout(() => { retry = null; push(); }, ms);
}

export async function push() {
  if (!supabase || !uid || pushing) return;
  pushing = true;
  let failed = false;
  try {
    for (const r of (await readAll()).filter((x) => x._dirty)) {
      try {
        const photo = r._deleted ? r.photo : await uploadPhoto(r);
        const row = toRemote({ ...r, photo });
        const { error } = await supabase.from('entries').upsert(row);
        if (error) throw error;
        if (r._deleted) {
          if (r.photo && !isLocal(r.photo)) await supabase.storage.from('photos').remove([`${uid}/${r.id}.jpg`, `${uid}/${r.id}.png`]);
        }
        // write back carefully: the page may have changed again while we were uploading
        const now = await readAll();
        const j = now.findIndex((x) => x.id === r.id);
        if (j >= 0 && JSON.stringify({ ...now[j], photo: undefined }) === JSON.stringify({ ...r, photo: undefined })) {
          if (r._deleted) now.splice(j, 1); else now[j] = { ...now[j], photo, _dirty: false };
          await writeAll(now);
        }
      } catch { failed = true; }
    }
  } finally { pushing = false; }
  if (failed) schedulePush(30_000);   // no signal? try again in a bit
}

// ── pull other phones' changes ───────────────────────────────
function merge(list: Local[], x: Remote) {
  const i = list.findIndex((r) => r.id === x.id);
  if (i >= 0 && list[i]._dirty) return;                       // our unsent edit wins until it's pushed
  if (x.deleted_at) { if (i >= 0) list.splice(i, 1); return; }
  const row = fromRemote(x);
  if (i >= 0) list[i] = row; else list.push(row);
}

export async function pull() {
  if (!supabase || !uid) return;
  const me = uid;
  const since = await storage.get<string>(pulledKey(me), '1970-01-01T00:00:00Z');
  const { data, error } = await supabase.from('entries').select('*').gt('updated_at', since).order('updated_at');
  if (error || !data || me !== uid) return;
  if (data.length) {
    const list = await readAll();
    (data as Remote[]).forEach((x) => merge(list, x));
    await writeAll(list);
    await storage.set(pulledKey(me), (data as Remote[])[data.length - 1].updated_at);
    emit();
  }
}

// ── live updates ─────────────────────────────────────────────
function listen() {
  if (!supabase || !uid) return;
  channel = supabase
    .channel(`entries:${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entries', filter: `user_id=eq.${uid}` }, async (p) => {
      const x = (p.new && Object.keys(p.new).length ? p.new : p.old) as Remote;
      if (!x?.id) return;
      const list = await readAll();
      if (p.eventType === 'DELETE') { const i = list.findIndex((r) => r.id === x.id); if (i >= 0 && !list[i]._dirty) list.splice(i, 1); }
      else merge(list, x);
      await writeAll(list); emit();
    })
    .subscribe();
}

/** Pages written before this phone was signed in become part of the birder's diary. */
async function adoptLegacy() {
  if (!uid) return;
  const old = await storage.get<Local[]>(LEGACY, []);
  if (!old.length) return;
  const mine = await readAll();
  const ids = new Set(mine.map((r) => r.id));
  await writeAll([...mine, ...old.filter((r) => !ids.has(r.id)).map((r) => ({ ...r, _dirty: true }))]);
  await storage.remove(LEGACY);
}

async function startFor(next: string | null) {
  if (next === uid) return;
  if (channel && supabase) { supabase.removeChannel(channel); channel = null; }
  uid = next;
  emit();
  if (!uid) return;
  await adoptLegacy();
  emit();
  listen();
  await push();
  await pull();
}

let started = false;
/** Call once when the app starts. */
export function startSync() {
  if (started || !supabase) return;
  started = true;
  supabase.auth.getSession().then(({ data }) => startFor(data.session?.user.id ?? null));
  supabase.auth.onAuthStateChange((_e, session) => { startFor(session?.user.id ?? null); });
  AppState.addEventListener('change', (s) => { if (s === 'active') { push(); pull(); } });
}

/** Used by "delete account": removes this birder's photos through the Storage API first. */
export async function removeAllPhotos() {
  if (!supabase || !uid) return;
  const { data } = await supabase.storage.from('photos').list(uid, { limit: 1000 });
  if (data?.length) await supabase.storage.from('photos').remove(data.map((f) => `${uid}/${f.name}`));
}
