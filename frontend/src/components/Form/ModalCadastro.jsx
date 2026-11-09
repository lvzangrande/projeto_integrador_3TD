"use client";

import { useId } from "react";
import "./formbase.css";
import "./ModalCadastro.css";

/* Invólucro visual do formulário: cartão com cabeçalho (ícone, título, subtítulo),
 * corpo e rodapé. Não inclui overlay/escurecimento de fundo — se for usar como modal,
 * envolva em seu próprio overlay (ou <dialog>) e controle a abertura por fora.
 *
 * Props:
 *  - icone      componente de ícone do avatar do cabeçalho
 *  - titulo     título principal
 *  - subtitulo  texto de apoio em ciano
 *  - children   conteúdo do corpo
 *  - rodape     nó renderizado no rodapé (botões)
 */
export default function ModalCadastro({ icone: Icone, titulo, subtitulo, children, rodape }) {
  const tituloId = useId();

  return (
    <section className="cf-card" aria-labelledby={tituloId}>
      {/* Pontos decorativos nos cantos */}
      <span className="cf-dots" aria-hidden="true">
        <i /><i /><i /><i />
      </span>

      <header className="cf-card__header">
        {Icone && (
          <span className="cf-avatar" aria-hidden="true">
            <Icone size={40} />
          </span>
        )}
        <div>
          <h2 id={tituloId} className="cf-card__titulo">
            {titulo}
          </h2>
          {subtitulo && <p className="cf-card__sub">{subtitulo}</p>}
        </div>
      </header>

      <div className="cf-card__body">{children}</div>

      <footer className="cf-card__footer">
        {/* Onda decorativa no canto inferior esquerdo */}
        <svg
          className="cf-onda"
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cf-onda-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1ea7ff" stopOpacity=".28" />
              <stop offset="1" stopColor="#1ea7ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cf-onda-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4fd6ff" stopOpacity=".7" />
              <stop offset="1" stopColor="#4fd6ff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 40 C 50 18, 100 18, 150 36 S 250 58, 300 44 S 370 30, 400 36 L400 70 L0 70 Z"
            fill="url(#cf-onda-fill)"
          />
          <path
            d="M0 40 C 50 18, 100 18, 150 36 S 250 58, 300 44 S 370 30, 400 36"
            fill="none"
            stroke="url(#cf-onda-line)"
            strokeWidth="1.5"
          />
        </svg>

        {rodape}
      </footer>
    </section>
  );
}