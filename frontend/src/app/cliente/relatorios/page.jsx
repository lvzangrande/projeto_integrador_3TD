"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { ClientePage, formatarData, formatarNumero } from "../_components/ClientePage";

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function RelatoriosCliente() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [relatorio, setRelatorio] = useState(null);

  async function gerar(event) {
    event.preventDefault();
    setErro("");
    if (inicio && fim && inicio > fim) {
      setErro("A data inicial deve ser anterior ou igual à data final.");
      return;
    }
    setCarregando(true);
    const query = new URLSearchParams();
    if (inicio) query.set("inicio", inicio);
    if (fim) query.set("fim", fim);
    const sufixo = query.toString() ? `?${query.toString()}` : "";
    try {
      const [leituras, ocorrencias] = await Promise.all([
        apiRequest(`/cliente/portal/leituras${sufixo}`),
        apiRequest(`/cliente/portal/ocorrencias`),
      ]);
      setRelatorio({ leituras, ocorrencias });
    } catch (errorApi) {
      setErro(errorApi.message || "Não foi possível gerar o relatório.");
      setRelatorio(null);
    } finally {
      setCarregando(false);
    }
  }

  function baixarCsv() {
    if (!relatorio) return;
    const linhas = [
      ["Tipo", "Data e hora", "Reservatório", "Setor", "Identificação", "Detalhe", "Valor", "Status/Origem"],
      ...relatorio.leituras.map((item) => ["Leitura", formatarData(item.momento_leitura), item.reservatorio, item.setor, item.medidor, item.tipo_medidor, item.volume_leitura, item.origem]),
      ...relatorio.ocorrencias.map((item) => ["Ocorrência", formatarData(item.momento_abertura), item.reservatorio, item.setor, item.tipo, item.severidade, item.volume_perdido, item.status]),
    ];
    const conteudo = `\uFEFF${linhas.map((linha) => linha.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-cliente${inicio ? `-${inicio}` : ""}${fim ? `-a-${fim}` : ""}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ClientePage title="Relatórios" description="Gere uma consulta de leituras e ocorrências da sua operação e exporte o resultado em CSV.">
      <form className="cliente-filtros" onSubmit={gerar}>
        <label>Leituras de<input type="date" value={inicio} onChange={(event) => setInicio(event.target.value)} /></label>
        <label>Até<input type="date" value={fim} onChange={(event) => setFim(event.target.value)} /></label>
        <div className="cliente-filtros__acoes"><button className="cliente-botao" type="submit" disabled={carregando}>{carregando ? "Gerando…" : "Gerar relatório"}</button></div>
      </form>
      {erro && <p className="cliente-inline-erro" role="alert">{erro}</p>}
      {relatorio && <section className="cliente-card cliente-relatorio">
        <div className="cliente-card__topo"><div><p className="cliente-card__eyebrow">RESULTADO DA CONSULTA</p><h2>Relatório da operação</h2></div><button className="cliente-botao" type="button" onClick={baixarCsv}>Baixar CSV</button></div>
        <div className="cliente-relatorio__resumo"><p><strong>{relatorio.leituras.length}</strong> leituras no período filtrado</p><p><strong>{relatorio.ocorrencias.length}</strong> ocorrências cadastradas</p></div>
        <p className="cliente-muted">O período filtra as leituras. As ocorrências são listadas conforme seus registros, pois o esquema não associa data de encerramento para filtrar histórico por período.</p>
        <div className="cliente-relatorio__amostras">
          <h3>Leituras mais recentes</h3>
          {relatorio.leituras.length ? <ul>{relatorio.leituras.slice(0, 5).map((item) => <li key={item.id_leitura}>{formatarData(item.momento_leitura)} · {item.reservatorio} / {item.setor} · {formatarNumero(item.volume_leitura)} ({item.origem})</li>)}</ul> : <p className="cliente-muted">Sem leituras para o filtro.</p>}
          <h3>Ocorrências mais recentes</h3>
          {relatorio.ocorrencias.length ? <ul>{relatorio.ocorrencias.slice(0, 5).map((item) => <li key={item.id_oc}>{formatarData(item.momento_abertura)} · {item.reservatorio} · {item.tipo} · {item.status}</li>)}</ul> : <p className="cliente-muted">Sem ocorrências cadastradas.</p>}
        </div>
      </section>}
    </ClientePage>
  );
}
