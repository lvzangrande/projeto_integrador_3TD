"use client";

import { useEffect, useState } from "react";
import "./AffiliateHeader.css";


export function getSaudacao(date = new Date()) {
  const hora = date.getHours();
  if (hora >= 5 && hora < 12) return "Bom dia!";
  if (hora >= 12 && hora < 18) return "Boa tarde!";
  return "Boa noite!";
}

export default function AffiliateHeader({ nome = "NOME AFILIADO", onSair }) {
  const [saudacao, setSaudacao] = useState("Olá!");

  useEffect(() => {
    const atualizar = () => setSaudacao(getSaudacao());
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="affiliate-header">
      <button type="button" className="affiliate-header__sair" onClick={onSair} aria-label="Sair">
        <span className="affiliate-header__sair-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </span>
        <span className="affiliate-header__sair-texto">SAIR</span>
      </button>
      <div className="affiliate-header__titulo">
        <p className="affiliate-header__saudacao">{saudacao}</p>
        <p className="affiliate-header__nome">{nome}</p>
      </div>
    </header>
  );
}