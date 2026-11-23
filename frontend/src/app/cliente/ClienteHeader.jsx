"use client";

import { useEffect, useState } from "react";

function getSaudacao(date = new Date()) {
  const hora = date.getHours();
  if (hora >= 5 && hora < 12) return "Bom dia!";
  if (hora >= 12 && hora < 18) return "Boa tarde!";
  return "Boa noite!";
}

export default function ClienteHeader({ nome, onSair }) {
  const [saudacao, setSaudacao] = useState("Olá!");

  useEffect(() => {
    setSaudacao(getSaudacao());
  }, []);

  return (
    <header className="cliente-header">
      <button type="button" className="cliente-header__sair" onClick={onSair} aria-label="Sair">
        <span className="cliente-header__sair-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </span>
        <span>SAIR</span>
      </button>
      <div className="cliente-header__titulo">
        <p className="cliente-header__saudacao">{saudacao}</p>
        <p className="cliente-header__nome">{nome}</p>
      </div>
    </header>
  );
}
