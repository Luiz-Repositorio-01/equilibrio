import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Política de Privacidade",
  description:
    "Como o SAÚDE INTEGRAL coleta, usa e protege seus dados, incluindo cookies e publicidade do Google AdSense.",
  path: "/privacidade",
});

export default function PrivacidadePage() {
  const updated = new Date().toISOString().slice(0, 10);
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 className="section__title">Política de Privacidade</h1>
        <div className="prose" style={{ marginTop: "1.5rem" }}>
          <p>
            A sua privacidade é importante para o {siteConfig.name}. Esta política explica,
            de forma transparente, quais dados coletamos, como os utilizamos e quais são os
            seus direitos, em conformidade com a{" "}
            <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
          </p>

          <h2>1. Dados que coletamos</h2>
          <p>
            <strong>Dados de navegação:</strong> páginas visitadas, tempo de leitura,
            dispositivo e origem do acesso, coletados de forma agregada por ferramentas de
            análise. <br />
            <strong>Dados fornecidos por você:</strong> o e-mail informado voluntariamente
            ao se inscrever na newsletter ou os dados enviados pelo formulário de contato.
          </p>

          <h2>2. Como usamos os dados</h2>
          <p>
            Utilizamos os dados para melhorar o conteúdo e a experiência do site, medir
            audiência, enviar a newsletter (quando solicitada) e exibir publicidade.
          </p>

          <h2>3. Cookies</h2>
          <p>
            Cookies são pequenos arquivos armazenados no seu navegador. Utilizamos:
          </p>
          <ul>
            <li>
              <strong>Cookies essenciais</strong> — necessários para o funcionamento do
              site;
            </li>
            <li>
              <strong>Cookies de análise</strong> — para entender como o site é usado
              (por exemplo, Google Analytics);
            </li>
            <li>
              <strong>Cookies de publicidade</strong> — utilizados por parceiros como o
              Google para exibir anúncios relevantes.
            </li>
          </ul>
          <p>
            Você pode gerenciar ou desativar cookies nas configurações do seu navegador a
            qualquer momento. O banner de consentimento exibido na sua primeira visita
            permite aceitar ou recusar os cookies não essenciais. O detalhamento está na{" "}
            <a href="/cookies">Política de Cookies</a>.
          </p>

          <h2>4. Google AdSense e publicidade</h2>
          <p>
            Este site utiliza o <strong>Google AdSense</strong>, um serviço de publicidade
            fornecido pela Google. Para exibir anúncios, o Google e seus parceiros podem
            usar cookies:
          </p>
          <ul>
            <li>
              Fornecedores terceirizados, incluindo o Google, usam cookies para exibir
              anúncios com base em visitas anteriores do usuário a este e a outros sites.
            </li>
            <li>
              O uso de cookies de publicidade permite que o Google e seus parceiros exibam
              anúncios com base na navegação do usuário.
            </li>
            <li>
              Os usuários podem desativar a publicidade personalizada acessando as{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                Configurações de anúncios do Google
              </a>
              , ou desativar cookies de terceiros em{" "}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                www.aboutads.info
              </a>
              .
            </li>
          </ul>
          <p>
            Para mais informações sobre como o Google utiliza dados ao usar nossos
            serviços, consulte a{" "}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              política de privacidade do Google
            </a>
            .
          </p>

          <h2>5. Compartilhamento de dados</h2>
          <p>
            Não vendemos seus dados pessoais. Compartilhamos informações apenas com os
            provedores necessários para operar o site (análise, hospedagem e publicidade),
            que seguem suas próprias políticas de privacidade.
          </p>

          <h2>6. Seus direitos (LGPD)</h2>
          <p>
            Você pode, a qualquer momento, solicitar acesso, correção, portabilidade ou
            exclusão dos seus dados, bem como revogar o consentimento. Para exercer esses
            direitos, entre em contato pelo e-mail{" "}
            <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>

          <h2>7. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra
            acesso não autorizado, perda ou alteração.
          </p>

          <h2>8. Alterações nesta política</h2>
          <p>
            Esta política pode ser atualizada periodicamente. A versão vigente estará
            sempre disponível nesta página.
          </p>

          <h2>9. Contato</h2>
          <p>
            Dúvidas sobre privacidade ou tratamento de dados? Fale conosco em{" "}
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
