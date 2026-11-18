"use client";

import { usePathname } from "next/navigation";
import AffiliateHeader from "@/components/HeaderAfiliado/AffiliateHeader.jsx";

export default function AffiliateShell({ children, nomeAfiliado }) {
  const pathname = usePathname();
  const mostrarHeader = pathname?.replace(/\/+$/, "") === "/filiado";

  function handleSair() {
    // TODO: ligar ao logout real do projeto (limpar sessão/token e redirecionar).
  }

  return (
    <div className="affiliate-shell">
      {mostrarHeader && <AffiliateHeader nome={nomeAfiliado} onSair={handleSair} />}
      <div className="affiliate-content">{children}</div>
    </div>
  );
}
