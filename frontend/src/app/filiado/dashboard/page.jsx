"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
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

const paraDataLocal = (valor) => valor ? new Date(String(valor).replace(" ", "T")) : null;
const chaveData = (valor) => {
  const data = paraDataLocal(valor);
  return data && !Number.isNaN(data.getTime())
    ? `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`
    : "";
};

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

export default function DashboardFiliado() {
  const [clientes, setClientes] = useState([]);
  const [reunioes, setReunioes] = useState([]);
  const [filiado, setFiliado] = useState({ nome: "" });
  const [periodo, setPeriodo] = useState(PERIODO_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([apiRequest("/usuario"), apiRequest("/reunioes"), apiRequest("/auth/me")])
      .then(([clientesApi, reunioesApi, usuario]) => {
        if (!ativo) return;
        setClientes(Array.isArray(clientesApi) ? clientesApi : []);
        setReunioes(Array.isArray(reunioesApi) ? reunioesApi : []);
        setFiliado(usuario);
      })
      .catch((errorApi) => { if (ativo) setErro(errorApi.message); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const dados = useMemo(() => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - periodo + 1);
    const agrupado = new Map();
    for (const cliente of clientes) {
      const chave = chaveData(cliente.criado_em);
      if (chave) agrupado.set(chave, (agrupado.get(chave) || 0) + 1);
    }
    const cadastros = Array.from({ length: periodo }, (_, indice) => {
      const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + indice);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
      return { data: chave, clientes: agrupado.get(chave) || 0 };
    });
    const reunioesRecentes = [...reunioes]
      .sort((a, b) => new Date(b.momento_abertura) - new Date(a.momento_abertura))
      .map((item) => ({
        id: item.id_reuniao,
        cliente: item.nome_usuario || "Cliente",
        data: item.momento_abertura,
        proximosPassos: item.proximos_passos,
      }));
    return {
      filiado,
      resumo: {
        clientesAtivos: clientes.filter((cliente) => cliente.status === "Ativo").length,
        reunioesRegistradas: reunioes.length,
        alertasAtivos: null,
        alertasCriticos: null,
        ocorrenciasAbertas: null,
      },
      economia: null,
      cadastros,
      alertasPorSeveridade: null,
      clientesAtencao: [...clientes]
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .slice(0, 5)
        .map((cliente) => ({
          id: cliente.id_usuario,
          nome: cliente.nome,
          status: cliente.status === "Ativo" ? "normal" : "atencao",
          rotuloStatus: cliente.status,
          data: cliente.criado_em,
        })),
      reunioes: reunioesRecentes,
      atualizadoEm: new Date().toISOString(),
    };
  }, [clientes, reunioes, filiado, periodo]);

  return (
    <main className="aff-dash">
      <BotaoVoltar />
      {erro ? <p role="alert" className="aff-vazio">{erro}</p> : carregando ? <p className="aff-vazio" role="status">Carregando dados da carteira...</p> : dados.resumo.clientesAtivos === 0 ? (
        <div className="aff-dash__corpo">
          <Cabecalho dados={dados} frase="Sua carteira ainda não tem clientes ativos." />
          <section className="aff-panel" aria-labelledby="aff-cadastros-titulo">
            <div className="aff-panel__head"><div><h2 id="aff-cadastros-titulo">Novos clientes cadastrados</h2><p>Quantidade de cadastros por dia</p></div></div>
            <GraficoCadastros serie={dados.cadastros} periodo={periodo} />
            <Link href={ROTAS.cadastrarCliente} className="aff-btn">Cadastrar cliente</Link>
          </section>
        </div>
      ) : (
        <div className="aff-dash__corpo">
          <Cabecalho dados={dados} frase={fraseResumo(dados.resumo)} />
          <Kpis dados={dados} periodo={periodo} />
          <Graficos dados={dados} periodo={periodo} onPeriodoChange={setPeriodo} />
          <section className="aff-dash__listas" aria-label="Acompanhamento da carteira">
            <ClientesAtencao itens={dados.clientesAtencao} />
            <UltimasReunioes itens={dados.reunioes} />
          </section>
        </div>
      )}
    </main>
  );
}

function fraseResumo({ clientesAtivos, reunioesRegistradas }) {
  return `${plural(clientesAtivos, "cliente ativo", "clientes ativos")} · ${plural(
    reunioesRegistradas,
    "reunião registrada",
    "reuniões registradas",
  )} na sua carteira.`;
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

  return (
    <section className="aff-dash__kpis" aria-label="Indicadores da carteira">
      <Link href={ROTAS.clientes} className="aff-kpi aff-kpi--link">
        <span className="aff-kpi__label">Clientes cadastrados</span>
        <strong className="aff-kpi__valor">{formatarInteiro(resumo.clientesAtivos)}</strong>
        <span className="aff-kpi__nota">Ver meus clientes →</span>
      </Link>

      <div className="aff-kpi">
        <span className="aff-kpi__label">Reuniões registradas</span>
        <strong className="aff-kpi__valor">{formatarInteiro(resumo.reunioesRegistradas)}</strong>
        <span className="aff-kpi__nota">Ver histórico de encontros</span>
      </div>

      <div className="aff-kpi">
        <span className="aff-kpi__label">Alertas ativos</span>
        <strong className="aff-kpi__valor"><span aria-label="Indisponível">—</span></strong>
        <span className="aff-kpi__nota">Consulta indisponível para afiliados</span>
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

function Graficos({ dados, periodo, onPeriodoChange }) {
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
              <button key={p} type="button" onClick={() => onPeriodoChange(p)} aria-pressed={p === periodo}>
                {p} dias
              </button>
            ))}
          </nav>
        </div>
        <GraficoCadastros serie={dados.cadastros} periodo={periodo} />
      </div>

      <div className="aff-panel">
        <div className="aff-panel__head">
          <div>
            <h2>Alertas por severidade</h2>
            <p>Consulta de alertas indisponível para afiliados</p>
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
  if (!valores) return <p className="aff-vazio">O backend ainda não disponibiliza dados de alertas para esta carteira.</p>;
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
          <h2>Clientes recentes</h2>
          <p>Cadastros da sua carteira</p>
        </div>
        <Link href={ROTAS.clientes} className="aff-link">Ver todos →</Link>
      </div>

      {itens.length === 0 ? (
        <p className="aff-vazio aff-status--normal">
          Nenhum cliente cadastrado na sua carteira.
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
                  <span className="aff-linha__status">{c.rotuloStatus}</span>
                  <span className="aff-linha__meta">{formatarDataHora(c.data)}</span>
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
