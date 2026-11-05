import "./bolhasSubindo.css";

// Gerador determinístico: a mesma semente produz sempre o mesmo conjunto de bolhas.
function criarGerador(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296;
    return estado / 4294967296;
  };
}

export default function BolhasSubindo({
  variante = "clara",
  quantidade = 24,
  semente = 7,
}) {
  const proximo = criarGerador(semente);

  const bolhas = Array.from({ length: quantidade }, (_, indice) => ({
    id: indice,
    esquerda: proximo() * 100,
    tamanho: 6 + proximo() * 22,
    duracao: 9 + proximo() * 12,
    atraso: -proximo() * 18,
    deriva: (proximo() - 0.5) * 120,
    opacidade: 0.25 + proximo() * 0.55,
  }));

  return (
    <div
      className={`bolhas bolhas--${variante}`}
      aria-hidden="true"
    >
      {bolhas.map((bolha) => (
        <span
          key={bolha.id}
          className="bolhas__bolha"
          style={{
            left: `${bolha.esquerda}%`,
            width: `${bolha.tamanho}px`,
            height: `${bolha.tamanho}px`,
            "--duracao": `${bolha.duracao}s`,
            "--atraso": `${bolha.atraso}s`,
            "--deriva": `${bolha.deriva}px`,
            "--opacidade": bolha.opacidade,
          }}
        />
      ))}
    </div>
  );
}
