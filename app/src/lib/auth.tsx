import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, isDemo } from './supabase';
import { storage } from './storage';

export type User = { id: string; email: string; name?: string; country?: string };
type Result = { error?: string };

type AuthCtx = {
  user: User | null;
  ready: boolean;
  isDemo: boolean;
  signUp: (name: string, email: string, password: string) => Promise<Result>;
  signIn: (email: string, password: string) => Promise<Result>;
  sendResetCode: (email: string) => Promise<Result>;
  verifyResetCode: (email: string, code: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
  updateProfile: (p: Partial<Pick<User, 'name' | 'country'>>) => Promise<Result>;
  signOut: () => Promise<void>;
};
const Ctx = createContext<AuthCtx | null>(null);

// Friendly wording in the ọjịugo voice
const friendly = (msg?: string) => {
  if (!msg) return 'something went a little sideways, try again?';
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'that email and password don’t match a diary yet';
  if (m.includes('already registered') || m.includes('already exists')) return 'there’s already a diary with this email, try opening it';
  if (m.includes('token') || m.includes('otp')) return 'that code didn’t work, check it or ask for a new one';
  if (m.includes('password')) return msg;
  return msg;
};

// ---------- demo mode: everything is kept on this device ----------
type DemoAccount = { id: string; email: string; password: string; name?: string; country?: string };
const DEMO_KEY = 'ojiugo.demo.accounts';
const DEMO_SESSION = 'ojiugo.demo.session';
const DEMO_CODE = '123456';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingResetEmail, setPendingResetEmail] = useState<string | null>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        setUser(u ? { id: u.id, email: u.email ?? '', name: u.user_metadata?.name, country: u.user_metadata?.country } : null);
        setReady(true);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        const u = session?.user;
        setUser(u ? { id: u.id, email: u.email ?? '', name: u.user_metadata?.name, country: u.user_metadata?.country } : null);
      });
      return () => sub.subscription.unsubscribe();
    }
    storage.get<User | null>(DEMO_SESSION, null).then((u) => { setUser(u); setReady(true); });
  }, []);

  const value = useMemo<AuthCtx>(() => {
    const demoAccounts = () => storage.get<DemoAccount[]>(DEMO_KEY, []);
    const demoLogin = async (a: DemoAccount) => {
      const u = { id: a.id, email: a.email, name: a.name, country: a.country };
      await storage.set(DEMO_SESSION, u); setUser(u);
    };
    return {
      user, ready, isDemo,
      async signUp(name, email, password) {
        if (supabase) {
          const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
          return { error: error ? friendly(error.message) : undefined };
        }
        const list = await demoAccounts();
        if (list.some((a) => a.email === email.toLowerCase())) return { error: friendly('already registered') };
        const acc = { id: String(Date.now()), email: email.toLowerCase(), password, name };
        await storage.set(DEMO_KEY, [...list, acc]); await demoLogin(acc); return {};
      },
      async signIn(email, password) {
        if (supabase) {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          return { error: error ? friendly(error.message) : undefined };
        }
        const acc = (await demoAccounts()).find((a) => a.email === email.toLowerCase() && a.password === password);
        if (!acc) return { error: friendly('invalid login') };
        await demoLogin(acc); return {};
      },
      async sendResetCode(email) {
        setPendingResetEmail(email.toLowerCase());
        if (supabase) {
          // Sends a 6-digit code (enable "OTP" in the Supabase email template — see README).
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          return { error: error ? friendly(error.message) : undefined };
        }
        return {};
      },
      async verifyResetCode(email, code) {
        if (supabase) {
          const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
          return { error: error ? friendly(error.message) : undefined };
        }
        if (code !== DEMO_CODE) return { error: friendly('otp') };
        const acc = (await demoAccounts()).find((a) => a.email === (pendingResetEmail ?? email.toLowerCase()));
        if (acc) await demoLogin(acc);
        return {};
      },
      async updatePassword(password) {
        if (supabase) {
          const { error } = await supabase.auth.updateUser({ password });
          return { error: error ? friendly(error.message) : undefined };
        }
        const list = await demoAccounts();
        const email = user?.email ?? pendingResetEmail;
        await storage.set(DEMO_KEY, list.map((a) => (a.email === email ? { ...a, password } : a)));
        return {};
      },
      async updateProfile(p) {
        if (supabase) {
          const { error } = await supabase.auth.updateUser({ data: p });
          if (!error && user) setUser({ ...user, ...p });
          return { error: error ? friendly(error.message) : undefined };
        }
        if (!user) return {};
        const next = { ...user, ...p };
        const list = await demoAccounts();
        await storage.set(DEMO_KEY, list.map((a) => (a.id === user.id ? { ...a, ...p } : a)));
        await storage.set(DEMO_SESSION, next); setUser(next); return {};
      },
      async signOut() {
        if (supabase) await supabase.auth.signOut();
        await storage.remove(DEMO_SESSION); setUser(null);
      },
    };
  }, [user, ready, pendingResetEmail]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
}
export const DEMO_RESET_CODE = DEMO_CODE;
