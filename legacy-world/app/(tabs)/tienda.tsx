import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Pill, Screen } from '../../src/components/ui';
import { colors, radius, type } from '../../src/theme';
import { catalog, categories, links, perks } from '../../src/data/mock';

export default function Tienda() {
  const [cat, setCat] = useState('Todo');
  const items = catalog.filter((p) => cat === 'Todo' || p.category === cat);
  return (
    <Screen eyebrow="Shop" title="Tienda">
      <Text style={type.small}>{perks.join(' · ')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {categories.map((c) => <Pill key={c} label={c} active={c === cat} onPress={() => setCat(c)} />)}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {items.map((p) => (
          <Pressable key={p.id} style={{ width: '47.5%', gap: 6 }} onPress={() => Linking.openURL(`${links.site}/products/${p.handle}`)}>
            <View style={{ aspectRatio: 0.85, borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.surface }}>
              {p.image && <Image source={p.image} style={{ flex: 1 }} contentFit="cover" transition={200} />}
              {!p.available && <Text style={{ position: 'absolute', top: 8, left: 8, color: '#000', backgroundColor: '#fff', fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2 }}>AGOTADO</Text>}
              {p.club && <Text style={{ position: 'absolute', top: 8, right: 8, color: '#fff', backgroundColor: colors.navy, fontSize: 10, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2 }}>CLUB</Text>}
            </View>
            <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>{p.title}</Text>
            <Text style={type.small}>${p.price}{p.compareAt && p.compareAt > p.price ? `  ·  antes $${p.compareAt}` : ''}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
