"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import "./admin.css";
import OceanBackground from "./OceanBackground";

const sections = [
  { id: "visao", label: "Visão global" },
  { id: "reservatorios", label: "Reservatórios" },
  { id: "rede", label: "Rede" },
  { id: "qualidade", label: "Qualidade" },
  { id: "consumo", label: "Consumo" },
  { id: "alertas", label: "Alertas", badge: "2" },
  { id: "relatorios", label: "Relatórios" },
  { id: "configuracoes", label: "Configurações" },
];
const reservoirs = [
  {
    name: "Reservatório Centro",
    area: "São Paulo · Centro",
    level: 92,
    state: "Normal",
  },
  {
    name: "Reservatório Norte",
    area: "São Paulo · Santana",
    level: 78,
    state: "Normal",
  },
  {
    name: "Reservatório Sul",
    area: "São Paulo · Santo Amaro",
    level: 65,
    state: "Normal",
  },
  {
    name: "Reservatório Leste",
    area: "São Paulo · Tatuapé",
    level: 54,
    state: "Normal",
  },
  {
    name: "Reservatório Oeste",
    area: "São Paulo · Lapa",
    level: 41,
    state: "Atenção",
  },
  {
    name: "Reservatório Industrial",
    area: "Guarulhos · Cumbica",
    level: 37,
    state: "Atenção",
  },
  {
    name: "Reservatório Rural",
    area: "Mairiporã · Terra Preta",
    level: 28,
    state: "Crítico",
  },
];
const alerts = [
  {
    type: "Crítico",
    title: "Nível abaixo do limite",
    place: "Reservatório Rural",
    time: "há 4 min",
    icon: "!",
  },
  {
    type: "Crítico",
    title: "Pressão irregular na rede",
    place: "Setor Industrial · Linha 04",
    time: "há 12 min",
    icon: "!",
  },
  {
    type: "Atenção",
    title: "Nível em queda",
    place: "Reservatório Industrial",
    time: "há 26 min",
    icon: "↓",
  },
];
const pageTitles = {
  visao: ["Visão global", "Acompanhe a operação da sua rede em tempo real."],
  reservatorios: [
    "Reservatórios",
    "Níveis, capacidade e situação operacional.",
  ],
  rede: ["Rede de distribuição", "Status dos setores e pressão da rede."],
  qualidade: [
    "Qualidade da água",
    "Indicadores de monitoramento da qualidade.",
  ],
  consumo: ["Consumo de água", "Volume distribuído e tendências de consumo."],
  alertas: ["Central de alertas", "Ocorrências que precisam da sua atenção."],
  relatorios: ["Relatórios", "Resumo operacional e dados da sua rede."],
  configuracoes: ["Configurações", "Preferências e parâmetros do sistema."],
};

function Icon({ name, size = 18 }) {
  const paths = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    drop: (
      <>
        <path d="M12 22a8 8 0 0 0 8-8c0-4-8-13-8-13S4 10 4 14a8 8 0 0 0 8 8Z" />
        <path d="M8 15a4 4 0 0 0 4 4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ConsumptionChart() {
  return (
    <div
      className="chart-wrap"
      role="img"
      aria-label="Gráfico de consumo de água ao longo do dia"
    >
      <div className="chart-y-label">ML</div>
      <div className="chart-y-axis">
        <span>3,0</span>
        <span>2,5</span>
        <span>2,0</span>
        <span>1,5</span>
        <span>1,0</span>
        <span>0,5</span>
        <span>0,0</span>
      </div>
      <div className="chart-plot">
        <div className="chart-grid">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <svg
          viewBox="0 0 720 250"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="waterFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#27c0cf" stopOpacity=".30" />
              <stop offset="100%" stopColor="#27c0cf" stopOpacity=".035" />
            </linearGradient>
          </defs>
          <path
            className="chart-area"
            d="M0 202 C30 204 42 206 66 209 S106 214 132 211 S170 208 198 188 S240 150 264 119 S302 92 330 98 S370 83 396 81 S435 61 462 39 S505 26 530 44 S567 67 594 64 S628 75 654 79 S692 71 720 56 L720 250 L0 250 Z"
          />
          <path
            className="chart-line"
            d="M0 202 C30 204 42 206 66 209 S106 214 132 211 S170 208 198 188 S240 150 264 119 S302 92 330 98 S370 83 396 81 S435 61 462 39 S505 26 530 44 S567 67 594 64 S628 75 654 79 S692 71 720 56"
          />
          <circle cx="462" cy="39" r="4" className="chart-dot" />
        </svg>
        <div className="chart-x-axis">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
}

function ReservoirList({ compact = false, query = "" }) {
  const list = useMemo(
    () =>
      reservoirs.filter((r) =>
        `${r.name} ${r.area}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <div className={`reservoir-list ${compact ? "compact" : ""}`}>
      {list.map((item) => (
        <div className="reservoir-row" key={item.name}>
          <div className="reservoir-label">
            <span>{item.name}</span>
            {!compact && <small>{item.area}</small>}
          </div>
          <div className="level-track">
            <span
              className={
                item.level < 35 ? "low" : item.level < 45 ? "warning" : ""
              }
              style={{ width: `${item.level}%` }}
            />
          </div>
          <strong className={item.level < 35 ? "level-low" : ""}>
            {item.level}%
          </strong>
          {!compact && (
            <span className={`mini-status ${item.state.toLowerCase()}`}>
              {item.state}
            </span>
          )}
        </div>
      ))}
      {list.length === 0 && (
        <div className="empty-state">Nenhum reservatório encontrado.</div>
      )}
    </div>
  );
}
function AlertList({ limit }) {
  return (
    <div className="alert-list">
      {alerts.slice(0, limit).map((alert) => (
        <article
          className={`alert-row ${alert.type.toLowerCase()}`}
          key={alert.title}
        >
          <span className="alert-symbol">{alert.icon}</span>
          <div className="alert-copy">
            <div className="alert-heading">
              <strong>{alert.title}</strong>
              <span className={`severity ${alert.type.toLowerCase()}`}>
                {alert.type}
              </span>
            </div>
            <p>{alert.place}</p>
          </div>
          <time>{alert.time}</time>
        </article>
      ))}
    </div>
  );
}
function GlobalView() {
  return (
    <>
      <section className="metric-grid" aria-label="Indicadores principais">
        <article className="metric-card">
          <span className="metric-icon">
            <Icon name="drop" size={20} />
          </span>
          <div>
            <p>Consumo hoje</p>
            <strong>
              12,48 <small>ML</small>
            </strong>
            <span className="metric-note">
              <b>↘ 4,2%</b> vs. ontem
            </span>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon">
            <span className="tank-icon">▤</span>
          </span>
          <div>
            <p>Reservatórios ativos</p>
            <strong>
              7 <small>/ 7</small>
            </strong>
            <span className="metric-note">
              <b>100%</b> da capacidade monitorada
            </span>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon alert-metric">
            <Icon name="bell" size={20} />
          </span>
          <div>
            <p>Alertas críticos</p>
            <strong className="metric-critical">2</strong>
            <span className="metric-note">
              <b className="attention">3 alertas</b> aguardando análise
            </span>
          </div>
        </article>
      </section>
      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DISTRIBUIÇÃO · ÚLTIMAS 24H</p>
              <h2>Consumo de água</h2>
            </div>
            <button className="select-button" type="button">
              Hoje <span>⌄</span>
            </button>
          </div>
          <div className="chart-legend">
            <span />
            <b>Consumo total</b>
            <span className="legend-value">12,48 ML</span>
          </div>
          <ConsumptionChart />
        </article>
        <article className="panel levels-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CAPACIDADE EM TEMPO REAL</p>
              <h2>Nível dos reservatórios</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Mais opções"
              type="button"
            >
              <Icon name="more" />
            </button>
          </div>
          <ReservoirList compact />
          <button
            className="text-link"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("wapi-section", { detail: "reservatorios" }),
              )
            }
          >
            Ver todos os reservatórios <span>→</span>
          </button>
        </article>
      </section>
      <section className="panel alerts-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">MONITORAMENTO DA REDE</p>
            <h2>
              Alertas recentes <span className="count-pill">3</span>
            </h2>
          </div>
          <button
            className="text-link"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("wapi-section", { detail: "alertas" }),
              )
            }
          >
            Ver central de alertas <span>→</span>
          </button>
        </div>
        <AlertList limit={2} />
      </section>
    </>
  );
}
function SectionView({ section }) {
  const [query, setQuery] = useState("");
  if (section === "reservatorios")
    return (
      <section className="panel section-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">7 UNIDADES MONITORADAS</p>
            <h2>Nível e situação operacional</h2>
          </div>
          <label className="search-box">
            <Icon name="search" size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar reservatório"
            />
          </label>
        </div>
        <ReservoirList query={query} />
      </section>
    );
  if (section === "alertas")
    return (
      <section className="panel section-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">3 OCORRÊNCIAS ATIVAS</p>
            <h2>Alertas da rede</h2>
          </div>
          <span className="live-pill">
            <i /> Ao vivo
          </span>
        </div>
        <AlertList limit={3} />
      </section>
    );
  const detail = {
    rede: {
      stat: "98,7%",
      label: "Disponibilidade da rede",
      secondary: "6 setores operando normalmente",
      icon: "↗",
    },
    qualidade: {
      stat: "Dentro do padrão",
      label: "Qualidade monitorada",
      secondary: "Última leitura há 2 minutos",
      icon: "✓",
    },
    consumo: {
      stat: "12,48 ML",
      label: "Consumo acumulado hoje",
      secondary: "4,2% abaixo de ontem",
      icon: "↘",
    },
    relatorios: {
      stat: "Relatório diário",
      label: "Resumo de operação",
      secondary: "Dados atualizados até agora",
      icon: "↓",
    },
    configuracoes: {
      stat: "Monitoramento ativo",
      label: "Preferências do sistema",
      secondary: "Fuso horário · Brasília (GMT−3)",
      icon: "⚙",
    },
  }[section] || {
    stat: "Em operação",
    label: "Status do sistema",
    secondary: "Dados atualizados em tempo real",
    icon: "✓",
  };
  return (
    <div className="section-overview">
      <section className="panel section-highlight">
        <div className="highlight-symbol">{detail.icon}</div>
        <p className="eyebrow">{pageTitles[section][0].toUpperCase()}</p>
        <h2>{detail.stat}</h2>
        <p>{detail.label}</p>
        <span className="highlight-note">
          <i />
          {detail.secondary}
        </span>
      </section>
      <section className="panel section-chart">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">RESUMO OPERACIONAL</p>
            <h2>Atividade de hoje</h2>
          </div>
          <span className="date-label">11 NOV 2026</span>
        </div>
        <ConsumptionChart />
      </section>
    </div>
  );
}
export default function AdminDashboard() {
  const [active, setActive] = useState("visao");
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const navigate = (event) => setActive(event.detail);
    window.addEventListener("wapi-section", navigate);
    return () => window.removeEventListener("wapi-section", navigate);
  }, []);
  const title = pageTitles[active];
  return (
    <main className="wapi-app">
      <OceanBackground />
      <header className="topbar">
        <a
          className="brand"
          href="/admin"
          aria-label="WAPI Water Control início"
        >
          <Image
            src="/logo-wapi.png"
            alt="WAPI Water Control"
            width={147}
            height={62}
            priority
          />
        </a>
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Abrir navegação"
        >
          ☰
        </button>
        <nav
          className={`main-nav ${mobileMenu ? "open" : ""}`}
          aria-label="Navegação administrativa"
        >
          {sections.map((item) => (
            <button
              key={item.id}
              className={active === item.id ? "active" : ""}
              onClick={() => {
                setActive(item.id);
                setMobileMenu(false);
              }}
            >
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </header>
      <div className="page-shell">
        <div className="page-title">
          <div>
            <h1>{title[0]}</h1>
          </div>
        </div>
        {active === "visao" ? <GlobalView /> : <SectionView section={active} />}
      </div>
    </main>
  );
}
