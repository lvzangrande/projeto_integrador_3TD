// SALVAR COMO: <pasta da rota do filiado>/dashboard/page.jsx
//
// Componente de servidor: sem hooks e sem "use client". O filtro de período é feito por
// links (?periodo=7|30|90), então a página inteira é renderizada no servidor a partir de
// uma única chamada ao endpoint agregado (RNF010). Os gráficos são SVG puro, sem biblioteca.
import Link from "next/link";
import "../filiado.css"; // reaproveita .affiliate-eyebrow e .affiliate-home__intro da home
import "./dashboard.css";
import { getDashboardFiliado } from "./dashboard-data.js";
import {
  formatarDataHora,
  formatarDiaMes,
  formatarInteiro,
  formatarM3,
  formatarMoeda,
  formatarVolume,
  plural,
} from "./dashboard-format.js";

export const metadata = { title: "Dashboard do Filiado" };

// Ajuste estas rotas para as reais do projeto. É o único lugar com caminhos fixos.
const ROTAS = {
  home: "/filiado",
  clientes: "/filiado/clientes",
  cadastrarCliente: "/filiado/cadastrar_cliente",
  reunioes: "/filiado/historico_reunioes",
};

const PERIODOS = [7, 30, 90];
const PERIODO_PADRAO = 30;

const STATUS = {
  critico: { rotulo: "Crítico" },
  atencao: { rotulo: "Atenção" },
  normal: { rotulo: "Normal" },
};
const statusDe = (s) => (STATUS[s] ? s : "normal");

const SEVERIDADES = [
  { chave: "critico", rotulo: "Crítico", status: "critico" },
  { chave: "atencao", rotulo: "Atenção", status: "atencao" },
  { chave: "informativo", rotulo: "Informativo", status: "normal" },
];

export default async function DashboardFiliado({ searchParams }) {
  const params = (await searchParams) ?? {};
  const pedido = Number(params.periodo);
  const periodo = PERIODOS.includes(pedido) ? pedido : PERIODO_PADRAO;

  const { dados } = await getDashboardFiliado(periodo);

  return (
    <main className="aff-dash">
      <Link href={ROTAS.home} className="botao-voltar">← Voltar</Link>

      {!dados ? (
        <EstadoErro periodo={periodo} />
      ) : dados.resumo.clientesAtivos === 0 ? (
        <div className="aff-dash__corpo">
          <Cabecalho dados={dados} frase="Sua carteira ainda não tem clientes ativos." />
          <EstadoVazio />
        </div>
      ) : (
        <div className="aff-dash__corpo">
          <Cabecalho dados={dados} frase={fraseResumo(dados.resumo)} />
          <Kpis dados={dados} periodo={periodo} />
          <Graficos dados={dados} periodo={periodo} />
          <section className="aff-dash__listas" aria-label="Acompanhamento da carteira">
            <ClientesAtencao itens={dados.clientesAtencao} />
            <UltimasReunioes itens={dados.reunioes} />
          </section>
        </div>
      )}
    </main>
  );
}

function fraseResumo({ alertasAtivos, ocorrenciasAbertas }) {
  if (!alertasAtivos && !ocorrenciasAbertas) {
    return "Nenhum alerta ativo ou ocorrência aberta na sua carteira.";
  }
  return `${plural(alertasAtivos, "alerta ativo", "alertas ativos")} · ${plural(
    ocorrenciasAbertas,
    "ocorrência aberta",
    "ocorrências abertas",
  )} na sua carteira`;
}

/* ------------------------------------------------------------------ cabeçalho */

function Cabecalho({ dados, frase }) {
  const primeiroNome = dados.filiado.nome?.trim().split(/\s+/)[0];
  const temMeta = dados.simulado || dados.atualizadoEm;

  return (
    <header className="affiliate-home__intro">
      <p className="affiliate-eyebrow">PAINEL DO FILIADO</p>
      <h1>{primeiroNome ? `Olá, ${primeiroNome}` : "Bem-vindo"}</h1>
      <p>{frase}</p>
      {temMeta && (
        <div className="aff-dash__meta">
          {dados.simulado && (
            // RN007: leituras simuladas sempre identificadas.
            <span className="aff-pill aff-status--atencao" role="status">
              <IconeStatus status="atencao" /> Leituras simuladas
            </span>
          )}
          {dados.atualizadoEm && (
            <span>
              Atualizado em <time dateTime={dados.atualizadoEm}>{formatarDataHora(dados.atualizadoEm)}</time>
            </span>
          )}
        </div>
      )}
    </header>
  );
}

/* ----------------------------------------------------------------------- KPIs */

function Kpis({ dados, periodo }) {
  const { resumo, economia } = dados;
  const criticos = resumo.alertasCriticos;

  return (
    <section className="aff-dash__kpis" aria-label="Indicadores da carteira">
      <Link href={ROTAS.clientes} className="aff-kpi aff-kpi--link">
        <span className="aff-kpi__label">Clientes ativos</span>
        <strong className="aff-kpi__valor">{formatarInteiro(resumo.clientesAtivos)}</strong>
        <span className="aff-kpi__nota">Ver meus clientes →</span>
      </Link>

      <div className={`aff-kpi${criticos > 0 ? " aff-kpi--alerta" : ""}`}>
        <span className="aff-kpi__label">Alertas ativos</span>
        <strong className="aff-kpi__valor">{formatarInteiro(resumo.alertasAtivos)}</strong>
        <span className={`aff-kpi__nota aff-status--${criticos > 0 ? "critico" : "normal"}`}>
          <IconeStatus status={criticos > 0 ? "critico" : "normal"} />
          {criticos > 0 ? plural(criticos, "crítico", "críticos") : "Nenhum crítico"}
        </span>
      </div>

      <div className="aff-kpi">
        <span className="aff-kpi__label">Ocorrências abertas</span>
        <strong className="aff-kpi__valor">{formatarInteiro(resumo.ocorrenciasAbertas)}</strong>
      </div>

      <div className="aff-kpi">
        <span className="aff-kpi__label">Economia da carteira</span>
        {economia ? (
          <>
            <strong className="aff-kpi__valor">{formatarM3(economia.m3)}</strong>
            <span className="aff-kpi__nota">
              {formatarMoeda(economia.reais)} · {periodo} dias
            </span>
          </>
        ) : (
          <>
            <strong className="aff-kpi__valor">
              <span aria-hidden="true">—</span>
              <span className="aff-sr">Indisponível</span>
            </strong>
            {/* RN009: sem consumo de referência (baseline) não há como calcular a economia. */}
            <span className="aff-kpi__nota">Aguardando consumo de referência</span>
          </>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- gráficos */

function Graficos({ dados, periodo }) {
  return (
    <section className="aff-dash__graficos" aria-label="Gráficos da carteira">
      <div className="aff-panel">
        <div className="aff-panel__head">
          <div>
            <h2>Consumo da carteira</h2>
            <p>Soma diária de todos os clientes{dados.simulado ? " · leituras simuladas" : ""}</p>
          </div>
          <nav className="aff-periodos" aria-label="Período do gráfico">
            {PERIODOS.map((p) => (
              <Link
                key={p}
                href={`?periodo=${p}`}
                scroll={false}
                aria-current={p === periodo ? "true" : undefined}
              >
                {p} dias
              </Link>
            ))}
          </nav>
        </div>
        <GraficoConsumo serie={dados.consumo} periodo={periodo} />
      </div>

      <div className="aff-panel">
        <div className="aff-panel__head">
          <div>
            <h2>Alertas por severidade</h2>
            <p>Alertas ativos agora</p>
          </div>
        </div>
        <AlertasPorSeveridade valores={dados.alertasPorSeveridade} />
      </div>
    </section>
  );
}

const W = 640;
const H = 260;
const M = { t: 14, r: 16, b: 30, l: 56 };

// 1, 2, 5 × 10ⁿ: passos "redondos" para o eixo Y.
function passoBonito(bruto) {
  const exp = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

function montarGrafico(serie) {
  const n = serie.length;
  const iw = W - M.l - M.r;
  const ih = H - M.t - M.b;
  const maximo = Math.max(...serie.map((p) => p.litros), 1);
  const passo = passoBonito(maximo / 4);
  const topo = passo * Math.ceil(maximo / passo);
  const baseY = M.t + ih;
  const r1 = (v) => Math.round(v * 10) / 10;
  const x = (i) => r1(M.l + (i / (n - 1)) * iw);
  const y = (v) => r1(M.t + ih - (v / topo) * ih);

  const pontos = serie.map((p, i) => ({
    x: x(i),
    y: y(p.litros),
    titulo: `${formatarDiaMes(p.data)} · ${formatarVolume(p.litros)}`,
  }));
  const linha = pontos.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const area = `${linha} L${pontos[n - 1].x} ${baseY} L${pontos[0].x} ${baseY} Z`;

  const ticksY = Array.from({ length: Math.round(topo / passo) + 1 }, (_, k) => ({
    y: y(k * passo),
    rotulo: formatarVolume(k * passo),
  }));

  const qtdX = Math.min(5, n);
  const ticksX = Array.from({ length: qtdX }, (_, k) => {
    const i = Math.round((k * (n - 1)) / (qtdX - 1));
    return {
      x: pontos[i].x,
      rotulo: formatarDiaMes(serie[i].data),
      ancora: k === 0 ? "start" : k === qtdX - 1 ? "end" : "middle",
    };
  });

  const total = serie.reduce((s, p) => s + p.litros, 0);
  const pico = serie.reduce((a, p) => (p.litros > a.litros ? p : a), serie[0]);

  return { pontos, linha, area, ticksY, ticksX, baseY, total, media: total / n, pico };
}

function GraficoConsumo({ serie, periodo }) {
  if (serie.length < 2) {
    return <p className="aff-vazio">Sem leituras no período selecionado.</p>;
  }

  const g = montarGrafico(serie);
  const descricao = `Consumo diário da carteira nos últimos ${periodo} dias. Total ${formatarVolume(
    g.total,
  )}, média de ${formatarVolume(g.media)} por dia, pico de ${formatarVolume(g.pico.litros)} em ${formatarDiaMes(
    g.pico.data,
  )}.`;

  return (
    <>
      <dl className="aff-stats">
        <div>
          <dt>Total no período</dt>
          <dd>{formatarVolume(g.total)}</dd>
        </div>
        <div>
          <dt>Média diária</dt>
          <dd>{formatarVolume(g.media)}</dd>
        </div>
        <div>
          <dt>Pico</dt>
          <dd>
            {formatarVolume(g.pico.litros)} <span className="aff-stats__data">em {formatarDiaMes(g.pico.data)}</span>
          </dd>
        </div>
      </dl>

      <div className="aff-chart" role="region" aria-label="Gráfico de consumo (role para o lado para ver tudo)" tabIndex={0}>
        <svg className="aff-chart__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={descricao}>
          <defs>
            <linearGradient id="aff-grad-consumo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="aff-chart__stop aff-chart__stop--topo" />
              <stop offset="100%" className="aff-chart__stop aff-chart__stop--base" />
            </linearGradient>
          </defs>

          {g.ticksY.map((t, i) => (
            <g key={i}>
              <line className="aff-chart__grid" x1={M.l} x2={W - M.r} y1={t.y} y2={t.y} />
              <text className="aff-chart__tick" x={M.l - 8} y={t.y} textAnchor="end" dominantBaseline="middle">
                {t.rotulo}
              </text>
            </g>
          ))}

          {g.ticksX.map((t, i) => (
            <text key={i} className="aff-chart__tick" x={t.x} y={H - 8} textAnchor={t.ancora}>
              {t.rotulo}
            </text>
          ))}

          <path className="aff-chart__area" d={g.area} fill="url(#aff-grad-consumo)" />
          <path className="aff-chart__linha" d={g.linha} fill="none" />

          {/* Áreas de hover: o navegador mostra o <title> como dica, sem JavaScript. */}
          {g.pontos.map((p, i) => (
            <circle key={i} className="aff-chart__hit" cx={p.x} cy={p.y} r="5">
              <title>{p.titulo}</title>
            </circle>
          ))}
        </svg>
      </div>
    </>
  );
}

function AlertasPorSeveridade({ valores }) {
  const total = SEVERIDADES.reduce((soma, s) => soma + valores[s.chave], 0);

  if (!total) {
    return (
      <p className="aff-vazio aff-status--normal">
        <IconeStatus status="normal" /> Nenhum alerta ativo na carteira.
      </p>
    );
  }

  const maior = Math.max(...SEVERIDADES.map((s) => valores[s.chave]));

  return (
    <ul className="aff-sev">
      {SEVERIDADES.map(({ chave, rotulo, status }) => (
        <li key={chave} className={`aff-sev__item aff-status--${status}`}>
          <span className="aff-sev__rotulo">
            <IconeStatus status={status} /> {rotulo}
          </span>
          <span className="aff-sev__valor">{formatarInteiro(valores[chave])}</span>
          <span className="aff-sev__trilho" aria-hidden="true">
            <span className="aff-sev__barra" style={{ width: `${(valores[chave] / maior) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------------- listas */

function ClientesAtencao({ itens }) {
  return (
    <div className="aff-panel">
      <div className="aff-panel__head">
        <div>
          <h2>Clientes que precisam de atenção</h2>
          <p>Pior status primeiro</p>
        </div>
        <Link href={ROTAS.clientes} className="aff-link">Ver todos →</Link>
      </div>

      {itens.length === 0 ? (
        <p className="aff-vazio aff-status--normal">
          <IconeStatus status="normal" /> Nenhum cliente precisa de atenção agora.
        </p>
      ) : (
        <ul className="aff-lista">
          {itens.slice(0, 5).map((c) => {
            const status = statusDe(c.status);
            return (
              <li key={c.id}>
                <Link href={ROTAS.clientes} className={`aff-linha aff-status--${status}`}>
                  <IconeStatus status={status} />
                  <span className="aff-linha__nome">{c.nome}</span>
                  <span className="aff-linha__status">{STATUS[status].rotulo}</span>
                  <span className="aff-linha__meta">{plural(c.alertas, "alerta", "alertas")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function UltimasReunioes({ itens }) {
  return (
    <div className="aff-panel">
      <div className="aff-panel__head">
        <div>
          <h2>Últimas reuniões</h2>
          <p>Com os próximos passos combinados</p>
        </div>
        <Link href={ROTAS.reunioes} className="aff-link">Ver histórico →</Link>
      </div>

      {itens.length === 0 ? (
        <p className="aff-vazio">Nenhuma reunião registrada ainda.</p>
      ) : (
        <ul className="aff-lista">
          {itens.slice(0, 3).map((r) => (
            <li key={r.id} className="aff-reuniao">
              <div className="aff-reuniao__topo">
                <strong>{r.cliente}</strong>
                <time dateTime={r.data}>{formatarDataHora(r.data)}</time>
              </div>
              <p>{r.proximosPassos || "Sem próximos passos registrados."}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------- estados */

function EstadoVazio() {
  return (
    <section className="aff-panel aff-estado" aria-labelledby="aff-vazio-titulo">
      <h2 id="aff-vazio-titulo">Nenhum cliente ainda</h2>
      <p>Cadastre seu primeiro cliente para acompanhar consumo, alertas e economia da carteira aqui.</p>
      <Link href={ROTAS.cadastrarCliente} className="aff-btn">Cadastrar cliente</Link>
    </section>
  );
}

function EstadoErro({ periodo }) {
  return (
    <section className="aff-panel aff-estado" role="alert">
      <h2>Não foi possível carregar o dashboard</h2>
      <p>Os dados da sua carteira não responderam a tempo. Tente novamente em instantes.</p>
      {/* <a> de propósito: força uma nova requisição ao servidor, o Link poderia reaproveitar o cache. */}
      <a href={`?periodo=${periodo}`} className="aff-btn aff-btn--sec">Tentar novamente</a>
    </section>
  );
}

/* ---------------------------------------------------------------------- ícones */

// Status nunca depende só da cor (daltonismo): cada nível tem forma própria
// (triângulo, losango, círculo) e sempre vem acompanhado de texto.
function IconeStatus({ status }) {
  const formas = {
    critico: (
      <>
        <path d="M12 3.5 21.5 20h-19z" />
        <path d="M12 10v4.5M12 17.2v.1" />
      </>
    ),
    atencao: (
      <>
        <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" />
        <path d="M12 8v5M12 15.8v.1" />
      </>
    ),
    normal: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.3 2.8 2.8 5.5-5.6" />
      </>
    ),
  };

  return (
    <svg
      className="aff-icone"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {formas[statusDe(status)]}
    </svg>
  );
}
