import Link from "next/link";
import { redirect } from "next/navigation";
import { clearSessionCookie, getSession } from "@/lib/auth";

async function logoutAction() {
  "use server";
  await clearSessionCookie();
  redirect("/admin/login");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <aside className="admin-aside">
        <div className="logo" style={{ marginBottom: "1.2rem", fontSize: "1rem" }}>
          CMS <em>Equilíbrio</em>
        </div>
        <nav>
          <Link href="/admin">Painel</Link>
          <Link href="/admin/assistente">Assistente</Link>
          <div className="admin-nav-group">Conteúdo</div>
          <Link href="/admin/artigos">Artigos</Link>
          <Link href="/admin/artigos/novo">Novo artigo</Link>
          <Link href="/admin/rascunhos">Rascunhos</Link>
          <Link href="/admin/agendamento">Agendamento</Link>
          <Link href="/admin/categorias">Categorias</Link>
          <Link href="/admin/autores">Autores</Link>
          <Link href="/admin/comentarios">Comentários</Link>
          <Link href="/admin/capas-ia">IA Capas</Link>
          <div className="admin-nav-group">Audiência</div>
          <Link href="/admin/newsletter">Newsletter</Link>
          <Link href="/admin/assinantes">Assinantes</Link>
          <div className="admin-nav-group">Mídia & SEO</div>
          <Link href="/admin/uploads">Uploads</Link>
          <Link href="/admin/biblioteca">Biblioteca</Link>
          <Link href="/admin/seo">SEO</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <div className="admin-nav-group">Monetização</div>
          <Link href="/admin/monetizacao">Central</Link>
          <Link href="/admin/monetizacao/adsense">AdSense</Link>
          <Link href="/admin/monetizacao/ad-manager">Ad Manager</Link>
          <Link href="/admin/monetizacao/afiliados">Afiliados</Link>
          <Link href="/admin/monetizacao/redes">Redes</Link>
          <Link href="/admin/monetizacao/banners">Banners</Link>
          <Link href="/admin/monetizacao/financeiro">PIX / Banco</Link>
          <Link href="/admin/monetizacao/receita">Receita</Link>
          <Link href="/admin/anuncios">Espaços de anúncio</Link>
          <div className="admin-nav-group">Sistema</div>
          <Link href="/admin/usuarios">Usuários</Link>
          <Link href="/admin/configuracoes">Configurações</Link>
          <Link href="/admin/alterar-senha">Alterar senha</Link>
          <Link href="/">Ver site</Link>
        </nav>
        <form action={logoutAction} style={{ marginTop: "1.5rem" }}>
          <button className="btn btn--outline" type="submit" style={{ width: "100%" }}>
            Sair
          </button>
        </form>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
