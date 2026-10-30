import { siteConfig } from "@/lib/site";
import { buildPageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/ui/ContactForm";

export const metadata = buildPageMetadata({
  title: "Contato",
  description:
    "Fale com a equipe do Saúde Integral por formulário ou e-mail sobre pauta, correção, parceria ou privacidade.",
  path: "/contato",
});

export default function ContatoPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="section__eyebrow">Contato</div>
        <h1 className="section__title">Fale com a equipe</h1>
        <p className="section__desc">
          Pauta, correção de um texto, parceria, imprensa ou pedido sobre os seus dados.
          Não há atendimento clínico por este canal.
        </p>
        <ContactForm />
        <div className="prose" style={{ marginTop: "1.5rem" }}>
          <p>
            E-mail: <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
          </p>
          <p>
            O portal não publica endereço físico, telefone ou CNPJ nesta página. A resposta
            é feita pelo e-mail informado. Mensagens sobre saúde pessoal não substituem um
            serviço de urgência.
          </p>
        </div>
      </div>
    </section>
  );
}
