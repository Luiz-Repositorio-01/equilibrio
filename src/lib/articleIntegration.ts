import type { Article } from "./types";

export type IntegrationBoxes = {
  personal: string;
  family: string;
  professional: string;
};

const LABELS = {
  personal: { icon: "🌱", title: "Vida Pessoal" },
  family: { icon: "🏡", title: "Vida Familiar" },
  professional: { icon: "💼", title: "Vida Profissional" },
} as const;

/** Textos curados onde a aplicação prática pede linguagem específica. */
const OVERRIDES: Record<string, IntegrationBoxes> = {
  "a-conexao-intestino-cerebro-o-eixo-transmissor-da-saude-fisica": {
    personal:
      "Dedique 5 minutos do seu dia para perceber como seu estômago reage quando você está ansioso. Reduza o consumo de ultraprocessados em uma refeição do dia para testar o impacto no seu bem-estar mental.",
    family:
      "No momento das refeições em família, tente criar um ambiente de conversa leve, longe de telas e discussões pesadas, permitindo que a digestão e a conexão aconteçam em harmonia.",
    professional:
      "Quando sentir um pico de estresse no trabalho, em vez de recorrer imediatamente ao café, faça três respirações profundas (diafragmáticas) para acalmar o eixo intestino-cérebro e retomar o foco com clareza.",
  },
};

const FALLBACK: IntegrationBoxes = {
  personal:
    "Escolha um hábito pequeno citado neste texto e teste hoje, com curiosidade e sem cobrar perfeição.",
  family:
    "Leve uma ideia do artigo para a mesa ou para um momento em família, com conversa leve e menos telas.",
  professional:
    "No trabalho, faça uma pausa curta — água ou três respirações — antes de decidir no automático.",
};

function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function fromPracticeList(html: string): IntegrationBoxes | null {
  const block = html.match(
    /<h2 id="aplicacao-pratica">[\s\S]*?<ol>([\s\S]*?)<\/ol>/i
  );
  if (!block) return null;
  const items = [...block[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) =>
    stripTags(m[1])
  );
  if (items.length < 3) return null;
  return {
    personal: items[0],
    family: items[1],
    professional: items[2],
  };
}

export function getIntegrationBoxes(article: Article): IntegrationBoxes {
  return OVERRIDES[article.slug] ?? fromPracticeList(article.content) ?? FALLBACK;
}

export function integrationCards(boxes: IntegrationBoxes) {
  return (["personal", "family", "professional"] as const).map((key) => ({
    key,
    icon: LABELS[key].icon,
    title: LABELS[key].title,
    text: boxes[key],
  }));
}

/** Remove o bloco “Como aplicar no seu dia” do HTML — ele vai para os boxes abaixo do título. */
export function stripPracticeSection(html: string): string {
  return html.replace(
    /<h2 id="aplicacao-pratica">[\s\S]*?<\/p>(?=\s*(?:<h2 id="leituras-relacionadas">|<h2 id="referencias">|$))/i,
    ""
  );
}
