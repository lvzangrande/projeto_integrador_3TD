"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

const modulos = [
  {
    titulo: "Reservatórios e setores",
    descricao:
      "Visualize a estrutura hídrica da operação, capacidades e limites configurados.",
    detalhe: "Estrutura da operação",
    icone: (
      <>
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M7 20v-7h10v7M9 9h.01M15 9h.01" />
      </>
    ),
  },
  {
    titulo: "Leituras e medidores",
    descricao:
      "Acompanhe níveis e consumo registrados pelos medidores da operação.",
    detalhe: "Monitoramento hídrico",
    icone: (
      <>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </>
    ),
  },
  {
    titulo: "Ocorrências",
    descricao:
      "Consulte vazamentos, anomalias e o andamento das ações corretivas.",
    detalhe: "Acompanhamento operacional",
    icone: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4m0 3h.01" />
      </>
    ),
  },
  {
    titulo: "Central de alertas",
    descricao:
      "Veja alertas relacionados a níveis, consumo e anomalias detectadas.",
    detalhe: "Atenção e prevenção",
    icone: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </>
    ),
  },
  {
    titulo: "Painel de economia",
    descricao:
      "Acompanhe indicadores de consumo e economia de água e financeira.",
    detalhe: "Eficiência hídrica",
    icone: (
      <>
        <path d="M4 19V5m0 14h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </>
    ),
  },
  {
    titulo: "Relatórios",
    descricao: "Consulte relatórios de consumo e ocorrências da sua operação.",
    detalhe: "Dados para decisão",
    icone: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h7m-7 4h7" />
      </>
    ),
  },
];
export default function ClienteHome() {
  const [usuario, setUsuario] = useState(null);
  useEffect(() => {
    let ativo = true;
    apiRequest("/auth/me")
      .then((dados) => {
        if (ativo) setUsuario(dados);
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, []);
  const primeiroNome = usuario?.nome?.trim().split(/\s+/)[0];
  return (
    <main className="cliente-home">
      <header className="cliente-home__intro">
        <p className="cliente-home__eyebrow">PAINEL DO CLIENTE</p>
        <h1>{primeiroNome ? `Olá, ${primeiroNome}` : "Painel da operação"}</h1>
        <p>Acompanhe a gestão hídrica da sua operação em um só lugar.</p>
      </header>
      <section className="cliente-home__resumo" aria-label="Resumo do painel">
        <div className="cliente-home__resumo-icone" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z" />
            <path d="M9 16a3 3 0 0 0 3 2" />
          </svg>
        </div>
        <div>
          <strong>Controle hídrico</strong>
          <p>
            Use os módulos abaixo para consultar os dados e indicadores da sua
            operação.
          </p>
        </div>
        <span className="cliente-home__selo">
          <i aria-hidden="true" /> Área do cliente
        </span>
      </section>
      <section
        className="cliente-home__modulos"
        aria-label="Módulos previstos para a área do cliente"
      >
        {modulos.map((modulo) => (
          <article className="cliente-modulo" key={modulo.titulo}>
            <span className="cliente-modulo__icone" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {modulo.icone}
              </svg>
            </span>
            <span className="cliente-modulo__texto">
              <small>{modulo.detalhe}</small>
              <strong>{modulo.titulo}</strong>
              <span>{modulo.descricao}</span>
            </span>
            <span className="cliente-modulo__status">Em desenvolvimento</span>
          </article>
        ))}
      </section>
      <p className="cliente-home__nota">
        Os módulos seguem o escopo definido na documentação do Wapi; as telas
        operacionais ainda estão sendo implementadas.
      </p>
    </main>
  );
}
