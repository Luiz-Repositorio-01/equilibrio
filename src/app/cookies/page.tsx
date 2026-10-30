import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildPageMetadata({
  title: "Política de Cookies",
  description:
    "Quais cookies o Saúde Integral usa, para que servem e como aceitar ou recusar os que não são essenciais.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section__title">Política de Cookies</h1>
        <div className="prose" style={{ marginTop: "1.5rem" }}>
          <p>
            Esta página explica os cookies e tecnologias parecidas usados no {siteConfig.name}.
            Ela complementa a <Link href="/privacidade">Política de Privacidade</Link>.
          </p>

          <h2>O que é um cookie</h2>
          <p>
            Cookie é um pequeno arquivo que o navegador guarda quando você visita um site.
            Ele pode lembrar uma preferência ou permitir que um serviço reconheça o navegador
            em visitas seguintes. O aviso de consentimento deste site guarda a sua escolha em
            armazenamento local do navegador, não em um cookie.
          </p>

          <h2>Cookies essenciais</h2>
          <p>
            Servem para o site funcionar. O painel interno usa um cookie de sessão apenas
            depois do login da equipe. As páginas públicas de artigos não exigem conta.
          </p>

          <h2>Cookies de análise</h2>
          <p>
            Se o Google Analytics ou o Google Tag Manager estiverem configurados no ambiente
            do site, eles podem medir visitas de forma agregada. Quando não há identificador
            dessas ferramentas, esse tipo de cookie não é iniciado por nós.
          </p>

          <h2>Cookies de publicidade</h2>
          <p>
            O site carrega o script do Google AdSense para que o Google possa verificar o
            domínio. O Google e parceiros podem usar cookies para limitar repetição de
            anúncios e, quando a personalização estiver ativa, relacionar a visita a interesses.
            Você pode recusar cookies não essenciais no aviso do site e também ajustar a
            publicidade em{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer nofollow">
              Configurações de anúncios do Google
            </a>
            .
          </p>

          <h2>Como decidir</h2>
          <ul>
            <li>No primeiro acesso, o aviso oferece aceitar ou recusar.</li>
            <li>Para mudar depois, apague os dados do site no navegador e recarregue a página.</li>
            <li>O navegador também permite bloquear cookies de terceiros.</li>
          </ul>
          <p>
            Recusar o aviso não apaga, sozinho, um cookie que o Google já tenha gravado.
            Use as configurações do navegador ou as do Google para isso.
          </p>

          <h2>Contato</h2>
          <p>
            Dúvidas: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
