import { Text, View } from 'react-native';
import { Button, Card, Screen, Section } from '../../src/components/ui';
import { colors, radius, type } from '../../src/theme';
import { missions, tiers } from '../../src/data/mock';
import { router } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';

export default function Club() {
  const { session, profile } = useAuth();
  const points = profile?.points ?? 0;
  const idx = tiers.reduce((a, t, i) => (points >= t.points ? i : a), 0);
  const current = tiers[idx];
  const next = tiers[idx + 1];
  const pct = next ? (points - current.points) / (next.points - current.points) : 1;
  return (
    <Screen eyebrow="Legacy Club" title="Más que recompensas">
      {!session ? (
        <Card><Text style={type.h2}>Únete al Legacy Club</Text><Text style={type.small}>Crea tu cuenta para ver tus puntos, nivel y misiones.</Text><Button label="UNIRME / ENTRAR" onPress={() => router.push('/login')} /></Card>
      ) : <Button variant="ghost" label="CERRAR SESIÓN" onPress={() => supabase.auth.signOut()} />}
      <Card style={{ borderColor: colors.navy, backgroundColor: colors.navy + '55' }}>
        <Text style={type.eyebrow}>TU NIVEL</Text>
        <Text style={type.h1}>{current.name}</Text>
        <Text style={type.small}>{points} pts{next ? ` · faltan ${next.points - points} para ${next.name}` : ' · nivel máximo'}</Text>
        <View style={{ height: 8, backgroundColor: colors.surface2, borderRadius: radius.pill, marginTop: 8 }}>
          <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: '#fff', borderRadius: radius.pill }} />
        </View>
        <Text style={[type.small, { marginTop: 6 }]}>1$ gastado = 1 punto. Nunca bajas de nivel.</Text>
      </Card>
      <Section title="Niveles">
        {tiers.map((t) => (
          <Card key={t.id} style={t.id === current.id ? { borderColor: '#fff' } : undefined}>
            <Text style={type.h2}>{t.name} <Text style={type.small}>· {t.points === 0 ? 'al unirte' : `desde ${t.points} pts`}</Text></Text>
            {t.perks.map((p) => <Text key={p} style={[type.body, { color: colors.muted }]}>• {p}</Text>)}
            <Text style={type.small}>Envío gratis: {t.shipping}</Text>
          </Card>
        ))}
      </Section>
      <Section title="Misiones">
        {missions.map((m) => (
          <Card key={m.id}><Text style={type.h2}>{m.title}</Text><Text style={type.small}>+{m.pts} pts</Text><Button label="COMPLETAR" variant="ghost" /></Card>
        ))}
      </Section>
    </Screen>
  );
}
