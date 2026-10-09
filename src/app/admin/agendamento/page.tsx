import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listArticlesAdmin } from "@/lib/cms";
import { ArticlesTable } from "@/components/admin/ArticlesTable";

export default async function AdminSchedulePage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const now = Date.now();
  // Só os que ainda vão ao ar (os que já passaram da hora já estão publicados no site).
  const scheduled = (await listArticlesAdmin())
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => +new Date(a.scheduledFor || 0) - +new Date(b.scheduledFor || 0));
  const waiting = scheduled.filter((a) => +new Date(a.scheduledFor || 0) > now).length;

  return (
    <ArticlesTable
      title="Agendamento"
      subtitle={
        scheduled.length
          ? `${waiting} aguardando a hora de ir ao ar · horário de Brasília`
          : "Artigos programados para ir ao ar sozinhos"
      }
      articles={scheduled}
      emptyTitle="Nenhum artigo agendado"
      emptyText="Para agendar, abra um artigo, escolha a situação “Agendado” e informe a data e a hora. Ele entra no ar sozinho no horário marcado (pode levar até 5 minutos)."
      showScheduleColumn
    />
  );
}
