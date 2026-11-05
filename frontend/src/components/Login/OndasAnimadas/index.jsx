import "./ondasAnimadas.css";

const LARGURA_SEGMENTO = 320;
const TOTAL_SEGMENTOS = 16;
const LARGURA_TOTAL = LARGURA_SEGMENTO * TOTAL_SEGMENTOS;
const FOLGA_INFERIOR = 16;

export const CAMADAS_PADRAO = [
  { altura: 130, linhaBase: 52, amplitude: 44, cor: "var(--cor-azul-claro)", opacidade: 0.7, espuma: true, sentido: "esquerda", duracao: 18, duracaoFlutuacao: 7, atraso: 0 },
  { altura: 100, linhaBase: 44, amplitude: 34, cor: "var(--cor-azul-agua)", opacidade: 1, espuma: true, sentido: "direita", duracao: 13, duracaoFlutuacao: 5, atraso: -2 },
  { altura: 72, linhaBase: 36, amplitude: 26, cor: "var(--cor-azul-profundo)", opacidade: 1, espuma: false, sentido: "esquerda", duracao: 10, duracaoFlutuacao: 6, atraso: -1 },
];

function gerarCaminhoOnda(alturaTotal, linhaBase, amplitude) {
  const continuacao = `t${LARGURA_SEGMENTO} 0`.repeat(TOTAL_SEGMENTOS - 1);
  return `M0 ${linhaBase}q${LARGURA_SEGMENTO / 2} -${amplitude} ${LARGURA_SEGMENTO} 0${continuacao}V${alturaTotal}H0Z`;
}

export default function OndasAnimadas({
  camadas = CAMADAS_PADRAO,
  posicao = "dentro",
}) {
  const alturaMaxima = Math.max(...camadas.map((camada) => camada.altura));

  return (
    <div
      className={`ondas ondas--${posicao}`}
      style={{ height: alturaMaxima, "--folga-ondas": `${FOLGA_INFERIOR}px` }}
      aria-hidden="true"
    >
      {camadas.map((camada, indice) => {
        const alturaTotal = camada.altura + FOLGA_INFERIOR;
        return (
          <div
            key={indice}
            className="ondas__flutuacao"
            style={{
              height: alturaTotal,
              "--duracao-flutuacao": `${camada.duracaoFlutuacao}s`,
              "--atraso": `${camada.atraso}s`,
            }}
          >
            <svg
              className={`ondas__svg ondas__svg--${camada.sentido}`}
              width={LARGURA_TOTAL}
              height={alturaTotal}
              viewBox={`0 0 ${LARGURA_TOTAL} ${alturaTotal}`}
              style={{ "--duracao": `${camada.duracao}s` }}
            >
              <path
                d={gerarCaminhoOnda(alturaTotal, camada.linhaBase, camada.amplitude)}
                style={{ fill: camada.cor, opacity: camada.opacidade }}
              />
              {camada.espuma && (
                <path
                  d={gerarCaminhoOnda(
                    alturaTotal,
                    camada.linhaBase,
                    camada.amplitude
                  ).split("V")[0]}
                  style={{
                    fill: "none",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                    strokeLinecap: "round",
                    opacity: 0.6,
                  }}
                />
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
