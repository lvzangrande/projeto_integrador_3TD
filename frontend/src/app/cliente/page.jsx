"use client";

import Link from "next/link";
import { ClienteStatus, formatarData, useClientePortal } from "./_components/ClientePage";

const modulos = [
  {
    href: "/cliente/estrutura",
    titulo: "Reservatórios e setores",
    descricao: "Consulte a estrutura hídrica vinculada à sua conta.",
    detalhe: "Estrutura da operação",
    icon: <><path d="M4 20V8l8-4 8 4v12" /><path d="M7 20v-7h10v7M9 9h.01M15 9h.01" /></>,
  },
  {
    href: "/cliente/leituras",
    titulo: "Leituras e medidores",
    descricao: "Acompanhe as leituras registradas pelos medidores.",
    detalhe: "Monitoramento hídrico",
    icon: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  },
  {
    href: "/cliente/ocorrencias",
    titulo: "Ocorrências",
    descricao: "Consulte ocorrências e o andamento informado pela operação.",
    detalhe: "Acompanhamento operacional",
    icon: <><path d="M12 3 2.8 20h18.4L12 3Z" /><path d="M12 9v4m0 3h.01" /></>,
  },
  {
    href: "/cliente/alertas",
    titulo: "Central de alertas",
    descricao: "Entenda a disponibilidade dos alertas e veja as ocorrências.",
    detalhe: "Atenção e prevenção",
    icon: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  },
  {
    href: "/cliente/economia",
    titulo: "Painel de economia",
    descricao: "Consulte quais dados são necessários para calcular economia.",
    detalhe: "Eficiência hídrica",
    icon: <><path d="M4 19V5m0 14h16" /><path d="m7 15 4-4 3 2 5-6" /></>,
  },
  {
    href: "/cliente/relatorios",
    titulo: "Relatórios",
    descricao: "Filtre leituras e ocorrências e exporte um arquivo CSV.",
    detalhe: "Dados para decisão",
    icon: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7m-7 4h7" /></>,
  },
];

function Icone({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function ClienteHome() {
  const { data, loading, error } = useClientePortal("/cliente/portal/resumo");
  return (
    <main className="cliente-home">
      <header className="cliente-home__intro">
        <p className="cliente-home__eyebrow">PAINEL DO CLIENTE</p>
        <h1>Painel da operação</h1>
        <p>Acompanhe a gestão hídrica da sua operação em um só lugar.</p>
      </header>

      <details className="cliente-home__resumo">
        <summary>
          <span className="cliente-home__resumo-icone" aria-hidden="true">
            <Icone><path d="M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z" /><path d="M9 16a3 3 0 0 0 3 2" /></Icone>
          </span>
          <span className="cliente-home__resumo-texto">
            <strong>Controle hídrico</strong>
            <span>Os dados exibidos pertencem à conta autenticada e são apresentados para consulta.</span>
          </span>
          <span className="cliente-home__abrir"><span className="cliente-home__seta" aria-hidden="true">⌄</span></span>
        </summary>

        <section className="cliente-home__conteudo">
        <section className="cliente-home__indicadores" aria-label="Indicadores da operação">
        <ClienteStatus loading={loading} error={error}>
          {data && <>
            <article className="cliente-indicador"><span>Reservatórios ativos</span><strong>{data.reservatorios?.ativos ?? 0}</strong><small>de {data.reservatorios?.total ?? 0} cadastrados</small></article>
            <article className="cliente-indicador"><span>Setores</span><strong>{data.setores ?? 0}</strong><small>na estrutura da operação</small></article>
            <article className="cliente-indicador"><span>Medidores</span><strong>{data.medidores ?? 0}</strong><small>vinculados aos setores</small></article>
            <article className="cliente-indicador"><span>Ocorrências em andamento</span><strong>{data.ocorrencias?.em_andamento ?? 0}</strong><small>de {data.ocorrencias?.total ?? 0} registradas</small></article>
            <article className="cliente-indicador cliente-indicador--wide"><span>Última leitura registrada</span><strong className="cliente-indicador__data">{formatarData(data.ultima_leitura)}</strong></article>
          </>}
        </ClienteStatus>
        </section>
        </section>

      </details>

      <section className="cliente-leitura-acoes" aria-label="Registrar leituras manuais">
        <div>
          <p className="cliente-home__eyebrow">ENTRADA MANUAL</p>
          <h2>Registrar leitura</h2>
          <p>Escolha o tipo de medição para abrir o formulário correspondente.</p>
        </div>
        <div className="cliente-leitura-acoes__botoes">
          <Link className="cliente-botao" href="/cliente/leituras#registrar-nivel">Registrar nível</Link>
          <Link className="cliente-botao cliente-botao--secundario" href="/cliente/leituras#registrar-consumo">Registrar consumo</Link>
        </div>
      </section>

      <section className="cliente-home__modulos" aria-label="Páginas do portal do cliente">
        {modulos.map((modulo) => (
          <Link className="cliente-modulo" href={modulo.href} key={modulo.href}>
            <span className="cliente-modulo__icone"><Icone>{modulo.icon}</Icone></span>
            <span className="cliente-modulo__texto">
              <small>{modulo.detalhe}</small>
              <strong>{modulo.titulo}</strong>
              <span>{modulo.descricao}</span>
            </span>
            <span className="cliente-modulo__seta" aria-hidden="true">↗</span>
          </Link>
        ))}
      </section>
      <p className="cliente-home__nota">Consulte os dados da sua operação e registre leituras manuais em Leituras e medidores.</p>
    </main>
  );
}
