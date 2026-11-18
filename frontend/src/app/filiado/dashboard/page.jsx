"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

const FONTES = [
  ["Clientes e usuários", "/usuario"],
  ["Reservatórios", "/reservatorios"],
  ["Setores", "/setor"],
  ["Medidores", "/medidores"],
  ["Ocorrências", "/ocorrencias"],
  ["Leituras", "/leituras"],
  ["Reuniões", "/reunioes"],
];

export default function DashboardFiliado() {
  const [contagens, setContagens] = useState({});
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all(FONTES.map(async ([nome, rota]) => [nome, await apiRequest(rota)]))
      .then((resultados) => setContagens(Object.fromEntries(resultados.map(([nome, dados]) => [nome, Array.isArray(dados) ? dados.length : 0]))))
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", padding: 24 }}>
      <Link href="/filiado">← Voltar ao painel</Link>
      <h1 style={{ margin: "24px 0 8px" }}>Dashboard do Filiado</h1>
      <p>Resumo dos registros disponíveis na API.</p>
      {carregando && <p role="status" style={{ marginTop: 20 }}>Carregando indicadores…</p>}
      {erro && <p role="alert" style={{ marginTop: 20 }}>Não foi possível carregar os indicadores: {erro}</p>}
      {!carregando && !erro && <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24 }}>
        {FONTES.map(([nome]) => <article key={nome} style={{ padding: 20, borderRadius: 12, background: "#D6ECF3" }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>{nome}</h2>
          <strong style={{ fontSize: 32 }}>{contagens[nome] ?? 0}</strong>
        </article>)}
      </section>}
      <nav style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 28 }}>
        <Link href="/filiado/clientes">Meus clientes</Link>
        <Link href="/filiado/registrar_reuniao">Registrar reunião</Link>
        <Link href="/filiado/historico_reunioes">Histórico de reuniões</Link>
      </nav>
      <p style={{ marginTop: 24, color: "#3B4B5E" }}>A API ainda não aplica filtros por Filiado; os totais representam os dados disponíveis no sistema.</p>
    </main>
  );
}
