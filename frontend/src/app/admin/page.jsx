"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { apiRequest } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle.jsx";
import useAppTheme from "@/hooks/useAppTheme";
import "./admin.css";
import OceanBackground from "./OceanBackground";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const sections = [
  { id: "visao", label: "Visão global" },
  { id: "usuarios", label: "Usuários" },
  { id: "reservatorios", label: "Reservatórios" },
  { id: "setores", label: "Setores" },
  { id: "medidores", label: "Medidores" },
  { id: "responsaveis", label: "Responsáveis" },
  { id: "leituras", label: "Leituras" },
  { id: "ocorrencias", label: "Ocorrências" },
  { id: "acessos", label: "Histórico de acesso" },
  { id: "reunioes", label: "Reuniões" },
  { id: "relatorios", label: "Relatórios" },
];

const titles = Object.fromEntries(sections.map(({ id, label }) => [id, [label, "Gestão administrativa WaterControl."]]));
const emptyData = {
  usuarios: [], reservatorios: [], setores: [], medidores: [], responsaveis: [], leituras: [],
  ocorrencias: [], acessos: [], reunioes: [], tarifa: null,
};

const configs = {
  usuarios: { title: "Gestão de usuários", intro: "Cadastre contas, ajuste perfis e inative acessos preservando o histórico.", fields: [
    ["nome", "Nome / razão social", "text", true], ["email", "E-mail", "email", true], ["documento", "CPF/CNPJ", "text", true],
    ["telefone", "Telefone", "text"], ["categoria", "Perfil", "select", true, ["Admin", "Filiado", "Cliente"]],
    ["id_filiado", "Filiado responsável", "select", false, "filiados"], ["tema", "Tema", "select", true, ["Claro", "Escuro"]],
    ["status", "Status", "select", true, ["Ativo", "Inativo"]], ["senha", "Senha inicial", "password"],
  ], columns: [["nome", "Nome"], ["email", "E-mail"], ["categoria", "Perfil"], ["status", "Status"]] },
  reservatorios: { title: "Reservatórios", intro: "Capacidade e limites são armazenados em litros. O nível atual vem da última leitura de nível.", fields: [
    ["nome", "Nome", "text", true], ["id_usuario", "Conta responsável", "select", true, "contas"],
    ["tipo", "Tipo", "select", true, ["Torre de resfriamento", "Tanque de processo", "Decantador", "Reservatório de água bruta", "Reservatório de agua tratada", "Cisterna", "Tanque elevado", "Outro"]],
    ["capacidade", "Capacidade (L)", "number", true], ["localizacao", "Localização", "text", true],
    ["nivel_min", "Nível mínimo (L)", "number", true], ["nivel_max", "Nível máximo (L)", "number", true], ["status", "Status", "select", true, ["Ativo", "Inativo"]],
  ], columns: [["nome", "Reservatório"], ["usuario", "Conta responsável"], ["capacidade", "Capacidade (L)"], ["nivel", "Nível atual"], ["status", "Status"]] },
  setores: { title: "Setores", intro: "Organize áreas de consumo por reservatório e defina o limite diário em litros.", fields: [
    ["nome", "Nome", "text", true], ["id_reservatorio", "Reservatório", "select", true, "reservatorios"],
    ["tipo", "Tipo de uso", "select", true, ["Linha de produção", "Torres de resfriamento/Caldeiras", "Limpeza/Lavagem", "Uso administrativo", "Tratamento de efluentes", "Agua de reúso", "Outro"]],
    ["consumo_max_dia", "Consumo máximo diário (L)", "number", true], ["status", "Status", "select", true, ["Ativo", "Inativo"]],
  ], columns: [["nome", "Setor"], ["reservatorio", "Reservatório"], ["tipo", "Uso"], ["consumo_max_dia", "Limite diário (L)"], ["status", "Status"]] },
  medidores: { title: "Medidores", intro: "Vincule cada equipamento a um setor ativo. O reservatório é obtido pelo setor.", fields: [
    ["serie", "Número de série", "text", true], ["tipo", "Tipo", "select", true, ["Nível", "Vazão", "Hidrômetro"]],
    ["origem", "Origem", "select", true, ["Real", "Simulado"]], ["id_setor", "Setor", "select", true, "setores"],
    ["status", "Status", "select", true, ["Ativo", "Inativo"]],
  ], columns: [["serie", "Série"], ["tipo", "Tipo"], ["origem", "Origem"], ["reservatorio", "Reservatório"], ["setor", "Setor"], ["status", "Status"]] },
  responsaveis: { title: "Responsáveis", intro: "Associe contatos reais a clientes, reservatórios e setores.", fields: [
    ["nome", "Nome", "text", true], ["id_usuario", "Cliente", "select", true, "clientes"], ["funcao", "Função", "text"],
    ["telefone", "Telefone", "text"], ["email", "E-mail", "email"], ["id_reservatorio", "Reservatório", "select", true, "reservatorios"],
    ["id_setor", "Setor", "select", false, "setores"], ["status", "Status", "select", true, ["Ativo", "Inativo"]],
  ], columns: [["nome", "Responsável"], ["usuario", "Cliente"], ["funcao", "Função"], ["telefone", "Telefone"], ["reservatorio", "Reservatório"], ["setor", "Setor"], ["status", "Status"]] },
  leituras: { title: "Histórico de leituras", intro: "Histórico imutável consultado diretamente no banco. Filtre por medidor, local e período.", readOnly: true, fields: [], columns: [
    ["medidor", "Medidor"], ["tipo_medidor", "Tipo"], ["reservatorio", "Reservatório"], ["setor", "Setor"], ["valor", "Valor (L)"], ["data_hora", "Data e hora"], ["origem", "Origem"],
  ] },
  ocorrencias: { title: "Ocorrências", intro: "Acompanhe o ciclo Aberta → Em análise → Em reparo → Resolvida. A resolução exige ação corretiva.", fields: [
    ["tipo", "Tipo", "select", true, ["Vazamento visível", "Vazamento Oculto", "Consumo anormal", "Falha de sensor", "Transbordo", "Outro"]],
    ["severidade", "Severidade", "select", true, ["Baixa", "Média", "Alta", "Extrema"]],
    ["id_reservatorio", "Reservatório", "select", true, "reservatorios"], ["id_setor", "Setor", "select", false, "setores"],
    ["descricao", "Descrição", "textarea", true], ["volume_perdido", "Volume perdido estimado (L)", "number"],
    ["abertura", "Data de abertura", "datetime-local", true], ["id_responsavel", "Responsável", "select", false, "responsaveis"],
    ["status", "Status", "select", true, ["Aberta", "Em análise", "Em reparo", "Resolvida", "Descartada"]],
    ["acao_corretiva", "Ação corretiva", "textarea"],
  ], columns: [["tipo", "Ocorrência"], ["severidade", "Severidade"], ["reservatorio", "Reservatório"], ["setor", "Setor"], ["abertura", "Abertura"], ["status", "Status"]] },
  acessos: { title: "Histórico de acesso", intro: "Últimos 500 logins, falhas de autenticação e encerramentos de sessão registrados pela API.", readOnly: true, fields: [], columns: [
    ["usuario", "Usuário / e-mail"], ["evento", "Evento"], ["data_hora", "Data e hora"], ["ip", "IP"],
  ] },
  reunioes: { title: "Reuniões e entrevistas", intro: "Registros vinculados a um cliente e ao Filiado responsável.", fields: [
    ["id_usuario", "Cliente", "select", true, "clientes"], ["id_filiado", "Filiado", "select", true, "filiados"],
    ["tipo", "Tipo", "select", true, ["Reunião", "Entrevista"]], ["data_hora", "Data e hora", "datetime-local", true],
    ["pauta", "Pauta", "textarea", true], ["resumo", "Resumo", "textarea", true], ["proximos_passos", "Próximos passos", "textarea"],
  ], columns: [["cliente", "Cliente"], ["filiado", "Filiado"], ["tipo", "Tipo"], ["data_hora", "Data e hora"], ["pauta", "Pauta"]] },
};

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></>,
    file: <><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7m-7 4h7"/></>,
    drop: <><path d="M12 22a8 8 0 0 0 8-8c0-4-8-13-8-13S4 10 4 14a8 8 0 0 0 8 8Z"/><path d="M8 15a4 4 0 0 0 4 4"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatValue(value) {
  if (value == null || value === "") return "—";
  if (value instanceof Date) value = value.toISOString();
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(value)) {
    const date = new Date(value.includes("T") ? value : value.replace(" ", "T"));
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(date);
  }
  if (typeof value === "number") return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return String(value);
}

function dateKey(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function dateTimeInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)) return value.replace(" ", "T").slice(0, 16);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function nowDateTimeInput() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function optionsFor(source, data) {
  const records = source === "contas" ? data.usuarios.filter((x) => x.status === "Ativo")
    : source === "clientes" ? data.usuarios.filter((x) => x.categoria === "Cliente" && x.status === "Ativo")
      : source === "filiados" ? data.usuarios.filter((x) => x.categoria === "Filiado" && x.status === "Ativo")
        : source === "setores" ? data.setores.filter((x) => x.status === "Ativo")
          : source === "reservatorios" ? data.reservatorios.filter((x) => x.status === "Ativo")
            : source === "responsaveis" ? data.responsaveis.filter((x) => x.status === "Ativo") : [];
  const key = source === "contas" || source === "clientes" || source === "filiados" ? "nome"
    : source === "setores" || source === "reservatorios" ? "nome" : "nome";
  return records.map((record) => ({ value: String(record.id), label: record[key] }));
}

function RecordsView({ section, records, data, reload, notify }) {
  const config = configs[section];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minimumLevel, setMinimumLevel] = useState("");
  const [readingFilters, setReadingFilters] = useState({ medidor: "", reservatorio: "", setor: "", origem: "", inicio: "", fim: "" });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fields = config.fields;

  const visible = useMemo(() => records.filter((row) => {
    const matchesQuery = !query || normalizeSearch(JSON.stringify(row)).includes(normalizeSearch(query));
    const matchesStatus = !statusFilter || row.status === statusFilter;
    const matchesLevel = section !== "reservatorios" || !minimumLevel || Number(row.nivel ?? -1) >= Number(minimumLevel);
    const matchesReadings = section !== "leituras" || (
      (!readingFilters.medidor || row.medidor === readingFilters.medidor)
      && (!readingFilters.reservatorio || row.reservatorio === readingFilters.reservatorio)
      && (!readingFilters.setor || row.setor === readingFilters.setor)
      && (!readingFilters.origem || row.origem === readingFilters.origem)
      && (!readingFilters.inicio || dateKey(row.data_hora) >= readingFilters.inicio)
      && (!readingFilters.fim || dateKey(row.data_hora) <= readingFilters.fim)
    );
    return matchesQuery && matchesStatus && matchesLevel && matchesReadings;
  }), [records, query, statusFilter, section, minimumLevel, readingFilters]);

  function startCreate() {
    const next = Object.fromEntries(fields.map(([key]) => [key, ""]));
    for (const [key, value] of Object.entries({ status: section === "ocorrencias" ? "Aberta" : "Ativo", tema: "Escuro", origem: "Real" })) {
      if (key in next) next[key] = value;
    }
    for (const key of ["data_hora", "abertura"]) if (key in next) next[key] = nowDateTimeInput();
    setEditing("novo"); setForm(next); setError("");
  }

  function startEdit(row) {
    const next = { ...row, senha: "" };
    for (const [key, , type] of fields) if (type === "datetime-local") next[key] = dateTimeInput(row[key]);
    setEditing(row.id); setForm(next); setError("");
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true); setError("");
    const body = { ...form };
    if (!body.senha) delete body.senha;
    try {
      const isNew = editing === "novo";
      await apiRequest(`/admin/${section}${isNew ? "" : `/${editing}`}`, {
        method: isNew ? "POST" : "PUT", body: JSON.stringify(body),
      });
      await reload(); setEditing(null);
      notify(isNew ? "Registro salvo no banco de dados." : "Alterações salvas no banco de dados.");
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar este registro.");
    } finally { setSaving(false); }
  }

  async function changeStatus(row) {
    const nextStatus = section === "ocorrencias" ? "Descartada" : row.status === "Ativo" ? "Inativo" : "Ativo";
    const prompt = section === "ocorrencias" ? "Descartar esta ocorrência?" : `${nextStatus === "Inativo" ? "Inativar" : "Reativar"} este registro?`;
    if (!window.confirm(prompt)) return;
    try {
      await apiRequest(`/admin/${section}/${row.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      await reload(); notify("Status atualizado no banco de dados.");
    } catch (changeError) { notify(changeError.message || "Não foi possível atualizar o status."); }
  }

  function exportText() {
    const content = [config.title, `Gerado em ${new Date().toLocaleString("pt-BR")}`, "",
      ...visible.map((row) => config.columns.map(([key, label]) => `${label}: ${formatValue(row[key])}`).join(" | ")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `watercontrol-${section}.txt`; link.click(); URL.revokeObjectURL(url);
  }

  const showActions = !config.readOnly;
  return <section className="panel section-panel admin-records">
    <div className="panel-heading"><div><p className="eyebrow">{visible.length} REGISTRO(S)</p><h2>{config.title}</h2><p className="admin-intro">{config.intro}</p></div>
      <div className="record-tools"><label className="search-box"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nesta lista" aria-label="Buscar registros"/></label>
        {!config.readOnly && <button className="admin-action" onClick={startCreate}>＋ Novo cadastro</button>}
        {(section === "leituras" || section === "ocorrencias") && <button className="admin-action secondary" onClick={exportText}>Exportar .txt</button>}
      </div>
    </div>
    <div className="record-filters"><span>Exibindo {visible.length} de {records.length}</span>
      {records.some((row) => row.status) && <label>Filtrar status <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos</option>{[...new Set(records.map((row) => row.status).filter(Boolean))].map((status) => <option key={status}>{status}</option>)}</select></label>}
      {section === "reservatorios" && <label>Nível mínimo (%) <input type="number" min="0" max="100" placeholder="0–100" value={minimumLevel} onChange={(event) => setMinimumLevel(event.target.value)}/></label>}
      {section === "leituras" && <>
        {[["medidor", "Medidor", "medidor"], ["reservatorio", "Reservatório", "reservatorio"], ["setor", "Setor", "setor"], ["origem", "Origem", "origem"]].map(([key, label, field]) => <label key={key}>{label} <select value={readingFilters[key]} onChange={(event) => setReadingFilters({ ...readingFilters, [key]: event.target.value })}><option value="">Todos</option>{[...new Set(records.map((row) => row[field]).filter(Boolean))].map((value) => <option key={value}>{value}</option>)}</select></label>)}
        <label>De <input aria-label="Data inicial" type="date" value={readingFilters.inicio} onChange={(event) => setReadingFilters({ ...readingFilters, inicio: event.target.value })}/></label>
        <label>Até <input aria-label="Data final" type="date" value={readingFilters.fim} onChange={(event) => setReadingFilters({ ...readingFilters, fim: event.target.value })}/></label>
      </>}
    </div>
    <div className="table-scroll"><table className="admin-table"><thead><tr>{config.columns.map(([key, label]) => <th key={key}>{label}</th>)}{showActions && <th>Ações</th>}</tr></thead>
      <tbody>{visible.map((row) => <tr key={row.id}>{config.columns.map(([key]) => <td key={key}>{key === "status" ? <span className={`record-status ${normalizeSearch(row[key]).replaceAll(" ", "-")}`}>{row[key]}</span> : formatValue(row[key])}</td>)}
        {showActions && <td className="row-actions"><button className="admin-row-action admin-row-action--edit" type="button" onClick={() => startEdit(row)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>Editar</button>{section === "ocorrencias" ? row.status === "Aberta" && <button className="admin-row-action admin-row-action--discard" type="button" onClick={() => changeStatus(row)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2m3 0-1 14H6L5 6"/><path d="M10 11v5m4-5v5"/></svg>Descartar</button> : row.status && <button className="admin-row-action admin-row-action--warning" type="button" onClick={() => changeStatus(row)}>{row.status === "Ativo" ? "Inativar" : "Ativar"}</button>}</td>}
      </tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state">Nenhum registro encontrado para os filtros selecionados.</div>}</div>
    {editing !== null && typeof document !== "undefined" && createPortal(<div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
      <form className="admin-modal panel" onSubmit={save}><div className="panel-heading"><div><p className="eyebrow">{editing === "novo" ? "NOVO REGISTRO" : "EDITAR REGISTRO"}</p><h2>{config.title}</h2></div><button className="icon-button" type="button" onClick={() => setEditing(null)} aria-label="Fechar">×</button></div>
        <div className="admin-form-grid">{fields.map(([key, label, type = "text", required = false, options]) => {
          const choices = Array.isArray(options) ? options.map((value) => ({ value, label: value })) : typeof options === "string" ? optionsFor(options, data) : [];
          if (key === "senha" && editing !== "novo") return <label key={key}>{label} (opcional)<input type="password" autoComplete="new-password" value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })}/></label>;
          if (type === "select") return <label key={key}>{label}<select required={required} value={form[key] == null ? "" : String(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.value })}><option value="">Selecione…</option>{choices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
          if (type === "textarea") return <label key={key} className="wide">{label}<textarea required={required} rows="3" value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })}/></label>;
          return <label key={key}>{label}<input type={type} required={required || (key === "senha" && editing === "novo")} min={type === "number" ? 0 : undefined} step={type === "number" ? "any" : undefined} autoComplete={type === "password" ? "new-password" : undefined} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })}/></label>;
        })}</div>
        {error && <p className="admin-form-error" role="alert">{error}</p>}
        <div className="admin-modal-actions"><button className="admin-action secondary" type="button" onClick={() => setEditing(null)}>Cancelar</button><button className="admin-action" type="submit" disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button></div>
      </form>
    </div>, document.body)}
  </section>;
}

function ConsumptionChart({ readings }) {
  const [periodo, setPeriodo] = useState("30");
  const periodos = [{ valor: "1", rotulo: "24 horas" }, { valor: "7", rotulo: "7 dias" }, { valor: "30", rotulo: "30 dias" }, { valor: "90", rotulo: "90 dias" }, { valor: "todos", rotulo: "Tudo" }];
  const points = useMemo(() => {
    const limite = periodo === "todos" ? null : Date.now() - Number(periodo) * 24 * 60 * 60 * 1000;
    return readings
      .filter((reading) => reading.tipo_medidor !== "NÃ­vel")
      .map((reading) => ({ reading, instante: new Date(reading.data_hora).getTime() }))
      .filter(({ instante }) => Number.isFinite(instante) && (limite === null || instante >= limite))
      .sort((a, b) => a.instante - b.instante)
      .map(({ reading }) => reading);
  }, [readings, periodo]);
  const data = useMemo(() => ({
    labels: points.map((reading) => {
      const date = new Date(reading.data_hora);
      return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
      }).format(date);
    }),
    datasets: [{
      label: "Leitura registrada",
      data: points.map((reading) => Number(reading.valor) || 0),
      borderColor: "#24b8c7",
      backgroundColor: ({ chart }) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(39,192,207,.12)";
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(39,192,207,.28)");
        gradient.addColorStop(1, "rgba(39,192,207,0)");
        return gradient;
      },
      borderWidth: 3,
      pointRadius: points.length < 14 ? 3 : 0,
      pointHoverRadius: 5,
      pointBackgroundColor: "#27c0cf",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      fill: true,
      tension: 0.32,
    }],
  }), [points]);
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#06233f",
        borderColor: "rgba(80,160,220,.35)",
        borderWidth: 1,
        titleColor: "#e8f3fc",
        bodyColor: "#cfe6f7",
        displayColors: false,
        callbacks: { label: (item) => `${points[item.dataIndex]?.medidor || "Medidor"}: ${formatValue(item.parsed.y)} L` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#8795a5", maxTicksLimit: 5, maxRotation: 0, autoSkip: true, font: { family: 'Inter, "Segoe UI", system-ui, sans-serif', size: 9 } },
      },
      y: {
        beginAtZero: false,
        grace: "10%",
        grid: { color: "rgba(155,182,203,.22)" },
        border: { display: false, dash: [4, 4] },
        ticks: { color: "#8795a5", maxTicksLimit: 5, padding: 7, callback: (value) => formatValue(Number(value)), font: { family: 'Inter, "Segoe UI", system-ui, sans-serif', size: 9 } },
      },
    },
  }), [points]);

  return <>
    <nav className="chart-period-filters" aria-label="Filtrar período do gráfico">
      <span>Período</span>
      {periodos.map(({ valor, rotulo }) => <button key={valor} type="button" aria-pressed={periodo === valor} onClick={() => setPeriodo(valor)}>{rotulo}</button>)}
    </nav>
    {!points.length
      ? <div className="empty-state">Não há leituras de vazão ou hidrômetro no período selecionado.</div>
      : <div className="chart-wrap" role="img" aria-label={`Gráfico das leituras de vazão e hidrômetro: ${periodos.find((item) => item.valor === periodo)?.rotulo}`}>
        <div className="chart-y-label">L</div>
        <div className="admin-chart-canvas"><Line data={data} options={options} aria-label="Leituras de vazão e hidrômetro em litros" role="img"/></div>
      </div>}
  </>;
}

function Dashboard({ data, go }) {
  const activeReservoirs = data.reservatorios.filter((row) => row.status === "Ativo");
  const openOccurrences = data.ocorrencias.filter((row) => !["Resolvida", "Descartada"].includes(row.status));
  const critical = openOccurrences.filter((row) => ["Alta", "Extrema"].includes(row.severidade));
  return <>
    <section className="metric-grid" aria-label="Indicadores do banco de dados">
      <article className="metric-card"><span className="metric-icon"><Icon name="drop" size={20}/></span><div><p>Leituras registradas</p><strong>{data.leituras.length} <small>registros</small></strong><span className="metric-note">Histórico imutável dos medidores</span></div></article>
      <article className="metric-card"><span className="metric-icon"><span className="tank-icon">▤</span></span><div><p>Reservatórios ativos</p><strong>{activeReservoirs.length} <small>/ {data.reservatorios.length}</small></strong><span className="metric-note"><b>{data.setores.length}</b> setores cadastrados</span></div></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="file" size={20}/></span><div><p>Ocorrências abertas</p><strong className="metric-critical">{openOccurrences.length}</strong><span className="metric-note"><b className="attention">{critical.length} alta/extrema</b></span></div></article>
    </section>
    <section className="content-grid"><article className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">HISTÓRICO REGISTRADO</p><h2>Leituras de vazão e hidrômetro</h2></div><button className="select-button" type="button" onClick={() => go("leituras")}>Consultar histórico <span>→</span></button></div><ConsumptionChart readings={data.leituras}/></article>
      <article className="panel levels-panel"><div className="panel-heading"><div><p className="eyebrow">ÚLTIMA MEDIÇÃO</p><h2>Nível dos reservatórios</h2></div><button className="icon-button" type="button" aria-label="Ver reservatórios" onClick={() => go("reservatorios")}><Icon name="more"/></button></div>
        <div className="reservoir-list compact">{activeReservoirs.slice(0, 5).map((row) => { const level = Number(row.nivel); const hasLevel = row.nivel != null && Number.isFinite(level); return <div className="reservoir-row" key={row.id}><div className="reservoir-label"><span>{row.nome}</span></div><div className="level-track"><span className={!hasLevel ? "low" : level < 35 ? "low" : level < 45 ? "warning" : ""} style={{ width: `${hasLevel ? Math.max(0, Math.min(100, level)) : 0}%` }}/></div><strong className={hasLevel && level < 35 ? "level-low" : ""}>{hasLevel ? `${formatValue(level)}%` : "—"}</strong></div>; })}{activeReservoirs.length === 0 && <div className="empty-state">Nenhum reservatório ativo.</div>}</div>
        <button className="text-link" onClick={() => go("reservatorios")}>Gerenciar reservatórios <span>→</span></button>
      </article>
    </section>
    <section className="panel occurrences-panel"><div className="panel-heading"><div><p className="eyebrow">REGISTROS DA OPERAÇÃO</p><h2>Ocorrências abertas <span className="count-pill">{openOccurrences.length}</span></h2></div><button className="text-link" onClick={() => go("ocorrencias")}>Abrir ocorrências <span>→</span></button></div>
      <div className="occurrence-list">{openOccurrences.slice(0, 4).map((item) => <article className={`occurrence-row ${normalizeSearch(item.severidade)}`} key={item.id}><span className="occurrence-symbol">•</span><div className="occurrence-copy"><div className="occurrence-heading"><strong>{item.tipo}</strong><span className={`severity ${normalizeSearch(item.severidade)}`}>{item.severidade}</span></div><p>{item.reservatorio || "Sem reservatório"} · {item.setor || "Sem setor"}</p></div><time>{formatValue(item.abertura)}</time></article>)}{openOccurrences.length === 0 && <div className="empty-state">Nenhuma ocorrência em aberto.</div>}</div>
    </section>
  </>;
}

function Reports({ data, saveTariff, saving }) {
  const [value, setValue] = useState(data.tarifa?.valor == null ? "" : String(data.tarifa.valor));
  const [error, setError] = useState("");
  useEffect(() => setValue(data.tarifa?.valor == null ? "" : String(data.tarifa.valor)), [data.tarifa]);
  const open = data.ocorrencias.filter((row) => !["Resolvida", "Descartada"].includes(row.status));
  const loss = data.ocorrencias.reduce((sum, row) => sum + Number(row.volume_perdido || 0), 0);
  const activeReservoirs = data.reservatorios.filter((row) => row.status === "Ativo").length;
  function exportReport(kind) {
    const rows = kind === "leituras" ? data.leituras : data.ocorrencias;
    const body = [`Relatório de ${kind} — WaterControl`, `Emitido em ${new Date().toLocaleString("pt-BR")}`, "", ...rows.map((row) => Object.entries(row).map(([key, item]) => `${key}: ${formatValue(item)}`).join(" | "))].join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `relatorio-${kind}-watercontrol.txt`; link.click(); URL.revokeObjectURL(url);
  }
  async function submitTariff(event) {
    event.preventDefault(); setError("");
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Informe uma tarifa maior que zero."); return; }
    try { await saveTariff(amount); } catch (saveError) { setError(saveError.message || "Não foi possível salvar a tarifa."); }
  }
  return <div className="admin-report-grid"><section className="panel section-panel"><p className="eyebrow">INDICADORES OPERACIONAIS · BANCO</p><h2>Resumo operacional</h2><div className="report-stats">
    <div><span>Reservatórios</span><strong>{activeReservoirs} ativos</strong></div><div><span>Medidores cadastrados</span><strong>{data.medidores.length}</strong></div><div><span>Ocorrências abertas</span><strong>{open.length}</strong></div><div><span>Perda estimada registrada</span><strong>{formatValue(loss)} L</strong></div>
    </div><div className="admin-export-row"><button className="admin-action" onClick={() => exportReport("leituras")}>Exportar leituras (.txt)</button><button className="admin-action secondary" onClick={() => exportReport("ocorrencias")}>Exportar ocorrências (.txt)</button></div></section>
    <section className="panel section-panel"><p className="eyebrow">ECONOMIA E PLANEJAMENTO</p><h2>Tarifa de água</h2><form onSubmit={submitTariff}><label className="tariff-field">Tarifa vigente (R$/m³)<input aria-label="Tarifa de água por metro cúbico" type="number" min="0.01" step="0.01" value={value} onChange={(event) => setValue(event.target.value)}/></label>
      <div className="report-estimate"><span>{data.tarifa ? `Vigente desde ${formatValue(data.tarifa.vigencia_inicio)}` : "Ainda não há tarifa cadastrada"}</span><strong>{data.tarifa ? `${Number(data.tarifa.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/m³` : "—"}</strong></div>{error && <p className="admin-form-error" role="alert">{error}</p>}<div className="admin-modal-actions"><button type="submit" className="admin-action" disabled={saving}>{saving ? "Salvando…" : "Salvar tarifa"}</button></div>
    </form></section></div>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("visao");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [data, setData] = useState(emptyData);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingTariff, setSavingTariff] = useState(false);
  const { theme, toggleTheme } = useAppTheme();

  async function reload() {
    const result = await apiRequest("/admin/dados");
    setData({ ...emptyData, ...result });
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await apiRequest("/auth/me");
        if (!mounted) return;
        if (session.categoria !== "Admin") { router.replace(session.categoria === "Filiado" ? "/filiado" : "/cliente"); return; }
        setUsuario(session);
        const result = await apiRequest("/admin/dados");
        if (!mounted) return;
        setData({ ...emptyData, ...result }); setLoadError("");
      } catch (error) {
        if (!mounted) return;
        if (/sessão|autenticação/i.test(error.message)) router.replace("/#login");
        else setLoadError(error.message || "Não foi possível carregar os dados administrativos.");
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [router]);

  useEffect(() => {
    const navigate = (event) => setActive(event.detail);
    window.addEventListener("wapi-section", navigate);
    return () => window.removeEventListener("wapi-section", navigate);
  }, []);

  function notify(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function saveTariff(valor) {
    setSavingTariff(true);
    try { await apiRequest("/admin/tarifa", { method: "PUT", body: JSON.stringify({ valor }) }); await reload(); notify("Tarifa salva no banco de dados."); }
    finally { setSavingTariff(false); }
  }

  async function logout() {
    try { await apiRequest("/auth/logout", { method: "POST" }); } catch { /* a sessão local termina mesmo sem resposta */ }
    router.replace("/#login"); router.refresh();
  }

  const title = titles[active] || titles.visao;
  if (loading) return <main className="wapi-app"><OceanBackground theme={theme}/><div className="page-shell"><section className="panel section-panel" role="status">Verificando sessão administrativa e carregando registros do banco…</section></div></main>;
  if (loadError) return <main className="wapi-app"><OceanBackground theme={theme}/><div className="page-shell"><section className="panel section-panel"><h1>Falha na integração administrativa</h1><p role="alert">{loadError}</p><button className="admin-action" onClick={() => { setLoading(true); setLoadError(""); reload().catch((error) => setLoadError(error.message)).finally(() => setLoading(false)); }}>Tentar novamente</button></section></div></main>;
  if (!usuario) return <main className="wapi-app"><OceanBackground theme={theme}/><div className="page-shell"><section className="panel section-panel" role="status">Redirecionando para a entrada do sistema…</section></div></main>;

  return <main className={`wapi-app ${theme === "Claro" ? "theme-light" : ""}`}><OceanBackground theme={theme}/>
    <header className="topbar"><a className="brand" href="/admin" aria-label="WAPI Water Control início"><Image src="/logo-wapi.png" alt="WAPI Water Control" width={147} height={62} priority/></a>
      <button className="mobile-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir navegação">☰</button>
      <nav className={`main-nav ${mobileMenu ? "open" : ""}`} aria-label="Navegação administrativa">{sections.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); setMobileMenu(false); }}>{item.label}
        {item.id === "ocorrencias" && <span className="nav-badge">{data.ocorrencias.filter((row) => !["Resolvida", "Descartada"].includes(row.status)).length}</span>}</button>)}</nav>
      <ThemeToggle theme={theme} onToggle={toggleTheme} placement="inline" />
    </header>
    <button className="logout-fab" type="button" onClick={logout} aria-label="Sair da conta" title="Sair da conta"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg></button>
    <div className="page-shell"><div className="page-title"><div><h1>{title[0]}</h1><p className="admin-page-subtitle">{active === "visao" ? "Indicadores e registros carregados do banco de dados." : title[1]}</p></div></div>
      {notice && <div className="admin-toast" role="status">{notice}</div>}
      {active === "visao" ? <Dashboard data={data} go={setActive}/>
        : active === "relatorios" ? <Reports data={data} saveTariff={saveTariff} saving={savingTariff}/>
          : <RecordsView key={active} section={active} records={data[active] || []} data={data} reload={reload} notify={notify}/>}
    </div>
  </main>;
}
