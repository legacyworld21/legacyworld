import { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Hero, Screen, Section } from '../src/components/ui';
import { colors, radius, type } from '../src/theme';
import { links, reach } from '../src/data/mock';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/lib/auth';

type Ep = { id: string; number: number; title: string; guest: string | null; handle: string | null; summary: string | null; youtube_url: string | null; duration: string | null; published_at: string | null; status: string };
type Q = { id: string; body: string; votes_count: number; profiles: { username: string | null; display_name: string | null } | null };

export default function Podcast() {
  const { session } = useAuth();
  const [eps, setEps] = useState<Ep[]>([]);
  const [qs, setQs] = useState<Q[]>([]);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const next = eps.find((e) => e.status === 'upcoming');

  const load = useCallback(async () => {
    const { data: e } = await supabase.from('episodes').select('*').order('number', { ascending: false });
    setEps((e as Ep[]) ?? []);
    const up = (e as Ep[] | null)?.find((x) => x.status === 'upcoming');
    if (up) {
      const { data } = await supabase.from('podcast_questions').select('id,body,votes_count,profiles(username,display_name)').eq('episode_id', up.id).order('votes_count', { ascending: false }).limit(50);
      setQs((data as unknown as Q[]) ?? []);
    }
    if (session) {
      const { data } = await supabase.from('podcast_question_votes').select('question_id').eq('user_id', session.user.id);
      setMine(new Set((data ?? []).map((v: any) => v.question_id)));
    }
  }, [session]);
  useEffect(() => { load(); }, [load]);

  const requireLogin = () => { router.push('/login'); };

  const ask = async () => {
    if (!session) return requireLogin();
    if (!next || q.trim().length < 5) return setErr('Escribe al menos 5 caracteres.');
    const { error } = await supabase.from('podcast_questions').insert({ episode_id: next.id, body: q.trim() });
    if (error) return setErr(error.message);
    setQ(''); setErr(''); load();
  };

  const vote = async (id: string) => {
    if (!session) return requireLogin();
    if (mine.has(id)) await supabase.from('podcast_question_votes').delete().eq('question_id', id).eq('user_id', session.user.id);
    else await supabase.from('podcast_question_votes').insert({ question_id: id });
    load();
  };

  return (
    <Screen>
      <Hero eyebrow={`Legacy Podcast · Temporada 1${next ? ` · Ep. ${next.number}` : ''}`} title={next?.title ?? 'Legacy Podcast'} subtitle="Conversaciones reales con creadores, artistas y emprendedores que están construyendo su legado." />
      <Section title="Pregúntale al próximo invitado">
        <TextInput value={q} onChangeText={setQ} placeholder="Escribe tu pregunta…" placeholderTextColor={colors.muted} multiline maxLength={400}
          style={{ color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 80 }} />
        {!!err && <Text style={{ color: colors.danger }}>{err}</Text>}
        <Button label={session ? 'ENVIAR PREGUNTA' : 'ENTRA PARA PREGUNTAR'} onPress={ask} />
        {qs.map((x) => (
          <Card key={x.id}>
            <Text style={type.body}>{x.body}</Text>
            <Text style={type.small}>@{x.profiles?.username ?? x.profiles?.display_name ?? 'legacy'}</Text>
            <Pressable onPress={() => vote(x.id)}><Text style={{ color: mine.has(x.id) ? '#fff' : colors.muted, fontWeight: '700' }}>{mine.has(x.id) ? '▲ Votada' : '△ Votar'} · {x.votes_count}</Text></Pressable>
          </Card>
        ))}
      </Section>
      <Section title="Episodios">
        {eps.filter((e) => e.status === 'published').map((e) => (
          <Card key={e.id}>
            <Text style={type.eyebrow}>EP. {e.number} · {e.handle}</Text>
            <Text style={type.h2}>{e.title}</Text>
            <Text style={type.small}>{e.published_at} · {e.duration}</Text>
            <Text style={[type.body, { color: colors.muted }]}>{e.summary}</Text>
            {e.youtube_url && <Button label="VER EN YOUTUBE" variant="ghost" onPress={() => Linking.openURL(e.youtube_url!)} />}
          </Card>
        ))}
      </Section>
      <Section title="Nuestro alcance">
        {reach.map((r) => <Card key={r.label}><Text style={type.h1}>{r.value}</Text><Text style={type.small}>{r.label}</Text></Card>)}
      </Section>
      <Button label="SER INVITADO / SPONSOR" onPress={() => Linking.openURL(`mailto:${links.podcastEmail}`)} />
    </Screen>
  );
}
