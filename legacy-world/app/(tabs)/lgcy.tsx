import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Hero, Pill, Screen, Section, styles } from '../../src/components/ui';
import { colors, radius, type } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/lib/auth';

const tabs = ['Entrenos', 'Mi progreso', 'Eventos', 'Atletas'] as const;
const TIERS = ['member', 'bronze', 'silver', 'gold'];
const input = { color: colors.text, backgroundColor: colors.surface2, borderRadius: radius.sm, padding: 12 } as const;

type Exercise = { name: string; sets?: number; reps?: string; rest_s?: number };
type Workout = { id: string; title: string; minutes: number | null; level: string | null; exercises: Exercise[]; athletes: { name: string } | null };
type Log = { id: string; title: string; duration_min: number | null; notes: string | null; logged_at: string };
type Event = { id: string; title: string; description: string | null; place: string | null; starts_at: string | null; capacity: number | null; min_tier: string };
type Athlete = { id: string; name: string; sport: string | null; bio: string | null; nutrition: string[]; tips: string[] };

const day = (d: Date) => d.toISOString().slice(0, 10);

export default function Lgcy() {
  const { session, profile } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>('Entrenos');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [mins, setMins] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const [w, e, a] = await Promise.all([
      supabase.from('workouts').select('id,title,minutes,level,exercises,athletes(name)').order('title'),
      supabase.from('events').select('*').order('starts_at', { ascending: true }),
      supabase.from('athletes').select('*').order('name'),
    ]);
    setWorkouts((w.data as unknown as Workout[]) ?? []);
    setEvents((e.data as Event[]) ?? []);
    setAthletes((a.data as unknown as Athlete[]) ?? []);
    if (session) {
      const [l, r] = await Promise.all([
        supabase.from('workout_logs').select('id,title,duration_min,notes,logged_at').order('logged_at', { ascending: false }).limit(60),
        supabase.from('event_rsvps').select('event_id'),
      ]);
      setLogs((l.data as Log[]) ?? []);
      setRsvps(new Set((r.data ?? []).map((x: any) => x.event_id)));
    } else { setLogs([]); setRsvps(new Set()); }
  }, [session]);
  useEffect(() => { load(); }, [load]);

  const needLogin = () => router.push('/login');

  const saveLog = async (w: Workout) => {
    if (!session) return needLogin();
    const duration = parseInt(mins || String(w.minutes ?? ''), 10);
    if (!duration || duration <= 0) return setMsg('Indica la duración en minutos.');
    const { error } = await supabase.from('workout_logs').insert({ workout_id: w.id, title: w.title, duration_min: duration, notes: notes.trim() || null });
    if (error) return setMsg(error.message);
    setOpen(null); setMins(''); setNotes(''); setMsg(''); load();
  };

  const rsvp = async (ev: Event) => {
    if (!session) return needLogin();
    if (rsvps.has(ev.id)) await supabase.from('event_rsvps').delete().eq('event_id', ev.id).eq('user_id', session.user.id);
    else {
      const { error } = await supabase.from('event_rsvps').insert({ event_id: ev.id });
      if (error) setMsg('No se pudo reservar: revisa tu nivel o si quedan cupos.');
    }
    load();
  };

  const stats = useMemo(() => {
    const days = new Set(logs.map((l) => day(new Date(l.logged_at))));
    let streak = 0;
    const d = new Date();
    if (!days.has(day(d))) d.setDate(d.getDate() - 1);
    while (days.has(day(d))) { streak++; d.setDate(d.getDate() - 1); }
    const week = Array.from({ length: 7 }, (_, i) => {
      const x = new Date(); x.setDate(x.getDate() - (6 - i));
      const k = day(x);
      return { label: 'DLMXJVS'[x.getDay() === 0 ? 6 : x.getDay() - 1], mins: logs.filter((l) => day(new Date(l.logged_at)) === k).reduce((s, l) => s + (l.duration_min ?? 0), 0) };
    });
    const since = Date.now() - 7 * 864e5;
    const thisWeek = logs.filter((l) => new Date(l.logged_at).getTime() >= since);
    return { streak, week, count: thisWeek.length, minutes: thisWeek.reduce((s, l) => s + (l.duration_min ?? 0), 0), total: logs.length };
  }, [logs]);

  const maxMin = Math.max(30, ...stats.week.map((w) => w.mins));
  const myTier = TIERS.indexOf(profile?.tier ?? 'member');

  return (
    <Screen eyebrow="Línea deportiva" title="LGCY">
      <Hero eyebrow="Próximamente" title="We’re cooking something" subtitle="La línea deportiva de Legacy. Mientras tanto, entrena y registra tu progreso aquí." />
      <View style={styles.rowWrap}>{tabs.map((t) => <Pill key={t} label={t} active={t === tab} onPress={() => { setTab(t); setMsg(''); }} />)}</View>
      {!!msg && <Text style={{ color: colors.danger }}>{msg}</Text>}

      {tab === 'Entrenos' && (workouts.length === 0 ? <Text style={type.small}>Pronto publicaremos rutinas de los atletas LGCY.</Text> : workouts.map((w) => (
        <Card key={w.id}>
          <Text style={type.h2}>{w.title}</Text>
          <Text style={type.small}>{[w.athletes?.name, w.minutes && `${w.minutes} min`, w.level].filter(Boolean).join(' · ')}</Text>
          {w.exercises.map((x, i) => (
            <Text key={i} style={[type.body, { color: colors.muted }]}>• {x.name}{x.sets ? ` — ${x.sets}×${x.reps ?? ''}` : ''}{x.rest_s ? ` · ${x.rest_s}s` : ''}</Text>
          ))}
          {open === w.id ? (
            <View style={{ gap: 8, marginTop: 6 }}>
              <TextInput style={input} placeholder={`Minutos (${w.minutes ?? '…'})`} placeholderTextColor={colors.muted} keyboardType="number-pad" value={mins} onChangeText={setMins} />
              <TextInput style={input} placeholder="Notas (opcional)" placeholderTextColor={colors.muted} value={notes} onChangeText={setNotes} />
              <Button label="GUARDAR" onPress={() => saveLog(w)} />
            </View>
          ) : <Button label={session ? 'REGISTRAR ENTRENO' : 'ENTRA PARA REGISTRAR'} onPress={() => (session ? setOpen(w.id) : needLogin())} />}
        </Card>
      )))}

      {tab === 'Mi progreso' && (!session ? (
        <Card><Text style={type.h2}>Sigue tu progreso</Text><Text style={type.small}>Entra para registrar entrenos, ver tu racha y tu semana.</Text><Button label="ENTRAR" onPress={needLogin} /></Card>
      ) : (
        <>
          <View style={styles.row}>
            {[['Racha', `${stats.streak}d`], ['Semana', String(stats.count)], ['Minutos', String(stats.minutes)]].map(([l, v]) => (
              <Card key={l} style={{ flex: 1, alignItems: 'center' }}><Text style={type.h1}>{v}</Text><Text style={type.small}>{l}</Text></Card>
            ))}
          </View>
          <Card>
            <Text style={type.h2}>Últimos 7 días</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 8, marginTop: 8 }}>
              {stats.week.map((w, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{ width: '100%', height: Math.max(3, (w.mins / maxMin) * 70), backgroundColor: w.mins ? '#fff' : colors.border, borderRadius: 4 }} />
                  <Text style={type.small}>{w.label}</Text>
                </View>
              ))}
            </View>
          </Card>
          <Section title="Historial">
            {logs.length === 0 && <Text style={type.small}>Aún no registras entrenos.</Text>}
            {logs.slice(0, 15).map((l) => (
              <Card key={l.id}><Text style={type.h2}>{l.title}</Text><Text style={type.small}>{new Date(l.logged_at).toLocaleDateString()} · {l.duration_min} min</Text>{l.notes && <Text style={[type.body, { color: colors.muted }]}>{l.notes}</Text>}</Card>
            ))}
          </Section>
        </>
      ))}

      {tab === 'Eventos' && (events.length === 0 ? <Text style={type.small}>No hay eventos publicados todavía. Los miembros Gold tienen acceso a eventos privados.</Text> : events.map((e) => {
        const locked = TIERS.indexOf(e.min_tier) > myTier;
        return (
          <Card key={e.id}>
            <Text style={type.h2}>{e.title}</Text>
            <Text style={type.small}>{[e.starts_at && new Date(e.starts_at).toLocaleString(), e.place, e.capacity && `${e.capacity} cupos`].filter(Boolean).join(' · ')}</Text>
            {e.description && <Text style={[type.body, { color: colors.muted }]}>{e.description}</Text>}
            {e.min_tier !== 'member' && <Text style={type.eyebrow}>SOLO {e.min_tier.toUpperCase()}+</Text>}
            <Button variant={rsvps.has(e.id) || locked ? 'ghost' : 'primary'} label={!session ? 'ENTRA PARA UNIRTE' : locked ? `🔒 NIVEL ${e.min_tier.toUpperCase()}` : rsvps.has(e.id) ? 'CANCELAR RESERVA ✓' : 'UNIRME'} onPress={() => (locked && session ? setMsg(`Necesitas nivel ${e.min_tier} para este evento.`) : rsvp(e))} />
          </Card>
        );
      }))}

      {tab === 'Atletas' && (athletes.length === 0 ? <Text style={type.small}>Pronto conocerás a los atletas LGCY: sus rutinas, alimentación y consejos.</Text> : athletes.map((a) => (
        <Card key={a.id}>
          <Text style={type.h2}>{a.name}</Text>{a.sport && <Text style={type.eyebrow}>{a.sport.toUpperCase()}</Text>}
          {a.bio && <Text style={[type.body, { color: colors.muted }]}>{a.bio}</Text>}
          {a.nutrition.length > 0 && <Text style={type.small}>Alimentación: {a.nutrition.join(' · ')}</Text>}
          {a.tips.length > 0 && <Text style={type.small}>Consejos: {a.tips.join(' · ')}</Text>}
        </Card>
      )))}
    </Screen>
  );
}
