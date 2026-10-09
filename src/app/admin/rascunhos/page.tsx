import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listArticlesAdmin } from "@/lib/cms";
import { ArticlesTable } from "@/components/admin/ArticlesTable";

export default async function AdminDraftsPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const drafts = (await listArticlesAdmin()).filter((a) => a.status === "draft");

  return (
    <ArticlesTable
      title="Rascunhos"
      subtitle={
        drafts.length === 1
          ? "1 artigo fora do ar, aguardando publicação"
          : `${drafts.length} artigos fora do ar, aguardando publicação`
      }
      articles={drafts}
      emptyTitle="Nenhum rascunho no momento"
      emptyText="Quando você salvar um artigo com a situação “Rascunho” (ou tirar um artigo do ar), ele aparece aqui. Rascunhos não são vistos pelos leitores."
    />
  );
}
