"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AffiliateHeader from "@/components/HeaderAfiliado/AffiliateHeader.jsx";
import { apiRequest } from "@/lib/api";
export default function ClientShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [tema, setTema] = useState("escuro");
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
  useEffect(() => {
    let temporizador;
    try {
      const salvo = window.localStorage.getItem("watercontrol-tema-cliente");
      if (["claro", "escuro", "daltonico"].includes(salvo)) {
        temporizador = window.setTimeout(() => setTema(salvo), 0);
      }
    } catch { /* Preferência indisponível neste navegador. */ }
    return () => window.clearTimeout(temporizador);
  }, []);
  function alterarTema(evento) {
    const proximo = evento.target.value;
    setTema(proximo);
    try { window.localStorage.setItem("watercontrol-tema-cliente", proximo); } catch { /* Tema continua ativo até a próxima navegação. */ }
  }
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
    <div className="affiliate-shell cliente-shell" data-theme={tema}>
      <AffiliateHeader nome={usuario.nome} onSair={handleSair} />
      <nav className="cliente-nav" aria-label="Navegação do portal do cliente">
        <Link href="/cliente" aria-current={pathname === "/cliente" ? "page" : undefined}>Visão geral</Link>
        <Link href="/cliente/reservatorios" aria-current={pathname?.startsWith("/cliente/reservatorios") ? "page" : undefined}>Estrutura hídrica</Link>
        <Link href="/cliente/leituras" aria-current={pathname?.startsWith("/cliente/leituras") ? "page" : undefined}>Leituras</Link>
        <Link href="/cliente/ocorrencias" aria-current={pathname?.startsWith("/cliente/ocorrencias") ? "page" : undefined}>Ocorrências</Link>
        <Link href="/cliente/relatorios" aria-current={pathname?.startsWith("/cliente/relatorios") ? "page" : undefined}>Relatórios</Link>
        <label className="cliente-nav__tema">Tema local
          <select value={tema} onChange={alterarTema} aria-label="Tema visual">
            <option value="escuro">Escuro</option><option value="claro">Claro</option><option value="daltonico">Daltônico</option>
          </select>
        </label>
      </nav>
      <div className="affiliate-content">{children}</div>
    </div>
  );
}
