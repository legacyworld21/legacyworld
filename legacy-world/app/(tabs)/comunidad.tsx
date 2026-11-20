import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Pill, Screen } from '../../src/components/ui';
import { colors, radius, type } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/lib/auth';

type Ch = { slug: string; name: string };
type Post = { id: string; channel: string; body: string; likes_count: number; comments_count: number; created_at: string; profiles: { username: string | null; display_name: string | null; tier: string } | null };

export default function Comunidad() {
  const { session } = useAuth();
  const [channels, setChannels] = useState<Ch[]>([]);
  const [ch, setCh] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const { data: c } = await supabase.from('channels').select('slug,name').order('position');
    setChannels((c as Ch[]) ?? []);
    let query = supabase.from('posts').select('id,channel,body,likes_count,comments_count,created_at,profiles(username,display_name,tier)').order('created_at', { ascending: false }).limit(50);
    if (ch !== 'all') query = query.eq('channel', ch);
    const { data } = await query;
    setPosts((data as unknown as Post[]) ?? []);
    if (session) {
      const { data: l } = await supabase.from('post_likes').select('post_id').eq('user_id', session.user.id);
      setLiked(new Set((l ?? []).map((x: any) => x.post_id)));
    }
  }, [ch, session]);
  useEffect(() => { load(); }, [load]);

  const publish = async () => {
    if (!session) return router.push('/login');
    if (!text.trim()) return;
    const { error } = await supabase.from('posts').insert({ channel: ch === 'all' ? 'networking' : ch, body: text.trim() });
    if (error) return setErr(error.message);
    setText(''); setErr(''); load();
  };

  const like = async (id: string) => {
    if (!session) return router.push('/login');
    if (liked.has(id)) await supabase.from('post_likes').delete().eq('post_id', id).eq('user_id', session.user.id);
    else await supabase.from('post_likes').insert({ post_id: id });
    load();
  };

  return (
    <Screen eyebrow="Conecta" title="Comunidad">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Pill label="Todo" active={ch === 'all'} onPress={() => setCh('all')} />
        {channels.map((c) => <Pill key={c.slug} label={c.name} active={c.slug === ch} onPress={() => setCh(c.slug)} />)}
      </ScrollView>
      <Card>
        <TextInput value={text} onChangeText={setText} multiline maxLength={2000} placeholder={session ? 'Comparte algo con la comunidad…' : 'Entra para publicar'} placeholderTextColor={colors.muted}
          style={{ color: colors.text, minHeight: 60 }} editable={!!session} />
        {!!err && <Text style={{ color: colors.danger }}>{err}</Text>}
        <Button label={session ? 'PUBLICAR' : 'ENTRAR'} onPress={publish} />
      </Card>
      {posts.length === 0 && <Text style={type.small}>Aún no hay publicaciones. ¡Sé el primero!</Text>}
      {posts.map((p) => (
        <Card key={p.id}>
          <Text style={type.eyebrow}>{p.channel.toUpperCase()} · {p.profiles?.tier?.toUpperCase()}</Text>
          <Text style={type.h2}>@{p.profiles?.username ?? p.profiles?.display_name ?? 'legacy'}</Text>
          <Text style={type.body}>{p.body}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable onPress={() => like(p.id)}><Text style={{ color: liked.has(p.id) ? '#fff' : colors.muted }}>{liked.has(p.id) ? '♥' : '♡'} {p.likes_count}</Text></Pressable>
            <Text style={type.small}>💬 {p.comments_count}</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
