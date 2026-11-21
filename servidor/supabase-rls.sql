-- =====================================================
-- APIX GYM · Reglas de seguridad de Supabase (RLS)
-- Copia de referencia de cómo están puestas en el proyecto (21-11-2026).
-- RLS = «Row Level Security»: cada usuario solo puede tocar las filas que le dejan estas reglas.
-- Si cambias algo en Supabase, actualiza también este archivo.
-- =====================================================

-- Todas las tablas tienen RLS activada:
-- amistades, config_push, copias, denuncias, me_gusta, perfiles, publicaciones,
-- push_avisos, push_dispositivos, study_avisos, study_config, visitas.
-- Las que no tienen reglas (config_push, push_*, study_*, visitas) NO se pueden leer
-- ni escribir desde la app: solo desde el servidor.

-- ---------- copias: la copia de seguridad de cada usuario (solo la suya) ----------
create policy "ver mi copia"     on copias for select to authenticated using ((select auth.uid()) = usuario);
create policy "crear mi copia"   on copias for insert to authenticated with check ((select auth.uid()) = usuario);
create policy "cambiar mi copia" on copias for update to authenticated using ((select auth.uid()) = usuario) with check ((select auth.uid()) = usuario);
create policy "borrar mi copia"  on copias for delete to authenticated using ((select auth.uid()) = usuario);

-- ---------- perfiles ----------
create policy "ver mi perfil"     on perfiles for select to authenticated using ((select auth.uid()) = usuario);
create policy "crear mi perfil"   on perfiles for insert to authenticated with check ((select auth.uid()) = usuario);
create policy "cambiar mi perfil" on perfiles for update to authenticated using ((select auth.uid()) = usuario) with check ((select auth.uid()) = usuario);
create policy "ver perfiles de amigos" on perfiles for select to authenticated using (
  privacidad <> 'privado'
  and (son_amigos((select auth.uid()), usuario)
       or exists (select 1 from amistades s where s.de = perfiles.usuario and s.a = (select auth.uid())))
);

-- ---------- amistades ----------
create policy "ver mis amistades"    on amistades for select to authenticated using ((select auth.uid()) = de or (select auth.uid()) = a);
create policy "borrar mis amistades" on amistades for delete to authenticated using ((select auth.uid()) = de or (select auth.uid()) = a);
create policy "aceptar solicitudes recibidas" on amistades for update to authenticated
  using (a = (select auth.uid())) with check (a = (select auth.uid()) and aceptada);

-- ---------- publicaciones ----------
create policy "ver mis publicaciones y las de mis amigos" on publicaciones for select to authenticated
  using (autor = (select auth.uid()) or son_amigos((select auth.uid()), autor));
create policy "publicar como yo (máximo 20 al día)" on publicaciones for insert to authenticated
  with check (autor = (select auth.uid()) and publicaciones_hoy((select auth.uid())) < 20);
create policy "borrar mis publicaciones" on publicaciones for delete to authenticated using (autor = (select auth.uid()));

-- ---------- me_gusta ----------
create policy "ver me gusta de lo que puedo ver" on me_gusta for select to authenticated
  using (exists (select 1 from publicaciones p where p.id = me_gusta.publicacion));
create policy "dar me gusta a lo que puedo ver" on me_gusta for insert to authenticated
  with check (usuario = (select auth.uid()) and exists (select 1 from publicaciones p where p.id = me_gusta.publicacion));
create policy "cambiar mi reaccion" on me_gusta for update
  using (usuario = (select auth.uid())) with check (usuario = (select auth.uid()));
create policy "quitar mi me gusta" on me_gusta for delete to authenticated using (usuario = (select auth.uid()));

-- ---------- denuncias: solo se pueden crear, nadie las lee desde la app ----------
create policy "denunciar como yo" on denuncias for insert to authenticated with check (denunciante = (select auth.uid()));
