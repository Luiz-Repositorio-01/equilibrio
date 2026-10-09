export type AuthorProfile = {
  /** Identificador usado na âncora da página Sobre (/sobre#slug). */
  slug: string;
  name: string;
  role: string;
  /** Frase de apresentação do autor. */
  quote?: string;
  bio: string;
  photo?: string;
  /** Aviso institucional específico do autor (ex.: registro profissional), quando aplicável. */
  disclaimer?: string;
};

/**
 * Perfis dos autores, com as biografias fornecidas por eles (arquivo biografia.zip).
 * Nunca acrescentar credenciais, registros profissionais (CRM/CRP) ou formação
 * sem confirmação dos próprios autores.
 */
const AUTHOR_PROFILES: Record<string, Omit<AuthorProfile, "name">> = {
  "Antonio Paulo Tavares Pereira": {
    slug: "antonio",
    role: "Fundador & Idealizador do Portal Saúde Integral",
    quote:
      "Acredito que cuidar do espírito e da mente não precisa ser complicado, mas sim um hábito simples e diário.",
    bio: "Antonio Paulo criou o Portal Saúde Integral a partir de uma busca pessoal por mais equilíbrio, leveza e paz interior no meio da correria do cotidiano. Sem a pretensão de ser um especialista ou mestre espiritual, sua missão é atuar como um facilitador: pesquisar, organizar e compartilhar práticas acessíveis sobre espiritualidade, bem-estar e presença plena. Para ele, pequenos rituais diários — como três minutos de silêncio pela manhã ou uma pausa consciente no trabalho — têm o poder de transformar a rotina e renovar a nossa energia.",
  },
  "Gabriela Travaglia Pereira": {
    slug: "gabriela",
    role: "Co-criadora & Curadora de Conteúdo",
    quote:
      "Buscar o bem-estar é uma jornada diária que todos nós podemos trilhar juntos.",
    bio: "Gabriela traz para o Portal Saúde Integral uma energia jovem e curiosa sobre hábitos saudáveis, conexão com a natureza e ferramentas de desconexão digital. Inspirada pela busca de um estilo de vida mais consciente e equilibrado, ela ajuda a selecionar e estruturar conteúdos práticos para que qualquer pessoa, independentemente da sua rotina, consiga aplicar pequenos rituais de paz no seu dia a dia. Para ela, levar informação simples e transformadora é a melhor forma de impactar positivamente a vida das pessoas.",
  },
  "Vanessa Travaglia Pereira": {
    slug: "vanessa",
    role: "Co-criadora & Colaboradora de Conteúdo",
    quote:
      "Pequenas mudanças no nosso dia a dia têm o poder de transformar a nossa paz de espírito.",
    bio: "Apaixonada por autocuidado, organização pessoal e qualidade de vida, Vanessa colabora no Portal Saúde Integral trazendo um olhar atento e prático para o bem-estar familiar e diário. Sua motivação vem do desejo sincero de levar acolhimento, dicas de relaxamento e reflexões leves para quem busca desacelerar a mente e criar um ambiente mais harmonioso dentro de casa. Ela acredita que a saúde integral se constrói nos detalhes da rotina e no afeto que dedicamos a nós mesmos e aos outros.",
  },
};

const FALLBACK_PROFILE: Omit<AuthorProfile, "name" | "slug"> = {
  role: "Autor(a)",
  bio: "",
};

/** Retorna o perfil do autor pelo nome exato usado no artigo; nunca inventa dados. */
export function getAuthorProfile(name?: string | null): AuthorProfile | null {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const known = AUTHOR_PROFILES[trimmed];
  if (known) return { name: trimmed, ...known };
  return { name: trimmed, slug: "autor", ...FALLBACK_PROFILE };
}

/** Todos os autores conhecidos, na ordem de apresentação (página Sobre). */
export function getAllAuthorProfiles(): AuthorProfile[] {
  return Object.entries(AUTHOR_PROFILES).map(([name, p]) => ({ name, ...p }));
}

/** Iniciais para o avatar (primeiro e segundo nome): "Antonio Paulo ..." -> "AP". */
export function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}
