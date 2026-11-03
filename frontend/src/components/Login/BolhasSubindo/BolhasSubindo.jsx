function criarGerador(semente) {
  let estado = semente;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BolhasSubindo({ quantidade = 24, variante = "clara", semente = 7 }) {
  const sortear = criarGerador(semente);
  const clara = variante === "clara";

  const bolhas = Array.from({ length: quantidade }, () => ({
    x: sortear() * 100,
    tamanho: clara ? 6 + sortear() * 34 : 2 + sortear() * 6,
    duracao: clara ? 10 + sortear() * 14 : 18 + sortear() * 20,
    atraso: -sortear() * 24,
    balanco: (sortear() - 0.5) * (clara ? 60 : 40),
  }));

  return (
    <div className={`bolhas bolhas--${variante}`} aria-hidden="true">
      {bolhas.map((bolha, indice) => (
        <span
          key={indice}
          className="bolhas__bolha"
          style={{
            "--x": `${bolha.x.toFixed(2)}%`,
            "--tamanho": `${bolha.tamanho.toFixed(1)}px`,
            "--duracao": `${bolha.duracao.toFixed(1)}s`,
            "--atraso": `${bolha.atraso.toFixed(1)}s`,
            "--balanco": `${bolha.balanco.toFixed(0)}px`,
          }}
        />
      ))}
    </div>
  );
}
