import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        // Artigo duplicado (conteúdo idêntico, reimportado por engano) — consolida no original.
        source: "/artigos/o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital-2",
        destination: "/artigos/o-templo-fisico-como-a-postura-diaria-afeta-sua-energia-vital",
        permanent: true,
      },
      {
        // URL antiga de termos (já não existe): consolida em /termos.
        source: "/aviso-legal",
        destination: "/termos",
        permanent: true,
      },
      {
        // Páginas de autor antigas: a biografia da equipe fica em /sobre.
        source: "/autor/:slug",
        destination: "/sobre",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
