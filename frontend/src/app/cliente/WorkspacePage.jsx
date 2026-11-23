"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import useClienteOperacao from "./useClienteOperacao";
import { baixarTxt, fmtData, fmtNumero, ocorrenciaAtiva, pesquisar, statusClasse } from "./client-portal";

const ROTULOS = {
  reservatorios: { titulo: "Estrutura hídrica", apoio: "Consulte os reservatórios, setores e medidores associados à sua operação." },
  leituras: { titulo: "Histórico de leituras", apoio: "Pesquise e filtre os valores registrados pelos medidores da sua operação." },
  ocorrencias: { titulo: "Ocorrências e acompanhamento", apoio: "Acompanhe vazamentos e anomalias reportados na sua operação." },
  relatorios: { titulo: "Relatórios da operação", apoio: "Exporte os registros disponíveis em texto simples para análise local." },
};

export default function WorkspacePage({ secao }) {
  const { dados, carregando, erro, atualizar } = useClienteOperacao();
  const rotulo = ROTULOS[secao];
  const [busca, setBusca] = useState("");
  const [reservatorio, setReservatorio] = useState("");
  const [setor, setSetor] = useState("");
  const [medidor, setMedidor] = useState("");
  const [status, setStatus] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const filtradas = useMemo(() => {
    if (!dados) return [];
    if (secao === "leituras") {
      return dados.leituras.filter((item) => (!reservatorio || String(item.id_reservatorio) === reservatorio) && (!setor || String(item.id_setor) === setor) && (!medidor || String(item.id_med) === medidor) && (!inicio || String(item.momento_leitura).slice(0, 10) >= inicio) && (!fim || String(item.momento_leitura).slice(0, 10) <= fim)).filter((item) => pesquisar([item], ["num_serie", "tipo_medidor", "origem", "setor_nome", "reservatorio_nome", "volume_leitura"], busca).length > 0);
    }
    if (secao === "ocorrencias") return dados.ocorrencias.filter((item) => (!status || (status === "aberta" ? ocorrenciaAtiva(item) : !ocorrenciaAtiva(item)))).filter((item) => pesquisar([item], ["tipo", "severidade", "status", "descricao", "reservatorio_nome", "setor_nome"], busca).length > 0);
    return [];
  }, [dados, secao, reservatorio, setor, medidor, inicio, fim, status, busca]);
  if (carregando && !dados) return <main className="cliente-home"><p className="cliente-state" role="status">Carregando dados da operação…</p></main>;
  if (!dados) return <main className="cliente-home"><div className="cliente-state cliente-state--erro" role="alert"><strong>Não foi possível carregar esta página</strong><p>{erro || "O serviço não retornou dados."}</p><button className="cliente-button" onClick={atualizar}>Tentar novamente</button></div></main>;

  return <main className="cliente-home">
    <header className="cliente-pagehead"><div><p className="cliente-eyebrow">PORTAL DO CLIENTE</p><h1>{rotulo.titulo}</h1><p>{rotulo.apoio}</p></div><button className="cliente-button cliente-button--quiet" onClick={atualizar} disabled={carregando}>↻ Atualizar</button></header>
    {erro && <p className="cliente-inline-error" role="status">Não foi possível atualizar: {erro}</p>}
    {secao === "reservatorios" && <Estrutura dados={dados} busca={busca} setBusca={setBusca} />}
    {secao === "leituras" && <><FiltrosLeituras {...{ busca, setBusca, dados, reservatorio, setReservatorio, setor, setSetor, medidor, setMedidor, inicio, setInicio, fim, setFim }} /><div className="cliente-panel"><div className="cliente-panel__head"><div><h2>Leituras registradas</h2><p>{filtradas.length} resultado(s) · valores e unidade conforme registro de origem</p></div></div><TabelaLeituras leituras={filtradas} /></div></>}
    {secao === "ocorrencias" && <><div className="cliente-filtros"><label className="cliente-search">Pesquisar<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Tipo, local, descrição…" /></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option><option value="aberta">Em acompanhamento</option><option value="fechada">Resolvidas/descartadas</option></select></label></div><div className="cliente-panel"><div className="cliente-panel__head"><div><h2>Registros de ocorrência</h2><p>{filtradas.length} resultado(s). Alertas são exibidos apenas quando representados por uma ocorrência registrada.</p></div></div><ListaOcorrencias itens={filtradas} /></div></>}
    {secao === "relatorios" && <Relatorios dados={dados} />}
  </main>;
}
function Estrutura({ dados, busca, setBusca }) {
  const reservatorios = pesquisar(dados.reservatorios, ["nome", "tipo", "localizacao", "status"], busca);
  return <><div className="cliente-filtros"><label className="cliente-search">Pesquisar estrutura<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome, tipo ou localização…" /></label><span className="cliente-count">{reservatorios.length} reservatório(s)</span></div>{reservatorios.length ? <div className="cliente-estrutura">{reservatorios.map((r) => { const setores = dados.setores.filter((s) => s.id_reservatorio === r.id_reservatorio); const medidores = dados.medidores.filter((m) => m.id_reservatorio === r.id_reservatorio); return <article className="cliente-panel cliente-tanque" key={r.id_reservatorio}><div className="cliente-tanque__head"><span className="cliente-tanque__icon" aria-hidden="true">◉</span><div><p className="cliente-eyebrow">{r.tipo}</p><h2>{r.nome}</h2><p>{r.localizacao || "Localização não informada"}</p></div><span className={`cliente-status cliente-status--${statusClasse(r.status)}`}><i aria-hidden="true" />{r.status}</span></div><div className="cliente-tanque__facts"><span><small>Capacidade</small><strong>{fmtNumero(r.capacidade, 0)}</strong><small>Unidade não definida no esquema</small></span><span><small>Limites registrados</small><strong>{fmtNumero(r.nivel_min, 1)} – {fmtNumero(r.nivel_max, 1)}</strong></span><span><small>Nível mais recente</small><strong>{r.nivel_atual == null ? "Sem leitura" : `${fmtNumero(r.nivel_atual, 2)} · unidade do registro`}</strong><small>{r.nivel_atualizado_em ? fmtData(r.nivel_atualizado_em) : ""}</small></span><span><small>Responsáveis vinculados</small><strong>{dados.responsaveis.find((item) => item.id_reservatorio === r.id_reservatorio)?.total || 0} cadastro(s)</strong><small>Nomes não previstos no esquema atual</small></span></div><div className="cliente-tanque__relacoes"><div><h3>Setores <span>{setores.length}</span></h3>{setores.length ? <ul>{setores.map((s) => <li key={s.id_setor}><span>{s.nome}</span><small>{s.tipo} · limite diário {fmtNumero(s.consumo_max_dia, 2)} conforme cadastro</small></li>)}</ul> : <p className="cliente-muted">Nenhum setor vinculado.</p>}</div><div><h3>Medidores <span>{medidores.length}</span></h3>{medidores.length ? <ul>{medidores.map((m) => <li key={m.id_med}><span>{m.num_serie} <small>{m.tipo}</small></span><small>{m.setor_nome} · origem {m.origem}</small></li>)}</ul> : <p className="cliente-muted">Nenhum medidor vinculado.</p>}</div></div></article>; })}</div> : <Vazio>Não há reservatórios para esta pesquisa.</Vazio>}<p className="cliente-note">Modo de consulta: cadastros e limites são gerenciados pelo responsável autorizado, não pelo perfil Cliente.</p></>;
}
function FiltrosLeituras(props) {
  const { busca, setBusca, dados, reservatorio, setReservatorio, setor, setSetor, medidor, setMedidor, inicio, setInicio, fim, setFim } = props;
  const setores = dados.setores.filter((s) => !reservatorio || String(s.id_reservatorio) === reservatorio);
  const medidores = dados.medidores.filter((m) => (!reservatorio || String(m.id_reservatorio) === reservatorio) && (!setor || String(m.id_setor) === setor));
  return <div className="cliente-filtros cliente-filtros--leituras"><label className="cliente-search">Pesquisar<input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Série, origem, local ou valor…" /></label><label>Reservatório<select value={reservatorio} onChange={(e) => { setReservatorio(e.target.value); setSetor(""); setMedidor(""); }}><option value="">Todos</option>{dados.reservatorios.map((r) => <option value={r.id_reservatorio} key={r.id_reservatorio}>{r.nome}</option>)}</select></label><label>Setor<select value={setor} onChange={(e) => { setSetor(e.target.value); setMedidor(""); }}><option value="">Todos</option>{setores.map((s) => <option value={s.id_setor} key={s.id_setor}>{s.nome}</option>)}</select></label><label>Medidor<select value={medidor} onChange={(e) => setMedidor(e.target.value)}><option value="">Todos</option>{medidores.map((m) => <option value={m.id_med} key={m.id_med}>{m.num_serie} · {m.tipo}</option>)}</select></label><label>De<input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label><label>Até<input type="date" value={fim} onChange={(e) => setFim(e.target.value)} /></label></div>;
}
function TabelaLeituras({ leituras }) {
  if (!leituras.length) return <Vazio>Nenhuma leitura corresponde aos filtros.</Vazio>;
  return <div className="cliente-table-wrap"><table className="cliente-table"><thead><tr><th>Data e hora</th><th>Medidor</th><th>Tipo</th><th>Reservatório / setor</th><th>Valor</th><th>Origem</th></tr></thead><tbody>{leituras.map((l) => <tr key={l.id_leitura}><td>{fmtData(l.momento_leitura)}</td><td>{l.num_serie}</td><td>{l.tipo_medidor}</td><td>{l.reservatorio_nome} · {l.setor_nome}</td><td>{fmtNumero(l.volume_leitura, 3)} <small>unidade do registro</small></td><td>{l.origem}</td></tr>)}</tbody></table></div>;
}
function ListaOcorrencias({ itens }) {
  if (!itens.length) return <Vazio>Nenhuma ocorrência corresponde à pesquisa.</Vazio>;
  return <div className="cliente-occ-list">{itens.map((o) => <article className="cliente-occ" key={o.id_oc}><div><span className={`cliente-status cliente-status--${statusClasse(o.severidade)}`}><i aria-hidden="true" />{o.severidade}</span><h3>{o.tipo}</h3><p>{o.descricao}</p><small>{o.reservatorio_nome}{o.setor_nome ? ` · ${o.setor_nome}` : ""} · Registrada em {fmtData(o.momento_abertura)}</small></div><span className={`cliente-occ__status cliente-status--${statusClasse(o.status)}`}>{o.status}</span></article>)}</div>;
}
function Relatorios({ dados }) {
  const leituras = dados.leituras;
  const ocorrencias = dados.ocorrencias;
  const exportarLeituras = () => baixarTxt("watercontrol-leituras.txt", ["WATERCONTROL — RELATÓRIO DE LEITURAS", `Gerado em ${fmtData(new Date())}`, "Valores mantidos exatamente como registrados; a API não fornece unidade padronizada.", "", ...leituras.map((l) => `${fmtData(l.momento_leitura)} | ${l.reservatorio_nome} | ${l.setor_nome} | ${l.num_serie} (${l.tipo_medidor}) | ${fmtNumero(l.volume_leitura, 3)} | ${l.origem}`)]);
  const exportarOcorrencias = () => baixarTxt("watercontrol-ocorrencias.txt", ["WATERCONTROL — RELATÓRIO DE OCORRÊNCIAS", `Gerado em ${fmtData(new Date())}`, "", ...ocorrencias.map((o) => `${fmtData(o.momento_abertura)} | ${o.tipo} | ${o.severidade} | ${o.status} | ${o.reservatorio_nome}${o.setor_nome ? ` / ${o.setor_nome}` : ""} | ${String(o.descricao || "").replace(/\s+/g, " ")}`)]);
  return <><div className="cliente-report-grid"><article className="cliente-panel cliente-report"><span aria-hidden="true">⌁</span><p className="cliente-eyebrow">DADOS HISTÓRICOS</p><h2>Consumo e leituras</h2><p>Exporta {leituras.length} leitura(s) da sua operação em arquivo TXT. O arquivo informa valor, medidor, localização, data e origem.</p><button className="cliente-button" onClick={exportarLeituras} disabled={!leituras.length}>Baixar TXT de leituras</button></article><article className="cliente-panel cliente-report"><span aria-hidden="true">△</span><p className="cliente-eyebrow">ACOMPANHAMENTO</p><h2>Ocorrências</h2><p>Exporta {ocorrencias.length} ocorrência(s), com tipo, severidade, status, local, data e descrição.</p><button className="cliente-button" onClick={exportarOcorrencias} disabled={!ocorrencias.length}>Baixar TXT de ocorrências</button></article></div><article className="cliente-panel cliente-economia"><div><p className="cliente-eyebrow">INDICADOR NÃO CALCULADO</p><h2>Economia de água e financeira</h2><p>O documento exige consumo de referência (baseline) e tarifa em R$/m³. O esquema/API atuais não armazenam esses dados; apresentar uma economia agora seria inventar um resultado. O indicador pode ser ativado quando esses dados forem implementados.</p></div></article><p className="cliente-note">Os arquivos são gerados localmente no seu navegador e contêm somente os dados retornados para sua sessão.</p></>;
}
function Vazio({ children }) { return <p className="cliente-empty">{children}</p>; }
