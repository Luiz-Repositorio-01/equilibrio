import Link from "next/link";
import type { IntegrationBoxes } from "@/lib/articleIntegration";
import { integrationCards } from "@/lib/articleIntegration";
import { siteConfig } from "@/lib/site";

type Props = {
  boxes: IntegrationBoxes;
};

export function ArticleIntegrationPanel({ boxes }: Props) {
  const cards = integrationCards(boxes);

  return (
    <section className="article-integration" aria-labelledby="integracao-pratica">
      <h2 id="integracao-pratica" className="article-integration__title">
        Na Prática: Integrando o Saber ao Viver
      </h2>
      <div className="article-integration__grid">
        {cards.map((card) => (
          <article key={card.key} className="article-integration__card">
            <h3 className="article-integration__card-title">
              <span aria-hidden="true">{card.icon}</span> {card.title}
            </h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
      <aside className="article-integration__legal" role="note">
        <h3 className="article-integration__legal-title">Aviso médico e de responsabilidade</h3>
        <p>
          O {siteConfig.name} publica conteúdo <strong>informativo e educativo</strong> sobre
          saúde integral. <strong>Não somos médicos, psicólogos, nutricionistas nem clínica.</strong>{" "}
          Nada nesta página substitui consulta, diagnóstico, tratamento ou acompanhamento por
          profissional habilitado. Decisões sobre medicamentos, dietas restritivas, suplementos ou
          exercício com dor ou sintomas novos devem ser tomadas com orientação individual.
        </p>
        <p>
          Se algo persistir, piorar ou interferir no seu dia a dia, procure atendimento de saúde.
          Ao continuar lendo, você reconhece que o portal não assume responsabilidade por uso
          isolado das informações. Veja também{" "}
          <Link href="/termos">Termos de Uso</Link>, <Link href="/privacidade">Privacidade</Link> e{" "}
          <Link href="/editorial">Política editorial</Link>.
        </p>
      </aside>
    </section>
  );
}
