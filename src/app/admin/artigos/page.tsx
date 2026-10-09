import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listArticlesAdmin } from "@/lib/cms";
import { ArticlesTable } from "@/components/admin/ArticlesTable";

export default async function AdminArticlesPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const articles = await listArticlesAdmin();

  return (
    <ArticlesTable
      title="Artigos"
      subtitle={`${articles.length} conteúdos no CMS`}
      articles={articles}
      emptyTitle="Nenhum artigo ainda"
      emptyText="Crie o primeiro artigo para ele aparecer aqui."
    />
  );
}
