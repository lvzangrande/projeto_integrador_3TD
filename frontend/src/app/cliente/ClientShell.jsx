"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AffiliateHeader from "@/components/HeaderAfiliado/AffiliateHeader.jsx";
import { apiRequest } from "@/lib/api";
export default function ClientShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const mostrarHeader = pathname?.replace(/\/+$/, "") === "/cliente";
  useEffect(() => {
    let ativo = true;
    apiRequest("/auth/me")
      .then((dados) => {
        if (!ativo) return;
        if (dados.categoria !== "Cliente") {
          router.replace(dados.categoria === "Admin" ? "/admin" : "/filiado");
          return;
        }
        setUsuario(dados);
      })
      .catch(() => {
        if (ativo) router.replace("/#login");
      })
      .finally(() => {
        if (ativo) setVerificando(false);
      });
    return () => {
      ativo = false;
    };
  }, [router]);
  async function handleSair() {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      /* sair mesmo sem API */
    } finally {
      router.replace("/#login");
      router.refresh();
    }
  }
  if (verificando || !usuario)
    return (
      <div className="affiliate-shell">
        <div className="affiliate-content" role="status">
          Verificando sua sessão...
        </div>
      </div>
    );
  return (
    <div className="affiliate-shell cliente-shell">
      {mostrarHeader && (
        <AffiliateHeader nome={usuario.nome} onSair={handleSair} />
      )}
      <div className="affiliate-content">{children}</div>
    </div>
  );
}
