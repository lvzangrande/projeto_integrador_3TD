// SALVAR COMO: <pasta da rota do filiado>/dashboard/page.jsx
//
// Componente de servidor. O dashboard fica sem integração com backend e apresenta estado vazio
// enquanto não há uma fonte local de cadastros. O gráfico de cadastros usa Chart.js no cliente.
import Link from "next/link";
import "../filiado.css"; // reaproveita .affiliate-eyebrow e .affiliate-home__intro da home
import "./dashboard.css";
import BotaoVoltar from "@/components/BotaoDeVoltar/BotaoDeVoltar.jsx";
import ConsumoLineChart from "./ConsumoLineChart.jsx";
import {
  formatarDataHora,
  formatarDiaMes,
  formatarInteiro,
  formatarM3,
  formatarMoeda,
  plural,
} from "./dashboard-format.js";

export const metadata = { title: "Dashboard do Filiado" };

// Ajuste estas rotas para as reais do projeto. É o único lugar com caminhos fixos.
const ROTAS = {
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
  const solicitado = Number(params.periodo);
  const periodo = PERIODOS.includes(solicitado) ? solicitado : PERIODO_PADRAO;
  // Dashboard sem integração: mantém o estado inicial até a fonte local de dados ser definida.
  const dados = {
    filiado: { nome: "" },
    resumo: { clientesAtivos: 0, alertasAtivos: 0, alertasCriticos: 0, ocorrenciasAbertas: 0 },
    economia: null,
    cadastros: [],
    alertasPorSeveridade: { critico: 0, atencao: 0, informativo: 0 },
    clientesAtencao: [],
    reunioes: [],
  };

  return (
    <main className="aff-dash">
      <BotaoVoltar />

      {dados.resumo.clientesAtivos === 0 ? (
        <div className="aff-dash__corpo">
          <Cabecalho dados={dados} frase="Sua carteira ainda não tem clientes ativos." />
          <section className="aff-panel" aria-labelledby="aff-cadastros-titulo">
            <div className="aff-panel__head"><div><h2 id="aff-cadastros-titulo">Novos clientes cadastrados</h2><p>Quantidade de cadastros por dia</p></div></div>
            <GraficoCadastros serie={dados.cadastros} periodo={periodo} />
            {dados.cadastros.length === 0 && (
              <Link href={ROTAS.cadastrarCliente} className="aff-btn">Cadastrar cliente</Link>
            )}
          </section>
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
        <span className="aff-kpi__label">Clientes cadastrados</span>
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
            <h2>Novos clientes cadastrados</h2>
            <p>Quantidade de cadastros por dia{dados.simulado ? " · dados ilustrativos" : ""}</p>
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
        <GraficoCadastros serie={dados.cadastros} periodo={periodo} />
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

function GraficoCadastros({ serie, periodo }) {
  if (serie.length < 2) {
    return <p className="aff-vazio">Ainda não há dados de cadastros para exibir neste período.</p>;
  }

  const total = serie.reduce((soma, ponto) => soma + (Number(ponto.clientes) || 0), 0);
  const maiorDia = serie.reduce((maior, ponto) => (ponto.clientes > maior.clientes ? ponto : maior), serie[0]);

  return (
    <>
      <dl className="aff-stats">
        <div>
          <dt>Cadastros no período</dt>
          <dd>{formatarInteiro(total)}</dd>
        </div>
        <div>
          <dt>Média diária</dt>
          <dd>{formatarInteiro(total / periodo)}</dd>
        </div>
        <div>
          <dt>Pico</dt>
          <dd>
            {formatarInteiro(maiorDia.clientes)} <span className="aff-stats__data">em {formatarDiaMes(maiorDia.data)}</span>
          </dd>
        </div>
      </dl>

      <div className="aff-chart" role="region" aria-label={`Gráfico de cadastros de clientes nos últimos ${periodo} dias`} tabIndex={0}>
        <ConsumoLineChart serie={serie} formatarDiaMes={formatarDiaMes} formatarInteiro={formatarInteiro} />
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
