"use client";

import { useState } from "react";
import "./registrostable.css";

/* ---------- Tipos de registro ---------- */
const TIPOS = {
  reuniao: { label: "Reunião", icon: "users" },
  vistoria: { label: "Vistoria", icon: "eye" },
  ocorrencia: { label: "Ocorrência", icon: "alert" },
  manutencao: { label: "Manutenção", icon: "wrench" },
  treinamento: { label: "Treinamento", icon: "book" },
};

/* ---------- Dados de exemplo (substituir pela resposta da API) ---------- */
const registros = [
  {
    id: 1,
    tipo: "reuniao",
    pauta: "Alinhamento semanal de operação",
    cliente: { nome: "Prefeitura de Mauá", empresa: "Contrato municipal" },
    dataHora: "05/11/2026 – 14:30",
    resumo: "Revisão dos níveis dos reservatórios da semana e definição das prioridades de manutenção preventiva para as ETAs Centro e Sul.",
  },
  {
    id: 2,
    tipo: "ocorrencia",
    pauta: "Queda de pressão no Reservatório Norte",
    cliente: { nome: "Condomínio Vila Verde", empresa: "Região Norte" },
    dataHora: "05/11/2026 – 11:10",
    resumo: "Identificada queda de pressão na saída do reservatório. Suspeita de vazamento na adutora principal, equipe isolou o trecho.",
  },
  {
    id: 3,
    tipo: "vistoria",
    pauta: "Inspeção de rotina – Reservatório Leste",
    cliente: { nome: "Indústria Aquatec", empresa: "Região Leste" },
    dataHora: "04/11/2026 – 16:45",
    resumo: "Estrutura em boas condições. Pequena infiltração observada na junta da tampa de inspeção, sem risco imediato.",
  },
  {
    id: 4,
    tipo: "manutencao",
    pauta: "Troca de bomba dosadora – ETA Centro",
    cliente: { nome: "Hospital São Lucas", empresa: "Região Centro" },
    dataHora: "04/11/2026 – 09:00",
    resumo: "Substituição da bomba dosadora de cloro por unidade nova. Testes de vazão realizados com resultados dentro do esperado.",
  },
  {
    id: 5,
    tipo: "treinamento",
    pauta: "Capacitação em segurança de ETA",
    cliente: { nome: "Cooperativa Água Viva", empresa: "Região Sul" },
    dataHora: "03/11/2026 – 15:20",
    resumo: "Treinamento sobre manuseio de produtos químicos e protocolos de emergência, com participação de 18 operadores.",
  },
  {
    id: 6,
    tipo: "reuniao",
    pauta: "Planejamento de expansão da rede Sul",
    cliente: { nome: "Prefeitura de Mauá", empresa: "Contrato municipal" },
    dataHora: "03/11/2026 – 10:05",
    resumo: "Discussão sobre cronograma e orçamento da expansão da rede. Definidos responsáveis por levantamento topográfico e licenciamento.",
  },
  {
    id: 7,
    tipo: "ocorrencia",
    pauta: "Turbidez acima do limite na entrada",
    cliente: { nome: "Indústria Aquatec", empresa: "Região Leste" },
    dataHora: "02/11/2026 – 17:40",
    resumo: "Turbidez da água bruta elevou-se após chuvas intensas. Ajuste de coagulante realizado e monitoramento reforçado a cada hora.",
  },
  {
    id: 8,
    tipo: "vistoria",
    pauta: "Verificação de sensores de nível",
    cliente: { nome: "Condomínio Vila Verde", empresa: "Região Norte" },
    dataHora: "02/11/2026 – 08:30",
    resumo: "Sensores dos reservatórios Norte e Leste aferidos. Um dos sensores apresentou desvio de 3% e foi recalibrado.",
  },
  {
    id: 9,
    tipo: "manutencao",
    pauta: "Limpeza programada – Reservatório Norte",
    cliente: { nome: "Hospital São Lucas", empresa: "Região Centro" },
    dataHora: "31/10/2026 – 13:15",
    resumo: "Esvaziamento parcial e limpeza das paredes internas. Nenhum dano estrutural encontrado durante o procedimento.",
  },
  {
    id: 10,
    tipo: "treinamento",
    pauta: "Uso do novo painel de monitoramento",
    cliente: { nome: "Cooperativa Água Viva", empresa: "Região Sul" },
    dataHora: "30/10/2026 – 15:00",
    resumo: "Apresentação das novas funcionalidades do painel e exercícios práticos de leitura de alertas com a equipe de plantão.",
  },
  {
    id: 11,
    tipo: "reuniao",
    pauta: "Revisão de indicadores mensais",
    cliente: { nome: "Prefeitura de Mauá", empresa: "Contrato municipal" },
    dataHora: "29/10/2026 – 09:45",
    resumo: "Análise de vazão, perdas e atendimento às metas do mês. Pontos de atenção levantados na região Norte.",
  },
  {
    id: 12,
    tipo: "ocorrencia",
    pauta: "Falha de comunicação na telemetria",
    cliente: { nome: "Indústria Aquatec", empresa: "Região Leste" },
    dataHora: "28/10/2026 – 12:20",
    resumo: "Perda intermitente de sinal da telemetria na ETA Sul. Roteador substituído e comunicação restabelecida após testes.",
  },
];

const POR_PAGINA = 5;

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
};

/* ---------- Utilitários ---------- */
function iniciais(nome) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
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
 * A filtragem (busca, tipo e período) será feita pela API do backend.
 * Os controles abaixo apenas guardam o valor digitado/selecionado no estado,
 * prontos para serem enviados como parâmetros da requisição.
 */
export default function RegistrosTable() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [pagina, setPagina] = useState(1);

  // TODO: substituir por dados vindos da API (ex.: fetch com busca, tipo e pagina)
  const total = registros.length;
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const linhas = registros.slice(inicio, inicio + POR_PAGINA);

  const irPara = (p) => setPagina(Math.min(Math.max(p, 1), totalPaginas));

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
            onClick={() => setTipo("todos")}
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
                onClick={() => setTipo(chave)}
              >
                <Ico size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tabela */}
        <section className="rg-card">
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
                {linhas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="rg-empty">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}

                {linhas.map((r) => {
                  const t = TIPOS[r.tipo];
                  const IcoTipo = ICONES_TIPO[t.icon];
                  const alerta = r.tipo === "ocorrencia";

                  return (
                    <tr key={r.id} className={alerta ? "rg-row rg-row--alert" : "rg-row"}>
                      <td>
                        <span className={`rg-tipo rg-tipo--${r.tipo}`}>
                          <IcoTipo size={22} />
                          {t.label}
                        </span>
                      </td>

                      <td>
                        <span className="rg-pauta">{r.pauta}</span>
                      </td>

                      <td>
                        <span className="rg-user">
                          <span className="rg-avatar" aria-hidden="true">{iniciais(r.cliente.nome)}</span>
                          <span className="rg-user__info">
                            <span>{r.cliente.nome}</span>
                            <span className="rg-user__role">{r.cliente.empresa}</span>
                          </span>
                        </span>
                      </td>

                      <td>
                        <span className="rg-cell">
                          <IconClock size={26} className="rg-muted" />
                          {r.dataHora}
                        </span>
                      </td>

                      <td className="rg-td-wrap">
                        <p className="rg-resumo" title={r.resumo}>{r.resumo}</p>
                      </td>

                      <td className="rg-center">
                        <button type="button" className="rg-more" aria-label={`Ações para ${r.pauta}`}>
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
              {total === 0
                ? "Mostrando 0 de 0 registros"
                : `Mostrando ${inicio + 1}–${Math.min(inicio + POR_PAGINA, total)} de ${total} registros`}
            </p>

            <nav className="rg-pager" aria-label="Paginação">
              <button
                type="button"
                className="rg-page-btn"
                onClick={() => irPara(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
              >
                <IconChevronLeft size={20} />
              </button>

              {listaPaginas(totalPaginas, paginaAtual).map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="rg-ellipsis">...</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`rg-page-btn ${paginaAtual === p ? "is-active" : ""}`}
                    onClick={() => irPara(p)}
                    aria-current={paginaAtual === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                className="rg-page-btn"
                onClick={() => irPara(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
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