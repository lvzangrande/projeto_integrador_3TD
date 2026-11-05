import "./aguaViva.css";

// Tentáculos: posição, curva, comprimento e atraso de cada fio.
const TENTACULOS = [
  { x: 120, curva: 26, comprimento: 300, atraso: 0 },
  { x: 143, curva: -22, comprimento: 340, atraso: -0.6 },
  { x: 166, curva: 24, comprimento: 260, atraso: -1.2 },
  { x: 188, curva: -28, comprimento: 350, atraso: -1.8 },
  { x: 210, curva: 26, comprimento: 300, atraso: -2.4 },
  { x: 232, curva: -24, comprimento: 330, atraso: -3 },
  { x: 255, curva: 22, comprimento: 270, atraso: -3.6 },
  { x: 278, curva: -26, comprimento: 310, atraso: -4.2 },
];

export default function AguaViva({ sufixo = "a" }) {
  const idCorpo = `agua-viva-corpo-${sufixo}`;
  const idBrilho = `agua-viva-brilho-${sufixo}`;

  return (
    <div className="agua-viva" aria-hidden="true">
      <svg
        className="agua-viva__tela"
        viewBox="0 0 400 600"
        role="presentation"
      >
        <defs>
          <radialGradient id={idCorpo} cx="38%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#9fe4ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22a6d9" stopOpacity="0.35" />
          </radialGradient>
          <filter id={idBrilho} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* halo luminoso atrás do corpo */}
        <ellipse
          className="agua-viva__halo"
          cx="200"
          cy="160"
          rx="120"
          ry="86"
          fill="#7fd3f0"
          filter={`url(#${idBrilho})`}
        />

        {TENTACULOS.map((tentaculo) => (
          <path
            key={tentaculo.x}
            className="agua-viva__tentaculo"
            style={{ animationDelay: `${tentaculo.atraso}s` }}
            d={`M${tentaculo.x} 214C${tentaculo.x - tentaculo.curva} ${
              214 + tentaculo.comprimento * 0.34
            } ${tentaculo.x + tentaculo.curva} ${
              214 + tentaculo.comprimento * 0.68
            } ${tentaculo.x} ${214 + tentaculo.comprimento}`}
            strokeWidth="6"
          />
        ))}

        {/* campânula */}
        <path
          className="agua-viva__campanula"
          d="M200 40C118 40 62 104 62 172C62 208 96 216 200 216C304 216 338 208 338 172C338 104 282 40 200 40Z"
          fill={`url(#${idCorpo})`}
        />
        <path
          className="agua-viva__dobra"
          d="M120 196C150 182 250 182 280 196"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.6"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
