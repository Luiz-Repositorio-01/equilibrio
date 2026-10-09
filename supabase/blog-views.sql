-- Contagem REAL de visualizações (atômica, sem perder visitas entre servidores).
-- Uma linha por (artigo, dia): armazenamento mínimo. slug '_site' = total do site.
create table if not exists public.blog_views (
  slug text not null,
  day date not null,
  views bigint not null default 0,
  primary key (slug, day)
);
alter table public.blog_views enable row level security;
revoke all on public.blog_views from anon, authenticated;

create or replace function public.blog_track_view(p_slug text) returns void
language sql security invoker set search_path = public as $$
  insert into public.blog_views (slug, day, views)
  values (p_slug, (now() at time zone 'America/Sao_Paulo')::date, 1)
  on conflict (slug, day) do update set views = public.blog_views.views + 1;
$$;

create or replace function public.blog_view_totals() returns table (slug text, total bigint)
language sql security invoker set search_path = public as $$
  select slug, sum(views)::bigint from public.blog_views group by slug;
$$;

revoke all on function public.blog_track_view(text) from public, anon, authenticated;
revoke all on function public.blog_view_totals() from public, anon, authenticated;
grant execute on function public.blog_track_view(text) to service_role;
grant execute on function public.blog_view_totals() to service_role;
