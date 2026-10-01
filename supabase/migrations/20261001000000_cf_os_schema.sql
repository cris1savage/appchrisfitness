-- =====================================================================
-- CF OS (Chris Fitness) — esquema completo de la web y la app móvil
--
-- • Se puede ejecutar más de una vez sin romper nada (idempotente).
-- • NO borra ni modifica tus tablas antiguas en español (rutinas, pesos,
--   checkins, calendario, mensajes…). Solo crea tablas nuevas.
-- • A la tabla "profiles" existente solo le AÑADE las columnas role y
--   full_name, y quita NOT NULL de sus otras columnas para que se puedan
--   crear perfiles nuevos al activar invitaciones.
--
-- Cómo ejecutarlo: Supabase → SQL Editor → New query → pegar todo → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles (ya existe en tu proyecto: se amplía)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles add column if not exists role text default 'client';
alter table public.profiles add column if not exists full_name text;
alter table public.profiles alter column role set default 'client';

-- Columnas antiguas (nombre, email, rol, altura…) pasan a ser opcionales
do $$
declare c record;
begin
  for c in
    select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and is_nullable = 'NO' and column_name <> 'id'
  loop
    execute format('alter table public.profiles alter column %I drop not null', c.column_name);
  end loop;
end $$;

-- Rellenar role / full_name a partir de las columnas antiguas si existen
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles' and column_name = 'rol') then
    execute $q$
      update public.profiles
         set role = case when lower(coalesce(rol, '')) in ('coach', 'admin', 'entrenador') then 'admin' else 'client' end
       where role is null or (role = 'client' and lower(coalesce(rol, '')) in ('coach', 'admin', 'entrenador'))
    $q$;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'profiles' and column_name = 'nombre') then
    execute 'update public.profiles set full_name = nombre where full_name is null';
  end if;
end $$;

update public.profiles set role = 'client' where role is null or role not in ('admin', 'client');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'client'));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 2. Tablas
-- ---------------------------------------------------------------------
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid unique references auth.users (id) on delete set null,
  full_name   text not null,
  email       text not null,
  goal        text,
  status      text not null default 'activo',
  start_date  date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  token       text not null unique default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.exercises_library (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  video_url        text,
  description      text,
  technique_notes  text,
  common_mistakes  text,
  created_at       timestamptz not null default now()
);

create table if not exists public.foods_library (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  kcal_per_100     numeric not null default 0,
  protein_per_100  numeric not null default 0,
  carbs_per_100    numeric not null default 0,
  fat_per_100      numeric not null default 0,
  fiber_per_100    numeric not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.training_blocks (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  name         text not null,
  length_days  integer not null check (length_days between 1 and 31),
  start_date   date,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.training_days (
  id          uuid primary key default gen_random_uuid(),
  block_id    uuid not null references public.training_blocks (id) on delete cascade,
  day_number  integer not null,
  name        text
);

create table if not exists public.training_exercises (
  id               uuid primary key default gen_random_uuid(),
  training_day_id  uuid not null references public.training_days (id) on delete cascade,
  exercise_id      uuid not null references public.exercises_library (id) on delete restrict,
  order_index      integer not null default 0,
  sets             integer,
  reps             text,
  rir              integer,
  rest_seconds     integer,
  tempo            text,
  trainer_notes    text
);

create table if not exists public.exercise_logs (
  id                    uuid primary key default gen_random_uuid(),
  training_exercise_id  uuid not null references public.training_exercises (id) on delete cascade,
  client_id             uuid not null references public.clients (id) on delete cascade,
  weight                numeric,
  reps                  integer,
  rir                   integer,
  client_note           text,
  trainer_note          text,
  logged_at             timestamptz not null default now()
);

create table if not exists public.nutrition_plans (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  name            text not null,
  target_kcal     integer,
  target_protein  integer,
  target_carbs    integer,
  target_fat      integer,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.meals (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references public.nutrition_plans (id) on delete cascade,
  name         text not null,
  order_index  integer not null default 0
);

create table if not exists public.meal_options (
  id             uuid primary key default gen_random_uuid(),
  meal_id        uuid not null references public.meals (id) on delete cascade,
  option_number  integer not null default 1,
  is_selected    boolean not null default false
);

create table if not exists public.meal_option_foods (
  id              uuid primary key default gen_random_uuid(),
  option_id       uuid not null references public.meal_options (id) on delete cascade,
  food_id         uuid not null references public.foods_library (id) on delete restrict,
  quantity_grams  numeric not null check (quantity_grams > 0)
);

create table if not exists public.weight_goals (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  start_weight   numeric not null,
  target_weight  numeric not null,
  start_date     date not null,
  target_date    date not null,
  weekly_rate    numeric,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.weight_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  weight      numeric not null check (weight > 0),
  logged_at   date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.progress_photos (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  storage_path  text not null,
  photo_type    text,
  taken_at      timestamptz not null default now()
);

create table if not exists public.checkin_templates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  questions   jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.checkin_schedule (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients (id) on delete cascade,
  template_id  uuid not null references public.checkin_templates (id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.checkin_responses (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients (id) on delete cascade,
  template_id   uuid references public.checkin_templates (id) on delete set null,
  answers       jsonb not null default '{}'::jsonb,
  submitted_at  timestamptz not null default now()
);

-- Índices para los filtros más usados
create index if not exists invitations_client_idx        on public.invitations (client_id);
create index if not exists training_blocks_client_idx    on public.training_blocks (client_id);
create index if not exists training_days_block_idx       on public.training_days (block_id);
create index if not exists training_exercises_day_idx    on public.training_exercises (training_day_id);
create index if not exists exercise_logs_client_idx      on public.exercise_logs (client_id, logged_at desc);
create index if not exists nutrition_plans_client_idx    on public.nutrition_plans (client_id);
create index if not exists meals_plan_idx                on public.meals (plan_id);
create index if not exists meal_options_meal_idx         on public.meal_options (meal_id);
create index if not exists meal_option_foods_option_idx  on public.meal_option_foods (option_id);
create index if not exists weight_goals_client_idx       on public.weight_goals (client_id);
create index if not exists weight_logs_client_idx        on public.weight_logs (client_id, logged_at desc);
create index if not exists progress_photos_client_idx    on public.progress_photos (client_id);
create index if not exists checkin_schedule_client_idx   on public.checkin_schedule (client_id);
create index if not exists checkin_responses_client_idx  on public.checkin_responses (client_id, submitted_at desc);

-- ---------------------------------------------------------------------
-- 3. Funciones auxiliares de permisos
--    security definer: consultan profiles/clients sin quedar atrapadas
--    por las propias reglas RLS (evita recursión).
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_client_id()
returns uuid
language sql stable security definer
set search_path = public
as $$
  select id from public.clients where profile_id = auth.uid() limit 1;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_client_id() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.my_client_id() to authenticated, service_role;

-- ---------------------------------------------------------------------
-- 4. Solo un bloque de entrenamiento y un plan de nutrición activos por
--    cliente: al crear/activar uno nuevo se desactivan los anteriores.
--    (La app pide "el activo" y fallaría si hubiera varios.)
-- ---------------------------------------------------------------------
create or replace function public.keep_single_active()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_active then
    execute format('update public.%I set is_active = false where client_id = $1 and id <> $2 and is_active', tg_table_name)
      using new.client_id, new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists training_blocks_single_active on public.training_blocks;
create trigger training_blocks_single_active
  after insert or update of is_active on public.training_blocks
  for each row execute function public.keep_single_active();

drop trigger if exists nutrition_plans_single_active on public.nutrition_plans;
create trigger nutrition_plans_single_active
  after insert or update of is_active on public.nutrition_plans
  for each row execute function public.keep_single_active();

-- ---------------------------------------------------------------------
-- 5. Permisos de tabla: nada para usuarios sin sesión (anon)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','clients','invitations','exercises_library','foods_library',
    'training_blocks','training_days','training_exercises','exercise_logs',
    'nutrition_plans','meals','meal_options','meal_option_foods',
    'weight_goals','weight_logs','progress_photos',
    'checkin_templates','checkin_schedule','checkin_responses'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- El cliente solo puede cambiar qué opción de comida elige (columna is_selected)
revoke update on public.meal_options from authenticated;
grant update (is_selected) on public.meal_options to authenticated;

-- ---------------------------------------------------------------------
-- 6. Reglas RLS
--    Coach (role = 'admin'): acceso total.
--    Cliente: solo lo suyo. Las bibliotecas de ejercicios/alimentos se
--    pueden leer (las necesita para ver su rutina y su plan).
-- ---------------------------------------------------------------------

-- Coach: todo
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','clients','invitations','exercises_library','foods_library',
    'training_blocks','training_days','training_exercises','exercise_logs',
    'nutrition_plans','meals','meal_options','meal_option_foods',
    'weight_goals','weight_logs','progress_photos',
    'checkin_templates','checkin_schedule','checkin_responses'
  ] loop
    execute format('drop policy if exists cfos_admin_all on public.%I', t);
    execute format('create policy cfos_admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- profiles: cada uno ve el suyo
drop policy if exists cfos_profiles_own on public.profiles;
create policy cfos_profiles_own on public.profiles
  for select to authenticated using (id = auth.uid());

-- clients: el cliente ve su ficha
drop policy if exists cfos_clients_own on public.clients;
create policy cfos_clients_own on public.clients
  for select to authenticated using (profile_id = auth.uid());

-- Bibliotecas: lectura para cualquier usuario con sesión
drop policy if exists cfos_exercises_read on public.exercises_library;
create policy cfos_exercises_read on public.exercises_library
  for select to authenticated using (true);

drop policy if exists cfos_foods_read on public.foods_library;
create policy cfos_foods_read on public.foods_library
  for select to authenticated using (true);

-- Entrenamiento
drop policy if exists cfos_blocks_own on public.training_blocks;
create policy cfos_blocks_own on public.training_blocks
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_days_own on public.training_days;
create policy cfos_days_own on public.training_days
  for select to authenticated using (
    exists (select 1 from public.training_blocks b where b.id = block_id and b.client_id = public.my_client_id())
  );

drop policy if exists cfos_texercises_own on public.training_exercises;
create policy cfos_texercises_own on public.training_exercises
  for select to authenticated using (
    exists (
      select 1 from public.training_days d join public.training_blocks b on b.id = d.block_id
      where d.id = training_day_id and b.client_id = public.my_client_id()
    )
  );

drop policy if exists cfos_logs_read_own on public.exercise_logs;
create policy cfos_logs_read_own on public.exercise_logs
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_logs_insert_own on public.exercise_logs;
create policy cfos_logs_insert_own on public.exercise_logs
  for insert to authenticated with check (
    client_id = public.my_client_id()
    and exists (
      select 1 from public.training_exercises te
      join public.training_days d on d.id = te.training_day_id
      join public.training_blocks b on b.id = d.block_id
      where te.id = training_exercise_id and b.client_id = public.my_client_id()
    )
  );

-- Nutrición
drop policy if exists cfos_plans_own on public.nutrition_plans;
create policy cfos_plans_own on public.nutrition_plans
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_meals_own on public.meals;
create policy cfos_meals_own on public.meals
  for select to authenticated using (
    exists (select 1 from public.nutrition_plans p where p.id = plan_id and p.client_id = public.my_client_id())
  );

drop policy if exists cfos_options_own on public.meal_options;
create policy cfos_options_own on public.meal_options
  for select to authenticated using (
    exists (
      select 1 from public.meals m join public.nutrition_plans p on p.id = m.plan_id
      where m.id = meal_id and p.client_id = public.my_client_id()
    )
  );

drop policy if exists cfos_options_choose_own on public.meal_options;
create policy cfos_options_choose_own on public.meal_options
  for update to authenticated
  using (
    exists (
      select 1 from public.meals m join public.nutrition_plans p on p.id = m.plan_id
      where m.id = meal_id and p.client_id = public.my_client_id()
    )
  )
  with check (
    exists (
      select 1 from public.meals m join public.nutrition_plans p on p.id = m.plan_id
      where m.id = meal_id and p.client_id = public.my_client_id()
    )
  );

drop policy if exists cfos_option_foods_own on public.meal_option_foods;
create policy cfos_option_foods_own on public.meal_option_foods
  for select to authenticated using (
    exists (
      select 1 from public.meal_options o
      join public.meals m on m.id = o.meal_id
      join public.nutrition_plans p on p.id = m.plan_id
      where o.id = option_id and p.client_id = public.my_client_id()
    )
  );

-- Progreso
drop policy if exists cfos_goals_own on public.weight_goals;
create policy cfos_goals_own on public.weight_goals
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_weights_read_own on public.weight_logs;
create policy cfos_weights_read_own on public.weight_logs
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_weights_insert_own on public.weight_logs;
create policy cfos_weights_insert_own on public.weight_logs
  for insert to authenticated with check (client_id = public.my_client_id());

drop policy if exists cfos_photos_read_own on public.progress_photos;
create policy cfos_photos_read_own on public.progress_photos
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_photos_insert_own on public.progress_photos;
create policy cfos_photos_insert_own on public.progress_photos
  for insert to authenticated with check (
    client_id = public.my_client_id()
    and split_part(storage_path, '/', 1) = public.my_client_id()::text
  );

-- Check-ins
drop policy if exists cfos_templates_own on public.checkin_templates;
create policy cfos_templates_own on public.checkin_templates
  for select to authenticated using (
    exists (select 1 from public.checkin_schedule s where s.template_id = id and s.client_id = public.my_client_id())
  );

drop policy if exists cfos_schedule_own on public.checkin_schedule;
create policy cfos_schedule_own on public.checkin_schedule
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_responses_read_own on public.checkin_responses;
create policy cfos_responses_read_own on public.checkin_responses
  for select to authenticated using (client_id = public.my_client_id());

drop policy if exists cfos_responses_insert_own on public.checkin_responses;
create policy cfos_responses_insert_own on public.checkin_responses
  for insert to authenticated with check (client_id = public.my_client_id());

-- ---------------------------------------------------------------------
-- 7. Fotos de progreso: bucket privado, cada cliente en su carpeta
--    (sustituye a cf_os_storage_setup.sql)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "cliente sube sus propias fotos" on storage.objects;
drop policy if exists "cliente lee sus propias fotos" on storage.objects;
drop policy if exists cfos_photos_upload on storage.objects;
drop policy if exists cfos_photos_read on storage.objects;
drop policy if exists cfos_photos_admin_delete on storage.objects;

create policy cfos_photos_upload on storage.objects
  for insert to authenticated with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = public.my_client_id()::text
  );

create policy cfos_photos_read on storage.objects
  for select to authenticated using (
    bucket_id = 'progress-photos'
    and ((storage.foldername(name))[1] = public.my_client_id()::text or public.is_admin())
  );

create policy cfos_photos_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'progress-photos' and public.is_admin());
