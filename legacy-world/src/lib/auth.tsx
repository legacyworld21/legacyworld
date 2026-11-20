import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type Profile = { id: string; username: string | null; display_name: string | null; points: number; tier: 'member' | 'bronze' | 'silver' | 'gold' };
type Ctx = { session: Session | null; profile: Profile | null; loading: boolean; refresh: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ session: null, profile: null, loading: true, refresh: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (s: Session | null) => {
    if (!s) return setProfile(null);
    const { data } = await supabase.from('profiles').select('id,username,display_name,points,tier').eq('id', s.user.id).maybeSingle();
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); load(data.session).finally(() => setLoading(false)); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); load(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={{ session, profile, loading, refresh: () => load(session) }}>{children}</AuthCtx.Provider>;
}
