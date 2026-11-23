"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { fmtData, fmtNumero, ocorrenciaAtiva, statusClasse } from "./client-portal";
import useClienteOperacao from "./useClienteOperacao";

export default function ClienteHome() {
  const { dados, carregando, erro, atualizar } = useClienteOperacao();
  const [nome, setNome] = useState("");
  useEffect(() => {
    let ativo = true;
    apiRequest("/auth/me").then((usuario) => { if (ativo) setNome(usuario.nome || ""); }).catch(() => {});
    return () => { ativo = false; };
  }, []);
  const resumo = useMemo(() => {
    if (!dados) return null;
    const ativas = dados.ocorrencias.filter(ocorrenciaAtiva);
    const ultimoNivel = [...dados.reservatorios].filter((r) => r.nivel_atual != null).sort((a, b) => new Date(b.nivel_atualizado_em) - new Date(a.nivel_atualizado_em))[0];
    const leituras = [...dados.leituras].sort((a, b) => new Date(b.momento_leitura) - new Date(a.momento_leitura));
    const medidorId = leituras[0]?.id_med;
    const serie = medidorId == null ? [] : leituras.filter((item) => item.id_med === medidorId).slice(0, 8).reverse();
    return { ativas, ultimoNivel, leituras, serie };
  }, [dados]);

  if (carregando && !dados) return <main className="cliente-home"><p className="cliente-state" role="status">Carregando os dados da sua operação…</p></main>;
  if (erro && !dados) return <main className="cliente-home"><div className="cliente-state cliente-state--erro" role="alert"><strong>Não foi possível abrir o painel</strong><p>{erro}</p><button className="cliente-button" onClick={atualizar}>Tentar novamente</button></div></main>;

  return (
    <main className="cliente-home">
      <header className="cliente-pagehead">
        <div><p className="cliente-eyebrow">WATERCONTROL · ÁREA DO CLIENTE</p><h1>{nome ? `Olá, ${nome}` : "Visão geral da operação"}</h1><p>Acompanhe os pontos de água, as leituras e as ocorrências da sua operação.</p></div>
        <button className="cliente-button cliente-button--quiet" onClick={atualizar} disabled={carregando} aria-label="Atualizar dados">{carregando ? "Atualizando…" : "↻ Atualizar"}</button>
      </header>
      {erro && <p className="cliente-inline-error" role="status">Atualização não concluída: {erro}</p>}
      <section className="cliente-kpis" aria-label="Resumo da operação">
        <article className="cliente-kpi"><span>Reservatórios</span><strong>{dados.reservatorios.length}</strong><small>Na sua operação</small></article>
        <article className="cliente-kpi"><span>Setores ativos</span><strong>{dados.setores.filter((item) => item.status === "Ativo").length}</strong><small>De {dados.setores.length} cadastrados</small></article>
        <article className="cliente-kpi"><span>Ocorrências em aberto</span><strong>{resumo.ativas.length}</strong><small>Não resolvidas ou descartadas</small></article>
        <article className="cliente-kpi"><span>Último nível registrado</span><strong>{resumo.ultimoNivel ? fmtNumero(resumo.ultimoNivel.nivel_atual, 2) : "—"}</strong><small>{resumo.ultimoNivel ? `${resumo.ultimoNivel.nome} · unidade do registro` : "Sem leitura de nível disponível"}</small></article>
      </section>

      <section className="cliente-grid cliente-grid--principal">
        <article className="cliente-panel cliente-panel--wide">
          <div className="cliente-panel__head"><div><p className="cliente-eyebrow">ACOMPANHAMENTO</p><h2>Leituras recentes</h2><p>Histórico do medidor mais recente. Os valores seguem a unidade gravada pelo sistema.</p></div><Link href="/cliente/leituras" className="cliente-link">Ver histórico <span aria-hidden="true">→</span></Link></div>
          {resumo.serie.length ? <GraficoLeituras serie={resumo.serie} /> : <Empty>Não há leituras registradas para exibir um gráfico.</Empty>}
          {resumo.serie.length > 0 && <div className="cliente-chart-meta"><span>{resumo.serie[0].num_serie} · {resumo.serie[0].tipo_medidor}</span><span>{resumo.serie.length} registros mais recentes</span></div>}
        </article>
        <article className="cliente-panel">
          <div className="cliente-panel__head"><div><p className="cliente-eyebrow">ATENÇÃO</p><h2>Ocorrências abertas</h2></div><Link href="/cliente/ocorrencias" className="cliente-link">Ver todas →</Link></div>
          {resumo.ativas.length ? <ul className="cliente-lista-curta">{resumo.ativas.slice(0, 4).map((item) => <li key={item.id_oc}><span className={`cliente-status cliente-status--${statusClasse(item.severidade)}`}><i aria-hidden="true" />{item.severidade}</span><strong>{item.tipo}</strong><small>{item.reservatorio_nome}{item.setor_nome ? ` · ${item.setor_nome}` : ""}</small><time dateTime={item.momento_abertura}>{fmtData(item.momento_abertura)}</time></li>)}</ul> : <Empty>Sem ocorrências em aberto neste momento.</Empty>}
        </article>
      </section>

      <section className="cliente-panel cliente-panel--economia" aria-labelledby="cliente-economia-title">
        <div className="cliente-economia__icone" aria-hidden="true">≈</div><div><p className="cliente-eyebrow">EFICIÊNCIA HÍDRICA</p><h2 id="cliente-economia-title">Economia de água e financeira</h2><p>A documentação exige consumo de referência e tarifa vigente para calcular economia. Esses dados ainda não existem no banco/API do projeto; por isso, nenhum valor estimado é exibido.</p></div><Link href="/cliente/relatorios" className="cliente-link">Consultar relatórios →</Link>
      </section>
      <section className="cliente-quicklinks" aria-label="Acesso rápido">
        <Link href="/cliente/reservatorios"><span aria-hidden="true">◉</span><strong>Estrutura hídrica</strong><small>Reservatórios, setores e medidores</small></Link>
        <Link href="/cliente/leituras"><span aria-hidden="true">⌁</span><strong>Histórico de leituras</strong><small>Pesquisar e filtrar registros</small></Link>
        <Link href="/cliente/relatorios"><span aria-hidden="true">▤</span><strong>Relatórios</strong><small>Exportar dados da operação</small></Link>
      </section>
    </main>
  );
}

function GraficoLeituras({ serie }) {
  const valores = serie.map((item) => Number(item.volume_leitura)).filter(Number.isFinite);
  if (!valores.length) return <Empty>Os registros do medidor não contêm valores numéricos.</Empty>;
  const minimo = Math.min(...valores); const maximo = Math.max(...valores); const faixa = maximo - minimo || Math.max(Math.abs(maximo) * .08, 1);
  const pontos = valores.map((valor, indice) => ({ x: 24 + indice * (552 / Math.max(valores.length - 1, 1)), y: 164 - ((valor - minimo) / faixa) * 126, valor }));
  const linha = pontos.map((p, indice) => `${indice ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return <div className="cliente-chart" role="img" aria-label={`Gráfico de ${serie.length} leituras do medidor ${serie[0].num_serie}`}><svg viewBox="0 0 600 190" preserveAspectRatio="none" aria-hidden="true"><path className="cliente-chart__grid" d="M24 38H576M24 101H576M24 164H576"/><path className="cliente-chart__area" d={`${linha} L ${pontos.at(-1).x} 164 L ${pontos[0].x} 164 Z`}/><path className="cliente-chart__line" d={linha}/>{pontos.map((p, i) => <circle key={`${i}-${p.valor}`} cx={p.x} cy={p.y} r="4"><title>{fmtNumero(p.valor, 3)}</title></circle>)}</svg><div className="cliente-chart__labels"><span>{fmtData(serie[0].momento_leitura, false)}</span><span>{fmtData(serie.at(-1).momento_leitura, false)}</span></div></div>;
}
function Empty({ children }) { return <p className="cliente-empty">{children}</p>; }
