"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClienteHeader from "./ClienteHeader";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle.jsx";
import { apiRequest } from "@/lib/api";
import useAppTheme from "@/hooks/useAppTheme";

export default function ClienteShell({ children }) {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const { theme, toggleTheme } = useAppTheme();

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
      });
    return () => {
      ativo = false;
    };
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
    <div className={`cliente-shell ${theme === "Claro" ? "theme-light" : ""}`}>
      {usuario ? (
        <>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <ClienteHeader nome={usuario.nome} onSair={handleSair} />
          <div className="cliente-content">{children}</div>
        </>
      ) : (
        <div className="cliente-content" role="status">
          Verificando sua sessão...
        </div>
      )}
    </div>
  );
}
