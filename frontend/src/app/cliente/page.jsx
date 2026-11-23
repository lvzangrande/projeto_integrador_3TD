// Módulos da área do cliente (documentação, seção 4) que têm tabela no banco.
const modulos = [
  {
    titulo: "Reservatórios e setores",
    descricao: "Capacidade, localização e tipo de cada reservatório e seus setores.",
    icone: (
      <>
        <path d="M4 20V8l8-4 8 4v12" />
        <path d="M7 20v-7h10v7M9 9h.01M15 9h.01" />
      </>
    ),
  },
  {
    titulo: "Medidores e responsáveis",
    descricao: "Medidores de nível, vazão e hidrômetro e quem responde por cada reservatório.",
    icone: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m12 12 3-3M12 7v1m5 4h-1M8 12H7" />
      </>
    ),
  },
  {
    titulo: "Leituras",
    descricao: "Registro manual ou simulado e histórico por medidor e período.",
    icone: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  },
  {
    titulo: "Limites",
    descricao: "Nível mínimo e máximo dos reservatórios e consumo máximo diário dos setores.",
    icone: (
      <>
        <path d="M4 5h16M4 19h16" />
        <path d="M12 8v8m-3-5 3-3 3 3m-6 2 3 3 3-3" />
      </>
    ),
  },
  {
    titulo: "Ocorrências",
    descricao: "Vazamentos e anomalias, com severidade, volume perdido e andamento do reparo.",
    icone: (
      <>
        <path d="M12 3 2.8 20h18.4L12 3Z" />
        <path d="M12 9v4m0 3h.01" />
      </>
    ),
  },
];

export default function ClienteHome() {
  return (
    <main className="cliente-home">
      <header className="cliente-home__intro">
        <p className="cliente-home__eyebrow">PAINEL DO CLIENTE</p>
        <h1>Gestão hídrica da sua operação</h1>
        <p>Consulte a estrutura, as leituras e as ocorrências de água em um só lugar.</p>
      </header>
      <section className="cliente-home__modulos" aria-label="Módulos da área do cliente">
        {modulos.map((modulo) => (
          <article className="cliente-modulo" key={modulo.titulo}>
            <span className="cliente-modulo__icone" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {modulo.icone}
              </svg>
            </span>
            <h2>{modulo.titulo}</h2>
            <p>{modulo.descricao}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
