import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    // O navegador usa o mesmo domínio do frontend. O Next encaminha a API
    // pela rede interna do Docker, sem expor localhost/porta do backend.
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NODE_ENV === "development" ? "http://localhost:8080" : "http://backend:8080"}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
