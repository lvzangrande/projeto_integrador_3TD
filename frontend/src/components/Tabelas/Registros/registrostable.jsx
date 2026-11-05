"use client";

import { useEffect, useRef, useState } from "react";
import "./registrostable.css";

/* ---------- Aparência por tipo ----------
 * As chaves devem corresponder ao valor de `tipo` retornado pela API
 * (acentos e maiúsculas são ignorados: "Reunião" → "reuniao").
 * Tipos desconhecidos usam o visual padrão, sem quebrar a tabela.
 */
const TIPOS = {
  reuniao: { label: "Reunião", icon: "users" },
  vistoria: { label: "Vistoria", icon: "eye" },
  ocorrencia: { label: "Ocorrência", icon: "alert" },
  manutencao: { label: "Manutenção", icon: "wrench" },
  treinamento: { label: "Treinamento", icon: "book" },
};

const TIPO_PADRAO = { label: "Outro", icon: "tag" };

const ATRASO_BUSCA_MS = 400;

/* ---------- Ícones (SVG inline, sem dependências) ---------- */
function Icon({ children, size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const IconSearch = (p) => (
  <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>
);
const IconFilter = (p) => (
  <Icon {...p}><path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" /></Icon>
);
const IconCalendar = (p) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.2" />
  </Icon>
);
const IconChevronDown = (p) => (<Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>);
const IconChevronLeft = (p) => (<Icon {...p}><path d="M15 6l-6 6 6 6" /></Icon>);
const IconChevronRight = (p) => (<Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>);
const IconClock = (p) => (<Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>);
const IconInfo = (p) => (<Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" strokeWidth="2.2" /></Icon>);
const IconTag = (p) => (
  <Icon {...p}>
    <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z" />
    <path d="M7.5 7.5h.01" strokeWidth="2.4" />
  </Icon>
);
const IconClipboard = (p) => (
  <Icon {...p}>
    <rect x="5" y="4" width="14" height="17" rx="3" />
    <path d="M9 4V3h6v1M9 11h6M9 15h4" />
  </Icon>
);
const IconUser = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></Icon>
);
const IconText = (p) => (<Icon {...p}><path d="M4 6h16M4 11h16M4 16h10" /></Icon>);
const IconUsers = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.2-5.5 6.5-5.5s5.7 2 6.5 5.5" />
    <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.5 3.6 5.2" />
  </Icon>
);
const IconEye = (p) => (
  <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>
);
const IconAlert = (p) => (
  <Icon {...p}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18h.01" strokeWidth="2.2" /></Icon>
);
const IconWrench = (p) => (
  <Icon {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-4 4-1.5-1.5-8 5.5-2-2 5.5-8L9 9l4-4 1.5 1.5z" />
  </Icon>
);
const IconBook = (p) => (
  <Icon {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 20a2 2 0 0 0 2 1h13v-3M9 7h6" />
  </Icon>
);
const IconDrop = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="rg-drop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5fe0ff" />
        <stop offset="1" stopColor="#0a7fd6" />
      </linearGradient>
    </defs>
    <path
      d="M32 4C24 18 14 28 14 40a18 18 0 0 0 36 0C50 28 40 18 32 4z"
      fill="url(#rg-drop)"
    />
    <path
      d="M30 22c-5 8-10 13-10 20 0 5 3 9 8 10-4-4-4-9-1-15 2-4 3-8 3-15z"
      fill="#06304f"
      opacity=".45"
    />
  </svg>
);

const ICONES_TIPO = {
  users: IconUsers,
  eye: IconEye,
  alert: IconAlert,
  wrench: IconWrench,
  book: IconBook,
  tag: IconTag,
};

/* ---------- Utilitários (tolerantes a dados incompletos) ---------- */
function normalizarTipo(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function infoTipo(valor) {
  const chave = normalizarTipo(valor);
  if (TIPOS[chave]) return { chave, ...TIPOS[chave] };
  // tipo desconhecido: mostra o texto original da API
  return { chave: "outro", ...TIPO_PADRAO, label: valor ? String(valor) : TIPO_PADRAO.label };
}

function normalizarCliente(cliente) {
  if (!cliente) return { nome: "—", empresa: "" };
  if (typeof cliente === "string") return { nome: cliente, empresa: "" };
  return { nome: cliente.nome || "—", empresa: cliente.empresa || "" };
}

function iniciais(nome) {
  const partes = String(nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0 || nome === "—") return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

/* Aceita ISO 8601 / timestamp / Date (formata em dd/mm/aaaa – hh:mm, fuso de São Paulo)
 * ou uma string já formatada (ex.: "03/11/2026 – 10:05"), exibida como veio. */
function formatarDataHora(valor) {
  if (!valor) return "—";
  if (typeof valor === "string" && /^\d{2}\/\d{2}\/\d{4}/.test(valor)) return valor;
  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return String(valor);
  const fuso = "America/Sao_Paulo";
  const data = d.toLocaleDateString("pt-BR", { timeZone: fuso });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: fuso });
  return `${data} – ${hora}`;
}

function listaPaginas(total, atual) {
  const set = new Set([1, total, atual - 1, atual, atual + 1]);
  const paginas = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const saida = [];
  paginas.forEach((p, i) => {
    if (i > 0 && p - paginas[i - 1] > 1) saida.push("…");
    saida.push(p);
  });
  return saida;
}

/* ---------- Componente ----------
 *
 * Props:
 *  - registros   Array da página atual, vindo da API:
 *                { id, tipo, pauta, cliente: { nome, empresa? } | "Nome", dataHora, resumo }
 *  - total       Total de registros que atendem aos filtros (todas as páginas)
 *  - porPagina   Itens por página — deve ser igual ao limite usado na API (padrão 5)
 *  - carregando  true enquanto a requisição está em andamento
 *  - erro        Mensagem de erro (string) para exibir no lugar da lista
 *  - onChange    ({ busca, tipo, pagina }) => void
 *                Chamado na montagem e sempre que busca (com atraso), tipo ou página mudam.
 *                `tipo` é null para "Todos". Faça a requisição aqui.
 *  - onAcoes     (registro) => void, ao clicar em "•••"
 *
 * A filtragem e a paginação acontecem na API; o componente só exibe o que recebe.
 */
export default function RegistrosTable({
  registros = [],
  total,
  porPagina = 5,
  carregando = false,
  erro = null,
  onChange,
  onAcoes,
}) {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Atraso na busca para não chamar a API a cada tecla
  useEffect(() => {
    if (busca === buscaAplicada) return;
    const id = setTimeout(() => {
      setBuscaAplicada(busca);
      setPagina(1);
    }, ATRASO_BUSCA_MS);
    return () => clearTimeout(id);
  }, [busca, buscaAplicada]);

  // Avisa o componente pai sempre que os parâmetros de consulta mudam
  useEffect(() => {
    onChangeRef.current?.({
      busca: buscaAplicada.trim(),
      tipo: tipo === "todos" ? null : tipo,
      pagina,
    });
  }, [buscaAplicada, tipo, pagina]);

  const totalRegistros = Number.isFinite(total) ? total : registros.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const fim = inicio + registros.length;

  const irPara = (p) => setPagina(Math.min(Math.max(p, 1), totalPaginas));

  const escolherTipo = (chave) => {
    setTipo(chave);
    setPagina(1);
  };

  return (
    <main className="rg-page">
      <div className="rg-container">
        {/* Cabeçalho */}
        <header className="rg-header">
          <div className="rg-brand">
            <IconDrop />
            <span className="rg-brand__divider" />
            <div>
              <h1 className="rg-title">Registro de Atividades</h1>
              <p className="rg-subtitle">
                Reuniões, vistorias e ocorrências por cliente
              </p>
            </div>
          </div>

          <div className="rg-tools">
            <label className="rg-search">
              <IconSearch size={22} />
              <input
                type="search"
                placeholder="Buscar por pauta, cliente ou resumo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            <button type="button" className="rg-btn">
              <IconCalendar size={22} />
              <span>Últimos 30 dias</span>
              <IconChevronDown size={18} />
            </button>
          </div>
        </header>

        {/* Filtro por tipo */}
        <div className="rg-chips" role="group" aria-label="Filtrar por tipo">
          <button
            type="button"
            className={`rg-chip ${tipo === "todos" ? "is-active" : ""}`}
            aria-pressed={tipo === "todos"}
            onClick={() => escolherTipo("todos")}
          >
            <IconFilter size={18} />
            Todos
          </button>
          {Object.entries(TIPOS).map(([chave, t]) => {
            const Ico = ICONES_TIPO[t.icon];
            return (
              <button
                key={chave}
                type="button"
                className={`rg-chip ${tipo === chave ? "is-active" : ""}`}
                aria-pressed={tipo === chave}
                onClick={() => escolherTipo(chave)}
              >
                <Ico size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tabela */}
        <section className={`rg-card ${carregando ? "is-loading" : ""}`} aria-busy={carregando}>
          <div className="rg-scroll">
            <table className="rg-table">
              <thead>
                <tr>
                  <th><span className="rg-th"><IconTag size={26} />Tipo</span></th>
                  <th><span className="rg-th"><IconClipboard size={26} />Pauta</span></th>
                  <th><span className="rg-th"><IconUser size={26} />Cliente</span></th>
                  <th><span className="rg-th"><IconCalendar size={26} />Data e horário</span></th>
                  <th><span className="rg-th"><IconText size={26} />Resumo</span></th>
                  <th className="rg-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {erro && (
                  <tr>
                    <td colSpan={6} className="rg-empty">{erro}</td>
                  </tr>
                )}

                {!erro && carregando && registros.length === 0 && (
                  <tr>
                    <td colSpan={6} className="rg-empty">Carregando registros...</td>
                  </tr>
                )}

                {!erro && !carregando && registros.length === 0 && (
                  <tr>
                    <td colSpan={6} className="rg-empty">Nenhum registro encontrado.</td>
                  </tr>
                )}

                {!erro &&
                  registros.map((r, i) => {
                    const t = infoTipo(r.tipo);
                    const IcoTipo = ICONES_TIPO[t.icon];
                    const cliente = normalizarCliente(r.cliente);
                    const alerta = t.chave === "ocorrencia";
                    const pauta = r.pauta || "—";
                    const resumo = r.resumo || "—";

                    return (
                      <tr key={r.id ?? `${inicio}-${i}`} className={alerta ? "rg-row rg-row--alert" : "rg-row"}>
                        <td>
                          <span className={`rg-tipo rg-tipo--${t.chave}`}>
                            <IcoTipo size={22} />
                            {t.label}
                          </span>
                        </td>

                        <td>
                          <span className="rg-pauta">{pauta}</span>
                        </td>

                        <td>
                          <span className="rg-user">
                            <span className="rg-avatar" aria-hidden="true">{iniciais(cliente.nome)}</span>
                            <span className="rg-user__info">
                              <span>{cliente.nome}</span>
                              {cliente.empresa && <span className="rg-user__role">{cliente.empresa}</span>}
                            </span>
                          </span>
                        </td>

                        <td>
                          <span className="rg-cell">
                            <IconClock size={26} className="rg-muted" />
                            {formatarDataHora(r.dataHora)}
                          </span>
                        </td>

                        <td className="rg-td-wrap">
                          <p className="rg-resumo" title={resumo}>{resumo}</p>
                        </td>

                        <td className="rg-center">
                          <button
                            type="button"
                            className="rg-more"
                            aria-label={`Ações para ${pauta}`}
                            onClick={() => onAcoes?.(r)}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Rodapé / paginação */}
          <footer className="rg-footer">
            <p className="rg-count">
              <IconInfo size={24} />
              {registros.length === 0
                ? `Mostrando 0 de ${totalRegistros} registros`
                : `Mostrando ${inicio + 1}–${fim} de ${totalRegistros} registros`}
            </p>

            <nav className="rg-pager" aria-label="Paginação">
              <button
                type="button"
                className="rg-page-btn"
                onClick={() => irPara(pagina - 1)}
                disabled={pagina === 1}
                aria-label="Página anterior"
              >
                <IconChevronLeft size={20} />
              </button>

              {listaPaginas(totalPaginas, pagina).map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="rg-ellipsis">...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`rg-page-btn ${pagina === p ? "is-active" : ""}`}
                    onClick={() => irPara(p)}
                    aria-current={pagina === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                className="rg-page-btn"
                onClick={() => irPara(pagina + 1)}
                disabled={pagina === totalPaginas}
                aria-label="Próxima página"
              >
                <IconChevronRight size={20} />
              </button>
            </nav>
          </footer>
        </section>
      </div>
    </main>
  );
}