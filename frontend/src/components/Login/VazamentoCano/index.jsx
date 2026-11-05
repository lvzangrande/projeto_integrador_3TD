import "./vazamentoCano.css";

const POSICAO_BURACO = 380;
const GOTAS = [
  { x: 380, atraso: 0 },
  { x: 378, atraso: -0.8 },
  { x: 382, atraso: -1.6 },
];

export default function VazamentoCano() {
  return (
    <svg
      className="cano"
      viewBox="0 0 1400 520"
      role="img"
      aria-label="Cano com vazamento pingando"
    >
      <rect x="0" y="40" width="1400" height="84" fill="#9fb3c4" />
      <rect x="0" y="92" width="1400" height="32" fill="#7f95a8" />
      <rect x="0" y="44" width="1400" height="12" fill="#ffffff" opacity="0.28" />
      <rect x="230" y="20" width="36" height="124" rx="8" fill="#5b7389" />
      <rect x="500" y="20" width="36" height="124" rx="8" fill="#5b7389" />
      {[230, 500].map((x) =>
        [34, 130].map((y) => (
          <circle key={`${x}-${y}`} cx={x + 18} cy={y} r="5" fill="#8fa8bc" />
        ))
      )}
      <ellipse cx={POSICAO_BURACO} cy="118" rx="40" ry="12" fill="#0b2a4a" />
      <ellipse
        cx={POSICAO_BURACO}
        cy="484"
        rx="62"
        ry="8"
        fill="#22a6d9"
        opacity="0.35"
      />

      {GOTAS.map((gota) => (
        <ellipse
          key={`ondulacao-${gota.atraso}`}
          className="cano__ondulacao"
          style={{ animationDelay: `${gota.atraso}s` }}
          cx={POSICAO_BURACO}
          cy="484"
          rx="70"
          ry="10"
          fill="none"
          stroke="#7fd3f0"
          strokeWidth="2"
        />
      ))}

      {GOTAS.map((gota) => (
        <path
          key={`gota-${gota.atraso}`}
          className="cano__gota"
          style={{ animationDelay: `${gota.atraso}s` }}
          d={`M${gota.x} 134C${gota.x + 12} 158 ${gota.x + 18} 168 ${
            gota.x + 18
          } 178A18 18 0 0 1 ${gota.x - 18} 178C${gota.x - 18} 168 ${
            gota.x - 12
          } 158 ${gota.x} 134Z`}
          fill="#22a6d9"
        />
      ))}
    </svg>
  );
}
