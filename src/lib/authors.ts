export type AuthorProfile = {
  name: string;
  role: string;
  bio: string;
  photo?: string;
  /** Aviso institucional específico do autor (ex.: registro profissional), quando aplicável. */
  disclaimer?: string;
};

/**
 * Estrutura de perfil por autor — pronta para receber bio, foto e qualificação reais.
 * Os valores abaixo são placeholders explícitos. Nunca preencher com credenciais,
 * registros profissionais (CRM/CRP) ou formação sem confirmação do cliente.
 */
const AUTHOR_PROFILES: Record<string, Omit<AuthorProfile, "name">> = {
  "Antonio Paulo Tavares Pereira": {
    role: "Autor e curador",
    bio: "Biografia a ser definida.",
  },
  "Gabriela Travaglia Pereira": {
    role: "Autora",
    bio: "Biografia a ser definida.",
  },
  "Vanessa Travaglia Pereira": {
    role: "Autora",
    bio: "Biografia a ser definida.",
  },
};

const FALLBACK_PROFILE: Omit<AuthorProfile, "name"> = {
  role: "Autor(a)",
  bio: "Biografia a ser definida.",
};

/** Retorna o perfil do autor pelo nome exato usado no artigo; nunca inventa dados. */
export function getAuthorProfile(name?: string | null): AuthorProfile | null {
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  const known = AUTHOR_PROFILES[trimmed];
  return { name: trimmed, ...(known || FALLBACK_PROFILE) };
}
