-- Legacy World · esquema inicial. Pegar completo en Supabase → SQL Editor → Run.

-- ========== PERFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name text,
  avatar_url text,
  city text,
  bio text,
  points int not null default 0,
  tier text not null default 'member' check (tier in ('member','bronze','silver','gold')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
-- el usuario NO puede tocar puntos ni nivel
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, avatar_url, city, bio) on public.profiles to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ========== PUNTOS (solo servidor: webhook de Shopify / service role) ==========
create table public.point_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,
  reason text not null,            -- 'purchase' | 'mission' | 'bonus'
  ref text,                        -- id de orden / misión
  created_at timestamptz not null default now()
);
alter table public.point_ledger enable row level security;
create policy "ver mis puntos" on public.point_ledger for select to authenticated using (auth.uid() = user_id);

create function public.apply_points() returns trigger language plpgsql security definer set search_path = '' as $$
declare total int;
begin
  update public.profiles set points = points + new.delta where id = new.user_id returning points into total;
  update public.profiles set tier = case when total >= 500 then 'gold' when total >= 250 then 'silver' when total >= 100 then 'bronze' else 'member' end where id = new.user_id;
  return new;
end $$;
create trigger ledger_apply after insert on public.point_ledger for each row execute function public.apply_points();

-- ========== PODCAST ==========
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  number int unique not null,
  title text not null,
  guest text,
  handle text,
  summary text,
  youtube_url text,
  duration text,
  published_at date,
  status text not null default 'published' check (status in ('upcoming','published'))
);
alter table public.episodes enable row level security;
create policy "episodios públicos" on public.episodes for select using (true);

create table public.podcast_questions (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 5 and 400),
  votes_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.podcast_questions enable row level security;
create policy "preguntas públicas" on public.podcast_questions for select using (true);
create policy "preguntar" on public.podcast_questions for insert to authenticated with check (auth.uid() = user_id);
create policy "borrar mi pregunta" on public.podcast_questions for delete to authenticated using (auth.uid() = user_id);

create table public.podcast_question_votes (
  question_id uuid references public.podcast_questions(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  primary key (question_id, user_id)
);
alter table public.podcast_question_votes enable row level security;
create policy "votos públicos" on public.podcast_question_votes for select using (true);
create policy "votar" on public.podcast_question_votes for insert to authenticated with check (auth.uid() = user_id);
create policy "quitar voto" on public.podcast_question_votes for delete to authenticated using (auth.uid() = user_id);

-- ========== COMUNIDAD ==========
create table public.channels (slug text primary key, name text not null, position int not null default 0);
alter table public.channels enable row level security;
create policy "canales públicos" on public.channels for select using (true);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  channel text not null references public.channels(slug),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  link_url text,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.posts (channel, created_at desc);
alter table public.posts enable row level security;
create policy "posts públicos" on public.posts for select using (true);
create policy "publicar" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "borrar mi post" on public.posts for delete to authenticated using (auth.uid() = user_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy "comentarios públicos" on public.comments for select using (true);
create policy "comentar" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "borrar mi comentario" on public.comments for delete to authenticated using (auth.uid() = user_id);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "likes públicos" on public.post_likes for select using (true);
create policy "dar like" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "quitar like" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

-- contadores
create function public.bump(tbl text, col text, id uuid, d int) returns void language plpgsql security definer set search_path = '' as $$
begin
  execute format('update public.%I set %I = greatest(0, %I + $1) where id = $2', tbl, col, col) using d, id;
end $$;
revoke all on function public.bump(text,text,uuid,int) from public, anon, authenticated;

create function public.trg_counts() returns trigger language plpgsql security definer set search_path = '' as $$
declare d int := case when tg_op = 'INSERT' then 1 else -1 end; r record := case when tg_op = 'INSERT' then new else old end;
begin
  if tg_table_name = 'post_likes' then perform public.bump('posts','likes_count', r.post_id, d);
  elsif tg_table_name = 'comments' then perform public.bump('posts','comments_count', r.post_id, d);
  elsif tg_table_name = 'podcast_question_votes' then perform public.bump('podcast_questions','votes_count', r.question_id, d);
  end if;
  return null;
end $$;
create trigger t_likes after insert or delete on public.post_likes for each row execute function public.trg_counts();
create trigger t_comments after insert or delete on public.comments for each row execute function public.trg_counts();
create trigger t_votes after insert or delete on public.podcast_question_votes for each row execute function public.trg_counts();

-- ========== LGCY ==========
create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  name text not null, sport text, bio text, avatar_url text,
  nutrition jsonb not null default '[]', tips jsonb not null default '[]'
);
alter table public.athletes enable row level security;
create policy "atletas públicos" on public.athletes for select using (true);

create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid references public.athletes(id) on delete set null,
  title text not null, minutes int, level text,
  exercises jsonb not null default '[]',   -- [{name, sets, reps, rest_s}]
  video_url text,
  published boolean not null default false
);
alter table public.workouts enable row level security;
create policy "entrenos publicados" on public.workouts for select using (published);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  title text not null,
  duration_min int check (duration_min > 0),
  entries jsonb not null default '[]',      -- [{exercise, sets:[{reps, kg}]}]
  notes text,
  logged_at timestamptz not null default now()
);
create index on public.workout_logs (user_id, logged_at desc);
alter table public.workout_logs enable row level security;
create policy "ver mis entrenos" on public.workout_logs for select to authenticated using (auth.uid() = user_id);
create policy "registrar entreno" on public.workout_logs for insert to authenticated with check (auth.uid() = user_id);
create policy "editar mi entreno" on public.workout_logs for update to authenticated using (auth.uid() = user_id);
create policy "borrar mi entreno" on public.workout_logs for delete to authenticated using (auth.uid() = user_id);

-- ========== EVENTOS ==========
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, place text,
  starts_at timestamptz, capacity int,
  min_tier text not null default 'member' check (min_tier in ('member','bronze','silver','gold')),
  published boolean not null default true
);
alter table public.events enable row level security;
create policy "eventos públicos" on public.events for select using (published);

create table public.event_rsvps (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);
alter table public.event_rsvps enable row level security;
create policy "ver mis rsvp" on public.event_rsvps for select to authenticated using (auth.uid() = user_id);
create policy "cancelar rsvp" on public.event_rsvps for delete to authenticated using (auth.uid() = user_id);
-- RSVP solo si tu nivel alcanza y hay cupo
create policy "unirme a evento" on public.event_rsvps for insert to authenticated with check (
  auth.uid() = user_id
  and exists (select 1 from public.events e, public.profiles p
    where e.id = event_id and p.id = auth.uid()
      and array_position(array['member','bronze','silver','gold'], p.tier) >= array_position(array['member','bronze','silver','gold'], e.min_tier)
      and (e.capacity is null or (select count(*) from public.event_rsvps r where r.event_id = e.id) < e.capacity))
);

-- ========== SEMILLAS ==========
insert into public.channels (slug, name, position) values
 ('networking','Networking',1),('entrenamiento','Entrenamiento',2),('articulos','Artículos',3),('preguntas','Preguntas',4);

insert into public.episodes (number, title, guest, handle, summary, youtube_url, duration, published_at, status) values
 (1,'Cómo pasar de hacer TikToks a vivir de las redes','César Oliveira','@cesaaoliveira',
  'Su historia y cómo una broma en TikTok se transformó en la canción viral ''Tú eres mala'', con colaboraciones con Noriel y Neutro Shorty.',
  'https://youtu.be/4IU4OL3d9WE','1:32:05','2026-02-02','published'),
 (2,'“Quiero representar a Venezuela y ganar un Grammy”','Neomai','@neomaimusic',
  'Su historia, momentos que marcaron un precedente y la industria musical emergente en Venezuela.',
  'https://youtu.be/i-frSRSTsq8','1:03:22','2026-05-03','published'),
 (3,'Próximo invitado — se anuncia pronto','Por anunciar',null,'Sé el primero en saber quién viene y déjale tu pregunta.',null,null,null,'upcoming');
