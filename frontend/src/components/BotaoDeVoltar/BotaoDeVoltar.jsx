"use client";
import "./BotaoDeVoltar.css";

export default function BotaoVoltar({ onClick = () => window.history.back(), texto = "Voltar" }) {
  return (
    <button type="button" className="botao-voltar" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {texto}
    </button>
  );
}