-- =========================================================
-- CF OS — Bucket de almacenamiento para fotos de progreso
-- Ejecutar en el SQL Editor de Supabase DESPUÉS del esquema principal
-- =========================================================

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- El cliente solo puede subir/leer dentro de su propia carpeta (client_id/...)
create policy "cliente sube sus propias fotos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] in (
      select id::text from clients where profile_id = auth.uid()
    )
  );

create policy "cliente lee sus propias fotos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and (
      (storage.foldername(name))[1] in (
        select id::text from clients where profile_id = auth.uid()
      )
      or is_admin()
    )
  );
