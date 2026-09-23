export const siteConfig = {
  name: "SAÚDE INTEGRAL",
  shortName: "Saúde Integral",
  tagline: "Equilíbrio que transforma. Vida que floresce.",
  pillars: ["Espiritual", "Mental", "Corpo"] as const,
  description:
    "Portal premium de bem-estar integrado — espiritual, mental e corpo. Conteúdo sobre saúde mental, equilíbrio emocional, meditação, hábitos saudáveis e qualidade de vida.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.equilibriointegral.com.br",
  locale: "pt_BR",
  language: "pt-BR",
  author: "Antonio Paulo Tavares Pereira",
  authorRole: "Autor e curador",
  /** Preencha quando a foto oficial estiver disponível */
  authorPhoto: "/assets/brand/author-photo.jpg",
  /** Preencha a bio oficial — espaço reservado no site */
  authorBio:
    "Espaço reservado para a biografia do autor. Em breve, uma apresentação completa sobre a trajetória, a visão e o propósito por trás do SAÚDE INTEGRAL.",
  email: "contato@equilibriointegral.com.br",
  themeColor: "#0D4A4A",
  logo: "/assets/brand/logo-saude-integral.png",
  mission:
    "Levar inspiração, equilíbrio, conhecimento e qualidade de vida todos os dias, por meio de conteúdos cuidadosamente preparados para fortalecer mente, corpo e bem-estar espiritual.",
  vision:
    "Ser o portal de referência em saúde integral no Brasil — um espaço premium onde espiritual, mental e corpo se encontram para transformar vidas com clareza, profundidade e presença.",
  values: [
    {
      title: "Integridade",
      description: "Conteúdo honesto, revisado e alinhado ao que realmente promove equilíbrio.",
    },
    {
      title: "Presença",
      description: "Priorizamos profundidade e calma — nunca ruído, pressa ou superficialidade.",
    },
    {
      title: "Cuidado",
      description: "Cada texto, imagem e experiência é pensada para acolher e elevar o leitor.",
    },
    {
      title: "Transformação",
      description: "Buscamos mudanças reais no dia a dia: hábitos, mente e conexão interior.",
    },
  ],
  social: {
    instagram: "https://instagram.com/equilibriointegral",
    youtube: "https://youtube.com/@equilibriointegral",
    linkedin: "https://linkedin.com/company/equilibriointegral",
  },
  categories: [
    {
      name: "Saúde do Corpo",
      slug: "saude-do-corpo",
      description: "Hábitos físicos, movimento, nutrição, sono e vitalidade.",
    },
    {
      name: "Saúde da Mente",
      slug: "saude-da-mente",
      description: "Equilíbrio emocional, ansiedade, estresse e autoconhecimento.",
    },
    {
      name: "Saúde Espiritual",
      slug: "saude-espiritual",
      description: "Paz interior, presença, gratidão e conexão consciente.",
    },
  ],
} as const;

export const analyticsConfig = {
  ga4Id: process.env.NEXT_PUBLIC_GA4_ID || "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  searchConsoleVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
};

export const adminConfig = {
  username: process.env.ADMIN_USERNAME || "antonio.ptp2011@gmail.com",
  email: process.env.ADMIN_EMAIL || "antonio.ptp2011@gmail.com",
  /** Default password — change via ADMIN_PASSWORD_HASH or ADMIN_PASSWORD in production */
  password: process.env.ADMIN_PASSWORD || "#06V17@As",
  passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || "equilibrio-integral-cms-secret-change-me",
  sessionCookie: "ei_admin_session",
  sessionDays: 7,
};
