-- Armazenamento do CMS do blog (artigos, anúncios/AdSense, usuários, métricas).
create table if not exists public.blog_cms_docs (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Acesso fechado: sem policies, só a chave de serviço (servidor) lê/grava.
alter table public.blog_cms_docs enable row level security;
revoke all on public.blog_cms_docs from anon, authenticated;
