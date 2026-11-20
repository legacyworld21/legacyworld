import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, size }: { color: any; size: number }) => <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#fff', tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border } }}>
      <Tabs.Screen name="index" options={{ title: 'Universo', tabBarIcon: icon('planet') }} />
      <Tabs.Screen name="tienda" options={{ title: 'Tienda', tabBarIcon: icon('bag-handle') }} />
      <Tabs.Screen name="club" options={{ title: 'Club', tabBarIcon: icon('diamond') }} />
      <Tabs.Screen name="lgcy" options={{ title: 'LGCY', tabBarIcon: icon('barbell') }} />
      <Tabs.Screen name="comunidad" options={{ title: 'Comunidad', tabBarIcon: icon('people') }} />
    </Tabs>
  );
}
