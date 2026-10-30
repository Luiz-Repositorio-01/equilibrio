import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Termos de Uso",
  description: "Termos e condições de uso do portal SAÚDE INTEGRAL.",
  path: "/termos",
});

export default function TermosPage() {
  const updated = new Date().toISOString().slice(0, 10);
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section__title">Termos de Uso</h1>
        <div className="prose" style={{ marginTop: "1.5rem" }}>
          <p>
            Bem-vindo(a) ao {siteConfig.name}. Ao acessar e navegar por este site, você
            concorda com os termos e condições descritos abaixo. Recomendamos a leitura
            atenta deste documento.
          </p>

          <h2>1. Sobre o conteúdo</h2>
          <p>
            Todo o conteúdo publicado no {siteConfig.name} — textos, imagens e materiais —
            tem caráter <strong>informativo e educativo</strong> sobre bem-estar, saúde
            mental, física e espiritual. Ele <strong>não substitui</strong> a orientação,
            o diagnóstico ou o tratamento de profissionais de saúde qualificados. Em caso
            de dúvidas sobre sua saúde, consulte sempre um médico ou especialista.
          </p>

          <h2>2. Propriedade intelectual</h2>
          <p>
            Os conteúdos originais publicados são de propriedade do {siteConfig.name} e
            protegidos pela legislação de direitos autorais. É permitido compartilhar os
            links dos artigos, mas a reprodução integral sem autorização prévia e sem
            atribuição da fonte não é permitida. As fotografias de capa são obtidas em
            bancos de imagens gratuitos/licenciados, com os devidos créditos aos autores.
          </p>

          <h2>3. Uso adequado</h2>
          <p>
            O usuário compromete-se a utilizar o site de forma lícita, sem prejudicar seu
            funcionamento, sua segurança ou a experiência de outros visitantes.
          </p>

          <h2>4. Publicidade e links de terceiros</h2>
          <p>
            Este site é mantido, entre outros meios, por publicidade — incluindo anúncios
            do <strong>Google AdSense</strong> — e pode conter links para sites de
            terceiros. Não nos responsabilizamos pelo conteúdo, pelas políticas ou pelas
            práticas de sites externos. O uso de cookies para fins de publicidade é
            descrito na nossa <a href="/privacidade">Política de Privacidade</a> e na{" "}
            <a href="/cookies">Política de Cookies</a>. A forma como os textos são
            produzidos está na <a href="/editorial">Política Editorial</a>.
          </p>

          <h2>5. Newsletter</h2>
          <p>
            Ao se inscrever na newsletter, você concorda em receber comunicações por
            e-mail. O cancelamento pode ser solicitado a qualquer momento pelo contato{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>

          <h2>6. Alterações</h2>
          <p>
            Estes termos podem ser atualizados a qualquer momento. A versão vigente estará
            sempre disponível nesta página.
          </p>

          <h2>7. Contato</h2>
          <p>
            Dúvidas sobre estes termos? Fale conosco em{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>

          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "2rem" }}>
            Última atualização: {updated}.
          </p>
        </div>
      </div>
    </section>
  );
}
