import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getAllAuthorProfiles } from "@/lib/authors";

export const metadata = buildPageMetadata({
  title: "Política Editorial",
  description:
    "Como o Saúde Integral escolhe, assina, revisa e corrige os textos, e o que o portal não promete.",
  path: "/editorial",
});

export default function EditorialPage() {
  const authors = getAllAuthorProfiles();
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section__title">Política Editorial</h1>
        <div className="prose" style={{ marginTop: "1.5rem" }}>
          <p>
            O {siteConfig.name} publica textos informativos sobre hábitos de corpo, mente e
            vida interior. Esta página descreve como esse material é feito e o que ele não é.
          </p>

          <h2>Quem assina</h2>
          <p>Cada artigo publicado leva o nome de quem o assina e um link para a página Sobre:</p>
          <ul>
            {authors.map((author) => (
              <li key={author.slug}>
                <Link href={`/sobre#${author.slug}`}>{author.name}</Link> — {author.role}
              </li>
            ))}
          </ul>
          <p>
            As biografias descrevem a função de cada pessoa no portal. Não acrescentamos
            registro profissional, formação ou título que a própria pessoa não tenha informado.
          </p>

          <h2>O que publicamos</h2>
          <p>
            Explicações práticas: como organizar uma refeição, uma noite de sono, uma pausa
            ou uma conversa. Cada texto deve responder a uma pergunta específica. Assuntos
            vizinhos ficam em artigos diferentes, com links entre eles, para a leitura não
            se repetir.
          </p>

          <h2>O que não publicamos</h2>
          <ul>
            <li>Promessa de cura, detox, blindagem imunológica ou resultado garantido.</li>
            <li>Estatística, pesquisa ou depoimento que a equipe não possa apontar.</li>
            <li>Orientação individual de medicamento, dieta restritiva ou treino.</li>
            <li>Conteúdo copiado de outro site.</li>
          </ul>

          <h2>Saúde</h2>
          <p>
            Os artigos não substituem médico, psicólogo, nutricionista ou outro profissional.
            Quando um texto fala de corpo, ele diz o limite do que dá para fazer em casa e
            em que situação procurar atendimento. Fontes públicas, como o Guia Alimentar
            para a População Brasileira e páginas da Organização Mundial da Saúde, aparecem
            quando ajudam o leitor a conferir o tema. Elas não transformam o artigo em
            prescrição.
          </p>

          <h2>Datas</h2>
          <p>
            A data de publicação e, quando o texto foi revisado, a data de atualização ficam
            visíveis no artigo. Uma revisão pode corrigir uma afirmação exagerada, um link
            quebrado ou acrescentar um passo prático sem apagar o assunto original.
          </p>

          <h2>Publicidade</h2>
          <p>
            O site usa o Google AdSense. O anúncio não define o texto. Enquanto não houver
            uma unidade criada no painel do Google, o portal não reserva buracos em branco
            no meio da leitura. A política de privacidade e a de cookies explicam o uso de
            dados de publicidade.
          </p>

          <h2>Correções</h2>
          <p>
            Se você encontrar um erro, escreva para{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> ou use a página de{" "}
            <Link href="/contato">contato</Link>. Informe o título do artigo e o trecho. A
            correção, quando procedente, entra no texto com a data de atualização.
          </p>
        </div>
      </div>
    </section>
  );
}
