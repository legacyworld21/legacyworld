// Contenido real extraído de legacy-world.com (nov 2026). Catálogo: src/data/catalog.json.
// Comunidad/LGCY siguen con datos demo hasta conectar Supabase.
import catalogJson from './catalog.json';

export type Product = {
  id: string; handle: string; title: string; price: number; compareAt: number | null; category: string;
  image: string | null; images: string[]; sizes: string[]; available: boolean; club: boolean; description: string;
};
export const catalog = catalogJson as Product[];
export const categories = ['Todo', 'Tees', 'Hoodies', 'Pants', 'Headwear', 'Eyewear', 'Jewelry', 'Bags'];

export const links = {
  instagram: 'https://instagram.com/legacyworld_',
  tiktok: 'https://tiktok.com/@legacyworld_',
  youtube: 'https://youtube.com/@legacyworld_',
  podcastEmail: 'podcast@legacy-world.com',
  site: 'https://legacy-world.com',
};

export const perks = ['Envío gratis nacional en órdenes +$150', 'Delivery gratis en Caracas', 'Recibimos a tasa BCV'];

export type TierId = 'member' | 'bronze' | 'silver' | 'gold';
export const tiers = [
  { id: 'member' as TierId, name: 'Member', points: 0, perks: ['Puntos por compras', '10% off en tu primera orden', 'Acceso a Legacy Vault', 'Acceso a misiones'], shipping: 'Órdenes +$150', early: '—', birthday: '—' },
  { id: 'bronze' as TierId, name: 'Bronze', points: 100, perks: ['Todo lo de Member', 'Acceso anticipado a drops (30 min)', 'Cumpleaños 15% off', 'Productos y recompensas exclusivas'], shipping: 'Órdenes +$100', early: '30 min', birthday: '15%' },
  { id: 'silver' as TierId, name: 'Silver', points: 250, perks: ['Todo lo de Bronze', 'Acceso anticipado a drops (1h)', 'Acceso anticipado al Vault', 'Cumpleaños 20% off'], shipping: 'Órdenes +$50', early: '1 h', birthday: '20%' },
  { id: 'gold' as TierId, name: 'Gold', points: 500, perks: ['Todo lo de Silver', 'Acceso prioritario a drops y Vault', 'Cumpleaños 25% off', 'Eventos privados exclusivos'], shipping: 'Todas las órdenes', early: 'Prioridad', birthday: '25%' },
];

export const missions = [
  { id: 'm1', title: 'Síguenos en Instagram', pts: 10 },
  { id: 'm2', title: 'Síguenos en TikTok', pts: 10 },
  { id: 'm3', title: 'Suscríbete en YouTube', pts: 10 },
  { id: 'm4', title: 'Completa tu cumpleaños', pts: 15 },
];

export const episodes = [
  { id: 'e1', n: 1, handle: '@cesaaoliveira', title: 'Cómo pasar de hacer TikToks a vivir de las redes', guest: 'César Oliveira', date: '2 feb 2026', duration: '1:32:05', url: 'https://youtu.be/4IU4OL3d9WE', summary: "Su historia y cómo una broma en TikTok se transformó en la canción viral 'Tú eres mala', con colaboraciones con Noriel y Neutro Shorty.", upcoming: false },
  { id: 'e2', n: 2, handle: '@neomaimusic', title: '“Quiero representar a Venezuela y ganar un Grammy”', guest: 'Neomai', date: '3 may 2026', duration: '1:03:22', url: 'https://youtu.be/i-frSRSTsq8', summary: 'Su historia, momentos que marcaron un precedente y la industria musical emergente en Venezuela.', upcoming: false },
  { id: 'e3', n: 3, handle: '', title: 'Próximo invitado — se anuncia pronto', guest: 'Por anunciar', date: 'Próximamente', duration: '', url: '', summary: 'Sé el primero en saber quién viene y déjale tu pregunta.', upcoming: true },
];

export const reach = [
  { label: 'Views en YouTube', value: '+38K' }, { label: 'Views en TikTok', value: '+4.8M' }, { label: 'Seguidores IG', value: '+18K' },
];

export const story = [
  { year: '2021', text: 'Nace Legacy mientras estudiaba Diseño Gráfico. Primera colección, Essentials, con ~70 unidades.' },
  { year: '2022', text: 'Lanza Purpose y llegan los primeros pedidos internacionales.' },
  { year: '2023', text: 'Creative Dept. (producción en Portugal) se agota en menos de un mes; llega Spirit of Greatness.' },
  { year: '2024', text: 'Beach Club, primer pop-up en Margarita, Curated Classics y Studio of Design. Fabio se vuelve socio.' },
  { year: '2025', text: 'Abre el showroom y los Studio Pants se convierten en best seller.' },
  { year: '2026', text: 'Lanza Legacy Podcast, desarrolla LGCY y prepara operación online para Venezuela, EE.UU. y España.' },
];

// LGCY: en el sitio dice "we're cooking something" — estos datos son demo de lo que vendrá.
export const athletes = [
  { id: 'a1', name: 'Atleta LGCY 1', sport: 'Por anunciar', quote: 'Muy pronto.' },
];
export const workouts = [
  { id: 'w1', title: 'Push Day · Fuerza', athlete: 'Demo', minutes: 55, level: 'Intermedio' },
  { id: 'w2', title: 'Intervalos 5K', athlete: 'Demo', minutes: 40, level: 'Avanzado' },
];
export const events = [
  { id: 'ev1', title: 'Evento privado Gold', date: 'Por anunciar', place: 'Caracas', spots: 40, tier: 'gold' as TierId },
];

export const posts = [
  { id: 'c1', author: 'maria_l', channel: 'Networking', text: '¿Alguien más emprendiendo en moda? Busco gente para intercambiar contactos de proveedores.', likes: 14, comments: 6 },
  { id: 'c2', author: 'dani.fit', channel: 'Entrenamiento', text: 'Mi progresión de press banca este mes: +7.5 kg.', likes: 32, comments: 9 },
  { id: 'c3', author: 'legacy_team', channel: 'Artículos', text: 'Lectura recomendada: cómo construir hábitos que duren más de 30 días.', likes: 51, comments: 12 },
];
export const channels = ['Todo', 'Networking', 'Entrenamiento', 'Artículos', 'Preguntas'];
