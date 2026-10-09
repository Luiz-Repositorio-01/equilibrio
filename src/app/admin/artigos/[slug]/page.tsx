import { notFound, redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getArticleAdmin } from "@/lib/cms";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function EditArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const { slug } = await params;
  const article = await getArticleAdmin(slug);
  if (!article) notFound();
  return <ArticleEditor article={article} />;
}
