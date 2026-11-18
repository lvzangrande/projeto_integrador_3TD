const RAIO = 56;
const CENTRO = 65;

function gerarOnda(nivelY) {
  return `M0 ${nivelY}q15 -9 30 0t30 0t30 0t30 0t30 0t30 0t30 0t30 0V130H0Z`;
}

export default function MedidorAgua({ nivel = 0.55 }) {
  const nivelY = CENTRO + RAIO - nivel * RAIO * 2;

  return (
    <svg className="medidor" viewBox="0 0 130 130" role="img" aria-label="Medidor de água">
      <defs>
        <clipPath id="recorte-medidor">
          <circle cx={CENTRO} cy={CENTRO} r={RAIO} />
        </clipPath>
      </defs>
      <circle cx={CENTRO} cy={CENTRO} r={RAIO + 4} fill="rgba(255,255,255,0.55)" stroke="#0b4f8a" strokeWidth="4" />
      <g clipPath="url(#recorte-medidor)">
        <path className="medidor__onda medidor__onda--fundo" d={gerarOnda(nivelY - 7)} />
        <path className="medidor__onda medidor__onda--frente" d={gerarOnda(nivelY)} />
        <ellipse cx="42" cy="44" rx="14" ry="7" fill="#fff" opacity="0.35" transform="rotate(-30 42 44)" />
      </g>
    </svg>
  );
}
