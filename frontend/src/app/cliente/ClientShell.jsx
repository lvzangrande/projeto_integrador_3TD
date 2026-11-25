"use client";
import { createContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AffiliateHeader from "@/components/HeaderAfiliado/AffiliateHeader.jsx";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle.jsx";
import OceanBackground from "@/app/admin/OceanBackground.jsx";
import { apiRequest } from "@/lib/api";
import useAppTheme from "@/hooks/useAppTheme";

export const ClienteThemeContext = createContext("Escuro");

export default function ClientShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const { theme, toggleTheme } = useAppTheme();
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
  return (
    <ClienteThemeContext.Provider value={theme}>
      <div className={`affiliate-shell cliente-shell ${theme === "Claro" ? "theme-light" : ""}`}>
        <OceanBackground theme={theme} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        {verificando || !usuario ? (
          <div className="affiliate-content" role="status">Verificando sua sessão...</div>
        ) : <>
          {mostrarHeader && <AffiliateHeader nome={usuario.nome} onSair={handleSair} />}
          <div className="affiliate-content">{children}</div>
        </>}
      </div>
    </ClienteThemeContext.Provider>
  );
}
