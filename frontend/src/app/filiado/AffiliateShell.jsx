"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AffiliateHeader from "@/components/HeaderAfiliado/AffiliateHeader.jsx";
import { apiRequest } from "@/lib/api";

export default function AffiliateShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const mostrarHeader = pathname?.replace(/\/+$/, "") === "/filiado";

  useEffect(() => {
    let ativo = true;
    apiRequest("/auth/me")
      .then((dados) => {
        if (!ativo) return;
        if (dados.categoria !== "Filiado") {
          router.replace(dados.categoria === "Admin" ? "/admin" : "/#login");
          return;
        }
        setUsuario(dados);
      })
      .catch(() => { if (ativo) router.replace("/#login"); })
      .finally(() => { if (ativo) setVerificando(false); });
    return () => { ativo = false; };
  }, [router]);

  async function handleSair() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Redireciona mesmo se a API estiver indisponível.
    } finally {
      router.replace("/#login");
      router.refresh();
    }
  }

  return (
    <div className="affiliate-shell">
      {verificando || !usuario ? (
        <div className="affiliate-content" role="status">Verificando sua sessão...</div>
      ) : <>
        {mostrarHeader && <AffiliateHeader nome={usuario.nome} onSair={handleSair} />}
        <div className="affiliate-content">{children}</div>
      </>}
    </div>
  );
}
