-- LGCY: rutinas iniciales (editables luego en Table Editor → workouts). Pegar en SQL Editor → Run.
insert into public.workouts (title, minutes, level, published, exercises) values
 ('Full Body · Fuerza base', 55, 'Todos', true,
  '[{"name":"Sentadilla","sets":4,"reps":"8","rest_s":90},{"name":"Press banca","sets":4,"reps":"8","rest_s":90},{"name":"Remo con barra","sets":4,"reps":"10","rest_s":75},{"name":"Plancha","sets":3,"reps":"45s","rest_s":45}]'),
 ('Push Day', 50, 'Intermedio', true,
  '[{"name":"Press militar","sets":4,"reps":"8","rest_s":90},{"name":"Press inclinado","sets":4,"reps":"10","rest_s":75},{"name":"Fondos","sets":3,"reps":"12","rest_s":60},{"name":"Elevaciones laterales","sets":3,"reps":"15","rest_s":45}]'),
 ('Intervalos 5K', 40, 'Avanzado', true,
  '[{"name":"Calentamiento trote","sets":1,"reps":"10 min"},{"name":"400 m rápido","sets":8,"reps":"400 m","rest_s":90},{"name":"Enfriamiento","sets":1,"reps":"5 min"}]');

-- Evento de ejemplo (descomenta, ajusta fecha/lugar y ejecuta cuando tengas uno real):
-- insert into public.events (title, description, place, starts_at, capacity, min_tier) values
--  ('LGCY Training Day', 'Entrenamiento grupal con atletas LGCY.', 'Caracas', '2026-12-12 10:00-04', 40, 'bronze');
