"use client";

import { useMemo, useState } from "react";
import "./filitable.css";

const registros = [
  { id: 1, dataHora: "04/11/2025 – 14:30", estacao: "ETA Centro", tipo: "eta", nivel: 82, vazao: "420.5", status: "Operacional" },
  { id: 2, dataHora: "04/11/2025 – 14:15", estacao: "Reservatório Norte", tipo: "reservatorio", nivel: 76, vazao: "388.2", status: "Atenção" },
  { id: 3, dataHora: "04/11/2025 – 14:00", estacao: "ETA Sul", tipo: "eta", nivel: 71, vazao: "350.7", status: "Operacional" },
  { id: 4, dataHora: "04/11/2025 – 13:45", estacao: "Reservatório Leste", tipo: "reservatorio", nivel: 85, vazao: "402.1", status: "Operacional" },
  { id: 5, dataHora: "04/11/2025 – 13:30", estacao: "ETA Centro", tipo: "eta", nivel: 79, vazao: "375.3", status: "Operacional" },
];

const TOTAL_REGISTROS = 125;
const TOTAL_PAGINAS = 25;

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
const IconWaves = (p) => (
  <Icon {...p}>
    <path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    <path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
  </Icon>
);
const IconGauge = (p) => (
  <Icon {...p}>
    <path d="M4 18a9 9 0 1 1 16 0" />
    <path d="M12 14l4-5" />
    <path d="M12 6v1.5M6.3 8.3l1 1M17.7 8.3l-1 1" />
  </Icon>
);
const IconPlant = (p) => (
  <Icon {...p}>
    <path d="M3 21V9l6-3v15" />
    <path d="M9 21V12l6-3v12" />
    <path d="M15 21v-8h6v8" />
    <path d="M2 21h20M5.5 12h1M5.5 15.5h1M11.5 15h1M17.5 16h1" />
  </Icon>
);
const IconTower = (p) => (
  <Icon {...p}>
    <path d="M6 3h12l-1.5 6h-9L6 3z" />
    <path d="M9 9l3 4 3-4M9 21l3-8 3 8M8 21h8M10 17h4" />
  </Icon>
);
const IconDrop = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <linearGradient id="ft-drop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5fe0ff" />
        <stop offset="1" stopColor="#0a7fd6" />
      </linearGradient>
    </defs>
    <path
      d="M32 4C24 18 14 28 14 40a18 18 0 0 0 36 0C50 28 40 18 32 4z"
      fill="url(#ft-drop)"
    />
    <path
      d="M30 22c-5 8-10 13-10 20 0 5 3 9 8 10-4-4-4-9-1-15 2-4 3-8 3-15z"
      fill="#06304f"
      opacity=".45"
    />
  </svg>
);

/* ---------- Componente ---------- */
export default function Filitable() {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return registros;
    return registros.filter((r) =>
      [r.estacao, r.dataHora, r.status].some((campo) =>
        campo.toLowerCase().includes(termo)
      )
    );
  }, [busca]);

  const irPara = (p) => setPagina(Math.min(Math.max(p, 1), TOTAL_PAGINAS));

  return (
    <main className="ft-page">
      <div className="ft-container">
        {/* Cabeçalho */}
        <header className="ft-header">
          <div className="ft-brand">
            <IconDrop />
            <span className="ft-brand__divider" />
            <div>
              <h1 className="ft-title">Registros de Monitoramento</h1>
              <p className="ft-subtitle">
                Acompanhe o histórico e o desempenho dos reservatórios
              </p>
            </div>
          </div>

          <div className="ft-tools">
            <label className="ft-search">
              <IconSearch size={22} />
              <input
                type="search"
                placeholder="Buscar por estação, data ou status..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>

            <button type="button" className="ft-btn ft-btn--icon" aria-label="Filtrar">
              <IconFilter size={22} />
            </button>

            <button type="button" className="ft-btn ft-btn--period">
              <IconCalendar size={22} />
              <span>Últimos 30 dias</span>
              <IconChevronDown size={18} />
            </button>
          </div>
        </header>

        {/* Tabela */}
        <section className="ft-card">
          <div className="ft-scroll">
            <table className="ft-table">
              <thead>
                <tr>
                  <th><span className="ft-th"><IconCalendar size={26} />Data e Hora</span></th>
                  <th><span className="ft-th"><IconPlant size={28} />Estação</span></th>
                  <th><span className="ft-th"><IconWaves size={28} />Nível do Reservatório</span></th>
                  <th><span className="ft-th"><IconGauge size={28} />Vazão (L/s)</span></th>
                  <th><span className="ft-th"><span className="ft-dot ft-dot--blue" />Status</span></th>
                  <th className="ft-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {linhas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="ft-empty">
                      Nenhum registro encontrado. Tente outro termo de busca.
                    </td>
                  </tr>
                )}

                {linhas.map((r) => {
                  const atencao = r.status === "Atenção";
                  return (
                    <tr key={r.id} className={atencao ? "ft-row ft-row--alert" : "ft-row"}>
                      <td>
                        <span className="ft-cell">
                          <IconClock size={26} className="ft-muted" />
                          {r.dataHora}
                        </span>
                      </td>

                      <td>
                        <span className="ft-cell">
                          {r.tipo === "eta" ? <IconPlant size={30} className="ft-muted" /> : <IconTower size={30} className="ft-muted" />}
                          {r.estacao}
                        </span>
                      </td>

                      <td>
                        <span className="ft-cell ft-level">
                          <strong>{r.nivel}%</strong>
                          <span
                            className="ft-bar"
                            role="progressbar"
                            aria-valuenow={r.nivel}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Nível de ${r.estacao}`}
                          >
                            <span className="ft-bar__fill" style={{ width: `${r.nivel}%` }} />
                          </span>
                        </span>
                      </td>

                      <td>{r.vazao}</td>

                      <td>
                        <span className={`ft-status ${atencao ? "ft-status--warn" : "ft-status--ok"}`}>
                          <span className={`ft-dot ${atencao ? "ft-dot--blue" : "ft-dot--green"}`} />
                          {r.status}
                        </span>
                      </td>

                      <td className="ft-center">
                        <button type="button" className="ft-more" aria-label={`Ações para ${r.estacao}`}>
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
          <footer className="ft-footer">
            <p className="ft-count">
              <IconInfo size={24} />
              Mostrando {(pagina - 1) * 5 + 1}–{Math.min(pagina * 5, TOTAL_REGISTROS)} de {TOTAL_REGISTROS} registros
            </p>

            <nav className="ft-pager" aria-label="Paginação">
              <button type="button" className="ft-page-btn ft-page-btn--arrow" onClick={() => irPara(pagina - 1)} aria-label="Página anterior">
                <IconChevronLeft size={20} />
              </button>

              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`ft-page-btn ${pagina === p ? "is-active" : ""}`}
                  onClick={() => irPara(p)}
                  aria-current={pagina === p ? "page" : undefined}
                >
                  {p}
                </button>
              ))}

              <span className="ft-ellipsis">...</span>

              <button
                type="button"
                className={`ft-page-btn ${pagina === TOTAL_PAGINAS ? "is-active" : ""}`}
                onClick={() => irPara(TOTAL_PAGINAS)}
              >
                {TOTAL_PAGINAS}
              </button>

              <button type="button" className="ft-page-btn ft-page-btn--arrow" onClick={() => irPara(pagina + 1)} aria-label="Próxima página">
                <IconChevronRight size={20} />
              </button>
            </nav>
          </footer>
        </section>
      </div>
    </main>
  );
}