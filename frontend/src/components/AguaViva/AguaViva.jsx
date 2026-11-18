const TENTACULOS = [
  { x: 78, comprimento: 420 },
  { x: 108, comprimento: 470 },
  { x: 138, comprimento: 440 },
  { x: 168, comprimento: 500 },
  { x: 200, comprimento: 470 },
  { x: 232, comprimento: 500 },
  { x: 262, comprimento: 440 },
  { x: 292, comprimento: 470 },
  { x: 322, comprimento: 420 },
];

const BRACOS = [
  "M176 238C150 300 206 332 172 402C152 442 192 470 176 522",
  "M200 240C192 312 220 352 198 432C190 470 210 492 200 540",
  "M224 238C250 300 194 332 228 402C248 442 208 470 224 522",
];

const COSTELAS = [64, 100, 140, 170, 230, 260, 300, 336];
const FOLHAS_CENTRAIS = [45, 135, 225, 315];
const BORDA_SINO =
  "M44 236C44 112 112 36 200 36S356 112 356 236C328 218 306 250 276 236C252 224 228 252 200 240C172 252 148 224 124 236C94 250 72 218 44 236Z";

function caminhoTentaculo({ x, comprimento }) {
  const topo = 236;
  const ponto = (fracao) => topo + comprimento * fracao;
  return `M${x} ${topo}C${x - 18} ${ponto(0.25)} ${x + 20} ${ponto(0.5)} ${x} ${ponto(0.7)}S${x + 14} ${ponto(0.92)} ${x - 4} ${ponto(1)}`;
}

export default function AguaViva({ sufixo = "principal" }) {
  return (
    <svg className="agua-viva" viewBox="0 0 400 600" role="img" aria-label="Ilustração de uma água-viva luminosa">
      <defs>
        <linearGradient id={`sino-${sufixo}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2fbff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#8fdcf7" stopOpacity="0.85" />
          <stop offset="1" stopColor="#1f8ed1" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id={`aura-${sufixo}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7fd3f0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#7fd3f0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fio-${sufixo}`} gradientUnits="userSpaceOnUse" x1="0" y1="236" x2="0" y2="740">
          <stop offset="0" stopColor="#bfe6f7" />
          <stop offset="1" stopColor="#22a6d9" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle className="agua-viva__aura" cx="200" cy="190" r="260" fill={`url(#aura-${sufixo})`} />

      {BRACOS.map((caminho, indice) => (
        <path
          key={caminho}
          className="agua-viva__braco"
          style={{ animationDelay: `${indice * -1.1}s` }}
          d={caminho}
          fill="none"
          stroke="#cfefff"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.5"
        />
      ))}

      {TENTACULOS.map((tentaculo, indice) => (
        <path
          key={tentaculo.x}
          className="agua-viva__tentaculo"
          style={{ animationDelay: `${indice * -0.7}s` }}
          d={caminhoTentaculo(tentaculo)}
          fill="none"
          stroke={`url(#fio-${sufixo})`}
          strokeWidth={indice % 2 === 0 ? 3 : 5}
          strokeDasharray={indice % 2 === 0 ? undefined : "1 9"}
          strokeLinecap="round"
        />
      ))}

      <g className="agua-viva__sino">
        <path d={BORDA_SINO} fill={`url(#sino-${sufixo})`} />
        {COSTELAS.map((xFinal) => (
          <path
            key={xFinal}
            d={`M200 46C${(200 + xFinal) / 2} 90 ${xFinal + (200 - xFinal) * 0.1} 160 ${xFinal} 232`}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
        ))}
        {FOLHAS_CENTRAIS.map((angulo) => (
          <ellipse
            key={angulo}
            cx="200"
            cy="118"
            rx="13"
            ry="30"
            fill="#ffffff"
            opacity="0.38"
            transform={`rotate(${angulo} 200 150)`}
          />
        ))}
        <circle cx="200" cy="150" r="9" fill="#ffffff" opacity="0.7" />
        <path d={BORDA_SINO} fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
        <ellipse cx="140" cy="92" rx="48" ry="17" fill="#ffffff" opacity="0.55" transform="rotate(-28 140 92)" />
        <ellipse cx="96" cy="150" rx="9" ry="4" fill="#ffffff" opacity="0.5" transform="rotate(-50 96 150)" />
      </g>
    </svg>
  );
}
