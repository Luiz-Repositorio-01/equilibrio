# EQUILÍBRIO INTEGRAL — Portal Premium

Portal **Next.js 15** de conteúdo, SEO, monetização e CMS.

> Deploy: raiz do repositório = app Next.js. A pasta `_legacy/` é só backup do HTML antigo e **não** é o entrypoint.

## Como rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra: [http://localhost:3000](http://localhost:3000)

## Login do CMS (admin)

- URL local: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Usuário / e-mail: `antonio.ptp2011@gmail.com`
- Senha: a definida em `ADMIN_PASSWORD` (Vercel / `.env.local`)

Em produção, configure as mesmas variáveis no painel da Vercel (veja `.env.example`).
Para recuperação de senha por e-mail, configure também `RESEND_API_KEY`.

## Deploy automático (GitHub → Vercel)

**Produção atual:** [https://equilibrio-one-nu.vercel.app](https://equilibrio-one-nu.vercel.app)  
Projeto Vercel: `auryx1/equilibrio` · GitHub já conectado · Framework Next.js na raiz (`vercel.json`).

Fluxo: **push em `main` → Production**; **PR → Preview**.

### Passo único que falta (GitHub)

O código Next.js ainda precisa ser publicado no GitHub (login local ausente). No terminal:

```bash
gh auth login
git push -u origin main
```

Se o Git recusar por histórico diferente do HTML antigo:

```bash
git push -u origin main --force
```

Repositório: [github.com/luizaorodrigues2-art/equilibrio](https://github.com/luizaorodrigues2-art/equilibrio)

Depois disso, qualquer `git push` em `main` (incluindo de agentes) sobe sozinho para a Vercel.

### Variáveis na Vercel

Já configuradas no projeto: `NEXT_PUBLIC_SITE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.  
Opcionais (`.env.example`): `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_GSC_VERIFICATION`.

### CLI

```bash
vercel link          # já linkado localmente
vercel --prod        # deploy manual se precisar
vercel env pull      # sincroniza envs locais
```

## Estrutura

- `src/` — frontend + admin + APIs
- `content/articles/` — artigos do portal
- `artigos/` — DOCX originais
- `_legacy/` — site HTML antigo (backup; ignorar no deploy)
- `vercel.json` — confirma framework Next.js na raiz
