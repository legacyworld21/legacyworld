import { router } from 'expo-router';
import { Linking, Pressable, Text } from 'react-native';
import { Card, Hero, Screen, Section } from '../../src/components/ui';
import { type } from '../../src/theme';
import { episodes, links, story } from '../../src/data/mock';

export default function Universo() {
  const last = episodes.filter((e) => !e.upcoming).slice(-1)[0];
  return (
    <Screen eyebrow="Est. 2021 · Caracas" title="Legacy World">
      <Hero eyebrow="Legacy Club" title="Más que recompensas. Un lugar dentro de Legacy." subtitle="1$ = 1 punto. Acceso anticipado a drops, Vault y eventos privados." cta="Unirme al club" onPress={() => router.push('/club')} />
      <Section title="Legacy Podcast">
        <Pressable onPress={() => router.push('/podcast')}>
          <Card><Text style={type.eyebrow}>ÚLTIMO EPISODIO · EP. {last.n}</Text><Text style={type.h2}>{last.title}</Text><Text style={type.small}>Ver episodios y preguntar al próximo invitado →</Text></Card>
        </Pressable>
      </Section>
      <Section title="LGCY">
        <Card><Text style={type.h2}>We’re cooking something</Text><Text style={type.small}>La línea deportiva de Legacy. Entra a la pestaña LGCY para el acceso anticipado.</Text></Card>
      </Section>
      <Section title="Behind Legacy">
        {story.slice(-3).map((s) => <Card key={s.year}><Text style={type.eyebrow}>{s.year}</Text><Text style={type.body}>{s.text}</Text></Card>)}
        <Pressable onPress={() => Linking.openURL(links.youtube)}><Text style={type.small}>Documentamos todo — mira nuestro journey en YouTube →</Text></Pressable>
      </Section>
    </Screen>
  );
}
